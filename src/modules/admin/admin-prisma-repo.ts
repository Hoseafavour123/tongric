import type { PrismaClient } from "@prisma/client";
import type { AdminRepository } from "./admin-repo.ts";
import type {
  AdminDashboardMetrics,
  AdminDisputeSummary,
  AdminUserFilterInput,
  AdminUserSummary,
  AdminAuditLogsFilterInput,
  AuditLogSummary,
  ResolveDisputeInput,
  AccountStatus,
} from "./schemas.ts";
import type { OrderDetailSummary } from "@/modules/orders/schemas";

export function createPrismaAdminRepository(db: PrismaClient): AdminRepository {
  return {
    async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
      const [
        totalUsers,
        activeFarmers,
        activeBuyers,
        activeTransporters,
        pendingVerifications,
        activeDisputes,
        totalOrders,
        totalAuditLogs,
      ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { role: "FARMER", accountStatus: "ACTIVE" } }),
        db.user.count({ where: { role: "BUYER", accountStatus: "ACTIVE" } }),
        db.user.count({ where: { role: "TRANSPORT_PROVIDER", accountStatus: "ACTIVE" } }),
        db.verificationDocument.count({ where: { status: "PENDING" } }),
        db.order.count({ where: { status: "DISPUTED" } }),
        db.order.count(),
        db.auditLog.count(),
      ]);

      return {
        totalUsers,
        activeFarmers,
        activeBuyers,
        activeTransporters,
        pendingVerifications,
        activeDisputes,
        totalOrders,
        totalAuditLogs,
      };
    },

    async listUsers(filter: AdminUserFilterInput): Promise<{ users: AdminUserSummary[]; totalCount: number }> {
      const where: Record<string, unknown> = {};

      if (filter.role) {
        where.role = filter.role;
      }

      if (filter.status) {
        where.accountStatus = filter.status;
      }

      if (filter.search) {
        where.OR = [
          { fullName: { contains: filter.search, mode: "insensitive" } },
          { phoneNumber: { contains: filter.search } },
        ];
      }

      const page = filter.page || 1;
      const limit = filter.limit || 20;
      const skip = (page - 1) * limit;

      const [totalCount, rows] = await Promise.all([
        db.user.count({ where }),
        db.user.findMany({
          where,
          include: {
            assistedBy: { select: { fullName: true } },
            farmerProfile: { select: { verificationStatus: true } },
            buyerProfile: { select: { verificationStatus: true } },
            transportProfile: { select: { verificationStatus: true } },
            _count: {
              select: {
                listings: true,
                farmerOrders: true,
                buyerOrders: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
      ]);

      const users: AdminUserSummary[] = rows.map((u) => {
        let verificationStatus: string | null = null;
        if (u.role === "FARMER" && u.farmerProfile) {
          verificationStatus = u.farmerProfile.verificationStatus;
        } else if (u.role === "BUYER" && u.buyerProfile) {
          verificationStatus = u.buyerProfile.verificationStatus;
        } else if (u.role === "TRANSPORT_PROVIDER" && u.transportProfile) {
          verificationStatus = u.transportProfile.verificationStatus;
        }

        return {
          id: u.id,
          phoneNumber: u.phoneNumber,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          accountStatus: u.accountStatus,
          preferredLanguageCode: u.preferredLanguageCode,
          createdAt: u.createdAt.toISOString(),
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
          assistedByUserName: u.assistedBy?.fullName ?? null,
          verificationStatus,
          listingsCount: u._count.listings,
          ordersCount: u._count.farmerOrders + u._count.buyerOrders,
        };
      });

      return { users, totalCount };
    },

    async updateUserStatus(userId: string, status: AccountStatus, reason: string): Promise<AdminUserSummary> {
      void reason;
      const updated = await db.user.update({
        where: { id: userId },
        data: { accountStatus: status },
        include: {
          assistedBy: { select: { fullName: true } },
          farmerProfile: { select: { verificationStatus: true } },
          buyerProfile: { select: { verificationStatus: true } },
          transportProfile: { select: { verificationStatus: true } },
          _count: {
            select: {
              listings: true,
              farmerOrders: true,
              buyerOrders: true,
            },
          },
        },
      });

      let verificationStatus: string | null = null;
      if (updated.role === "FARMER" && updated.farmerProfile) {
        verificationStatus = updated.farmerProfile.verificationStatus;
      } else if (updated.role === "BUYER" && updated.buyerProfile) {
        verificationStatus = updated.buyerProfile.verificationStatus;
      } else if (updated.role === "TRANSPORT_PROVIDER" && updated.transportProfile) {
        verificationStatus = updated.transportProfile.verificationStatus;
      }

      return {
        id: updated.id,
        phoneNumber: updated.phoneNumber,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        accountStatus: updated.accountStatus,
        preferredLanguageCode: updated.preferredLanguageCode,
        createdAt: updated.createdAt.toISOString(),
        lastLoginAt: updated.lastLoginAt ? updated.lastLoginAt.toISOString() : null,
        assistedByUserName: updated.assistedBy?.fullName ?? null,
        verificationStatus,
        listingsCount: updated._count.listings,
        ordersCount: updated._count.farmerOrders + updated._count.buyerOrders,
      };
    },

    async listAuditLogs(filter: AdminAuditLogsFilterInput): Promise<{ logs: AuditLogSummary[]; totalCount: number }> {
      const where: Record<string, unknown> = {};

      if (filter.action) {
        where.action = { contains: filter.action, mode: "insensitive" };
      }

      if (filter.actorUserId) {
        where.actorUserId = filter.actorUserId;
      }

      if (filter.entityType) {
        where.entityType = filter.entityType;
      }

      if (filter.from || filter.to) {
        const createdAtFilter: Record<string, Date> = {};
        if (filter.from) {
          createdAtFilter.gte = new Date(filter.from);
        }
        if (filter.to) {
          createdAtFilter.lte = new Date(filter.to);
        }
        where.createdAt = createdAtFilter;
      }

      const page = filter.page || 1;
      const limit = filter.limit || 30;
      const skip = (page - 1) * limit;

      const [totalCount, rows] = await Promise.all([
        db.auditLog.count({ where }),
        db.auditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
      ]);

      // Resolve actor names
      const actorUserIds = Array.from(
        new Set(rows.map((r) => r.actorUserId).filter((id): id is string => Boolean(id))),
      );

      const actors = actorUserIds.length > 0
        ? await db.user.findMany({
            where: { id: { in: actorUserIds } },
            select: { id: true, fullName: true },
          })
        : [];

      const actorNameMap = new Map(actors.map((a) => [a.id, a.fullName]));

      const logs: AuditLogSummary[] = rows.map((r) => ({
        id: r.id,
        actorUserId: r.actorUserId,
        actorName: r.actorUserId ? actorNameMap.get(r.actorUserId) ?? null : null,
        action: r.action,
        entityType: r.entityType,
        entityId: r.entityId,
        metadata: r.metadata ? (r.metadata as Record<string, unknown>) : null,
        ipAddress: r.ipAddress,
        createdAt: r.createdAt.toISOString(),
      }));

      return { logs, totalCount };
    },

    async listDisputedOrders(): Promise<AdminDisputeSummary[]> {
      const rows = await db.order.findMany({
        where: { status: "DISPUTED" },
        include: {
          farmer: { select: { id: true, fullName: true, phoneNumber: true } },
          buyer: { select: { id: true, fullName: true, phoneNumber: true } },
          transporter: { select: { id: true, fullName: true, phoneNumber: true } },
          statusEvents: {
            where: { toStatus: "DISPUTED" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return rows.map((o) => {
        const disputeEvent = o.statusEvents[0];
        return {
          id: o.id,
          orderCode: o.orderCode,
          cropCode: o.cropCode,
          quantity: o.quantity,
          unitCode: o.unitCode,
          totalAmount: Number(o.totalAmount),
          status: o.status,
          disputeReason: disputeEvent?.note ?? null,
          disputedAt: disputeEvent?.createdAt ? disputeEvent.createdAt.toISOString() : o.updatedAt.toISOString(),
          farmer: {
            id: o.farmer.id,
            fullName: o.farmer.fullName,
            phoneNumber: o.farmer.phoneNumber,
          },
          buyer: {
            id: o.buyer.id,
            fullName: o.buyer.fullName,
            phoneNumber: o.buyer.phoneNumber,
          },
          transporter: o.transporter
            ? {
                id: o.transporter.id,
                fullName: o.transporter.fullName,
                phoneNumber: o.transporter.phoneNumber,
              }
            : null,
          createdAt: o.createdAt.toISOString(),
        };
      });
    },

    async resolveDispute(adminId: string, input: ResolveDisputeInput): Promise<OrderDetailSummary> {
      return db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: input.orderId },
          include: {
            listing: true,
            farmer: { select: { id: true, fullName: true, phoneNumber: true } },
            buyer: { select: { id: true, fullName: true, phoneNumber: true } },
            transporter: { select: { id: true, fullName: true, phoneNumber: true } },
          },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        const newStatus = input.outcome === "RESOLVE_COMPLETED" ? "COMPLETED" : "CANCELLED";

        if (input.outcome === "RESOLVE_CANCELLED" && input.restoreInventory !== false) {
          await tx.produceListing.update({
            where: { id: order.listingId },
            data: {
              quantity: { increment: order.quantity },
              status: "ACTIVE",
            },
          });
        }

        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: newStatus,
            cancellationReason:
              input.outcome === "RESOLVE_CANCELLED"
                ? `Arbitration Resolution: ${input.resolutionNote}`
                : order.cancellationReason,
          },
          include: {
            listing: true,
            farmer: { select: { id: true, fullName: true, phoneNumber: true } },
            buyer: { select: { id: true, fullName: true, phoneNumber: true } },
            transporter: { select: { id: true, fullName: true, phoneNumber: true } },
          },
        });

        await tx.orderStatusEvent.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: newStatus,
            changedById: adminId,
            note: `Admin Arbitration: ${input.resolutionNote}`,
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId: adminId,
            action: "ORDER_DISPUTE_RESOLVED",
            entityType: "order",
            entityId: order.id,
            metadata: {
              orderCode: order.orderCode,
              previousStatus: order.status,
              resolutionOutcome: input.outcome,
              resolutionNote: input.resolutionNote,
              inventoryRestored: input.outcome === "RESOLVE_CANCELLED" && input.restoreInventory !== false,
            },
          },
        });

        return {
          id: updatedOrder.id,
          orderCode: updatedOrder.orderCode,
          offerId: updatedOrder.offerId,
          listingId: updatedOrder.listingId,
          cropCode: updatedOrder.cropCode,
          quantity: updatedOrder.quantity,
          unitCode: updatedOrder.unitCode,
          estimatedWeightKg: updatedOrder.estimatedWeightKg,
          unitPrice: Number(updatedOrder.unitPrice),
          currency: updatedOrder.currency,
          totalAmount: Number(updatedOrder.totalAmount),
          fulfillmentMode: updatedOrder.fulfillmentMode,
          destinationLocation: updatedOrder.destinationLocation,
          proposedCollectionDate: updatedOrder.proposedCollectionDate
            ? updatedOrder.proposedCollectionDate.toISOString()
            : null,
          status: updatedOrder.status,
          paymentArrangementNote: updatedOrder.paymentArrangementNote,
          cancellationReason: updatedOrder.cancellationReason,
          farmerId: updatedOrder.farmerId,
          farmerName: updatedOrder.farmer.fullName,
          farmerPhone: updatedOrder.farmer.phoneNumber,
          buyerId: updatedOrder.buyerId,
          buyerName: updatedOrder.buyer.fullName,
          buyerPhone: updatedOrder.buyer.phoneNumber,
          transporterId: updatedOrder.transporterId,
          statusEvents: [],
          createdAt: updatedOrder.createdAt.toISOString(),
          updatedAt: updatedOrder.updatedAt.toISOString(),
        };
      });
    },
  };
}
