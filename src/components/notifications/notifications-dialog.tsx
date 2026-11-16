"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Package, ShoppingBag, Truck, AlertCircle, ExternalLink } from "lucide-react";
import { Dialog, Badge, Button, EmptyState, LoadingSkeleton } from "@/components/ui";
import { useI18n } from "@/components/i18n/i18n-provider";
import { cn } from "@/lib/cn";
import type { NotificationCategory, NotificationSummary } from "@/modules/notifications/schemas";

export interface NotificationsDialogProps {
  compact?: boolean;
}

export function NotificationsDialog({ compact }: NotificationsDialogProps) {
  const { t } = useI18n();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Fetch initial unread count on mount
  useEffect(() => {
    let active = true;
    fetch("/api/notifications?limit=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.ok && json.data) {
          setUnreadCount(json.data.unreadCount ?? 0);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  function loadNotifications(selectedFilter: "all" | "unread") {
    setIsLoading(true);
    const query = selectedFilter === "unread" ? "?unreadOnly=true&limit=30" : "?limit=30";
    fetch(`/api/notifications${query}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.ok && json.data) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount ?? 0);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleOpen() {
    setIsOpen(true);
    loadNotifications(filter);
  }

  function handleFilterChange(newFilter: "all" | "unread") {
    setFilter(newFilter);
    loadNotifications(newFilter);
  }

  async function handleMarkRead(notification: NotificationSummary) {
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: "PATCH",
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Silently continue navigation even if mark read fails
      }
    }

    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl);
    }
  }

  async function handleMarkAllAsRead() {
    setIsMarkingAll(true);
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "POST",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } finally {
      setIsMarkingAll(false);
    }
  }

  function getCategoryIcon(cat: NotificationCategory) {
    switch (cat) {
      case "OFFER_ACTIVITY":
        return <ShoppingBag className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
      case "ORDER_STATUS":
        return <Package className="h-4 w-4 text-blue-600" aria-hidden="true" />;
      case "TRANSPORT_DISPATCH":
        return <Truck className="h-4 w-4 text-amber-600" aria-hidden="true" />;
      case "SYSTEM_ALERT":
      default:
        return <AlertCircle className="h-4 w-4 text-purple-600" aria-hidden="true" />;
    }
  }

  function getCategoryLabel(cat: NotificationCategory) {
    switch (cat) {
      case "OFFER_ACTIVITY":
        return t("notifications.category.offer");
      case "ORDER_STATUS":
        return t("notifications.category.order");
      case "TRANSPORT_DISPATCH":
        return t("notifications.category.transport");
      case "SYSTEM_ALERT":
      default:
        return t("notifications.category.system");
    }
  }

  function formatRelativeDate(isoDate: string) {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return t("notifications.justNow");
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return isoDate;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={t("notifications.title")}
        title={t("notifications.title")}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600",
          compact ? "h-9 w-9" : "h-9 w-9 sm:w-auto sm:px-2.5 sm:gap-1.5",
        )}
      >
        <Bell className="h-4 w-4 text-gray-700" aria-hidden="true" />
        {!compact && (
          <span className="hidden text-xs font-semibold sm:inline">
            {t("notifications.title")}
          </span>
        )}
        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse"
            aria-label={`${unreadCount} ${t("notifications.unreadCount")}`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={t("notifications.title")}
        description={t("notifications.emptyDesc")}
        className="max-w-lg"
      >
        <div className="flex flex-col gap-3">
          {/* Controls Bar: Filter tabs + Mark all as read */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                  filter === "all"
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                )}
              >
                {t("notifications.allTab")}
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("unread")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                  filter === "unread"
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                )}
              >
                {t("notifications.unreadTab")}{" "}
                {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="text-xs text-green-800 hover:text-green-900 flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>{t("notifications.markAllRead")}</span>
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100 pr-0.5">
            {isLoading ? (
              <div className="space-y-3 py-2">
                <LoadingSkeleton className="h-16 w-full rounded-md" />
                <LoadingSkeleton className="h-16 w-full rounded-md" />
                <LoadingSkeleton className="h-16 w-full rounded-md" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  title={t("notifications.emptyTitle")}
                  description={t("notifications.emptyDesc")}
                />
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleMarkRead(n);
                    }
                  }}
                  className={cn(
                    "flex flex-col gap-1.5 p-3 text-left transition-colors cursor-pointer rounded-lg hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
                    !n.isRead && "bg-green-50/50 hover:bg-green-50/80 border-l-4 border-l-green-700",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-gray-200 shadow-xs">
                        {getCategoryIcon(n.category)}
                      </span>
                      <Badge tone="neutral" className="text-[10px] uppercase font-bold py-0.5">
                        {getCategoryLabel(n.category)}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-gray-600">
                      {formatRelativeDate(n.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className={cn("text-xs font-semibold text-gray-900", !n.isRead && "font-bold text-green-950")}>
                      {n.title}
                    </span>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                      {n.body}
                    </p>
                  </div>

                  {n.actionUrl && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-green-800 mt-0.5">
                      <span>{t("notifications.viewDetails")}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
