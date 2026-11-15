import type { PrismaClient } from "@prisma/client";
import { BASE_TRANSLATIONS } from "./base-dictionary.ts";
import type { I18nRepository } from "./i18n-core.ts";

/**
 * Builds an I18nRepository backed by PrismaClient (shared between server runtime and CLI sync).
 */
export function createPrismaI18nRepository(db: PrismaClient): I18nRepository {
  return {
    async listActiveLanguages() {
      const [languages, totalKeysInDb, groupedValidated] = await Promise.all([
        db.language.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
          select: {
            code: true,
            name: true,
            nativeName: true,
            isDefault: true,
            isPilotPriority: true,
          },
        }),
        db.translationKey.count(),
        db.translationEntry.groupBy({
          by: ["languageCode"],
          where: {
            status: "VALIDATED",
            text: { not: "" },
          },
          _count: { _all: true },
        }),
      ]);

      const totalKeyCount = Math.max(
        totalKeysInDb,
        Object.keys(BASE_TRANSLATIONS).length,
      );
      const countByLang = new Map<string, number>();
      for (const row of groupedValidated) {
        countByLang.set(row.languageCode, row._count._all);
      }

      return languages.map((lang) => ({
        ...lang,
        validatedCount: countByLang.get(lang.code) ?? 0,
        totalKeyCount,
      }));
    },

    async listValidatedEntriesForLocale(locale) {
      const rows = await db.translationEntry.findMany({
        where: {
          languageCode: locale,
          status: "VALIDATED",
          text: { not: "" },
        },
        select: {
          text: true,
          status: true,
          translationKey: {
            select: { key: true },
          },
        },
      });

      return rows.map((row) => ({
        key: row.translationKey.key,
        text: row.text,
        status: row.status,
      }));
    },

    async upsertLanguage(lang) {
      await db.language.upsert({
        where: { code: lang.code },
        update: {
          name: lang.name,
          nativeName: lang.nativeName,
          isDefault: lang.isDefault,
          isPilotPriority: lang.isPilotPriority,
          sortOrder: lang.sortOrder,
        },
        create: {
          code: lang.code,
          name: lang.name,
          nativeName: lang.nativeName,
          isActive: true,
          isDefault: lang.isDefault,
          isPilotPriority: lang.isPilotPriority,
          sortOrder: lang.sortOrder,
        },
      });
    },

    async upsertTranslationKey(input) {
      return db.translationKey.upsert({
        where: { key: input.key },
        update: {
          namespace: input.namespace,
          description: input.description,
          defaultText: input.defaultText,
        },
        create: {
          namespace: input.namespace,
          key: input.key,
          description: input.description,
          defaultText: input.defaultText,
        },
        select: { id: true },
      });
    },

    async ensureTranslationEntry(input) {
      if (input.isDefaultLocale) {
        await db.translationEntry.upsert({
          where: {
            translationKeyId_languageCode: {
              translationKeyId: input.translationKeyId,
              languageCode: input.languageCode,
            },
          },
          update: {
            text: input.defaultText,
            status: "VALIDATED",
          },
          create: {
            translationKeyId: input.translationKeyId,
            languageCode: input.languageCode,
            text: input.defaultText,
            status: "VALIDATED",
          },
        });
        return;
      }

      // Never overwrite existing human-edited REVIEWED or VALIDATED non-English entries.
      await db.translationEntry.upsert({
        where: {
          translationKeyId_languageCode: {
            translationKeyId: input.translationKeyId,
            languageCode: input.languageCode,
          },
        },
        update: {},
        create: {
          translationKeyId: input.translationKeyId,
          languageCode: input.languageCode,
          text: "",
          status: "DRAFT",
        },
      });
    },
  };
}
