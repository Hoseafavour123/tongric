export {
  BASE_TRANSLATIONS,
  DEFAULT_LOCALE,
  getDefaultDictionary,
  SUPPORTED_PILOT_LANGUAGES,
  type BaseTranslationDefinition,
  type PilotLanguageDefinition,
  type TranslationDictionary,
  type TranslationKeyId,
} from "./base-dictionary.ts";
export {
  BENUE_LGAS,
  DELIVERY_MILESTONE_LABEL_KEYS,
  estimateWeightKg,
  ORDER_STATUS_LABEL_KEYS,
  PRODUCE_CROP_CATALOG,
  PRODUCE_UNIT_CATALOG,
  VERIFICATION_STATUS_LABEL_KEYS,
  type CropCatalogItem,
  type CropCategoryGroup,
  type LgaDefinition,
  type ProduceCropCode,
  type ProduceUnitCode,
  type ProduceUnitItem,
} from "./catalogs.ts";
export {
  createTranslator,
  interpolateParams,
  type TranslationParams,
  type TranslatorFn,
} from "./translator.ts";
export type {
  LocaleDictionaryPayload,
  PublicLanguageSummary,
  TranslationEntryRecord,
  TranslationReviewStatus,
} from "./i18n-core.ts";
