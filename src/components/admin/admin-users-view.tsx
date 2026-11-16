"use client";

import { useState } from "react";
import { Search, UserCheck, UserX, AlertTriangle, Filter, Phone, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Dialog,
  FormField,
  Input,
  Select,
  Textarea,
  Alert,
} from "@/components/ui";
import { AdminNavBar } from "./admin-nav-bar";
import type { AdminUserSummary, AccountStatus, UserRole } from "@/modules/admin/schemas";
import { cn } from "@/lib/cn";

interface AdminUsersViewProps {
  initialUsers: AdminUserSummary[];
  totalCount: number;
}

export function AdminUsersView({ initialUsers, totalCount }: AdminUsersViewProps) {
  const [users, setUsers] = useState<AdminUserSummary[]>(initialUsers);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Status Change Dialog State
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null);
  const [newStatus, setNewStatus] = useState<AccountStatus>("ACTIVE");
  const [statusReason, setStatusReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  async function handleFilter(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsLoading(true);
    setFeedbackSuccess(null);

    const params = new URLSearchParams();
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          setUsers(json.data.users || []);
        }
      }
    } catch {
      // Ignore background error
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenStatusDialog(user: AdminUserSummary) {
    setSelectedUser(user);
    setNewStatus(user.accountStatus);
    setStatusReason("");
    setDialogError(null);
  }

  async function handleSubmitStatusChange(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;

    if (!statusReason.trim() || statusReason.trim().length < 3) {
      setDialogError("Please provide an administrative reason (at least 3 characters).");
      return;
    }

    setIsUpdating(true);
    setDialogError(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reason: statusReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to update account status.");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, accountStatus: newStatus } : u)),
      );
      setFeedbackSuccess(`Account status for ${selectedUser.fullName} updated to ${newStatus}.`);
      setSelectedUser(null);
    } catch (err: unknown) {
      setDialogError(err instanceof Error ? err.message : "Failed to update user status.");
    } finally {
      setIsUpdating(false);
    }
  }

  function getRoleBadge(role: UserRole) {
    switch (role) {
      case "FARMER":
        return <Badge tone="green">Farmer</Badge>;
      case "BUYER":
        return <Badge tone="blue">Buyer</Badge>;
      case "TRANSPORT_PROVIDER":
        return <Badge tone="amber">Transporter</Badge>;
      case "ADMIN":
        return <Badge tone="neutral">Admin</Badge>;
    }
  }

  function getStatusBadge(status: AccountStatus) {
    switch (status) {
      case "ACTIVE":
        return <Badge tone="green">Active</Badge>;
      case "SUSPENDED":
        return <Badge tone="amber">Suspended</Badge>;
      case "LOCKED":
        return <Badge tone="red">Locked</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <AdminNavBar activeTab="users" />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Participant Management
        </h1>
        <p className="text-sm text-gray-600">
          Inspect registered farmers, buyers, and corridor carriers. Review participation stats and manage account access statuses.
        </p>
      </div>

      {feedbackSuccess && (
        <Alert tone="success" title={feedbackSuccess} />
      )}

      {/* Filter and Search Bar */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <form onSubmit={handleFilter} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <FormField label="Search Participants" htmlFor="search-input">
                {({ id }) => (
                  <div className="relative">
                    <Input
                      id={id}
                      type="text"
                      placeholder="Search by full name or phone number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                )}
              </FormField>
            </div>

            <div className="w-full sm:w-44">
              <FormField label="Role Filter" htmlFor="role-select">
                {({ id }) => (
                  <Select
                    id={id}
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="FARMER">Farmer</option>
                    <option value="BUYER">Buyer</option>
                    <option value="TRANSPORT_PROVIDER">Transporter</option>
                    <option value="ADMIN">Admin</option>
                  </Select>
                )}
              </FormField>
            </div>

            <div className="w-full sm:w-44">
              <FormField label="Account Status" htmlFor="status-select">
                {({ id }) => (
                  <Select
                    id={id}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="LOCKED">Locked</option>
                  </Select>
                )}
              </FormField>
            </div>

            <div className="sm:self-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isLoading}
                className="w-full min-h-[44px] flex items-center gap-1.5 justify-center"
              >
                <Filter className="h-4 w-4" />
                <span>Apply Filter</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-gray-600 px-1">
        <span>Showing {users.length} of {totalCount} participants</span>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {users.length === 0 ? (
          <Card className="border-dashed border-gray-200 py-10 text-center">
            <CardContent>
              <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-800">No participants match the filter</p>
              <p className="text-xs text-gray-500 mt-1">Try resetting the search keywords or role filters.</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="border-gray-200 hover:shadow-xs transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900 sm:text-base">
                        {user.fullName}
                      </span>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.accountStatus)}
                      {user.verificationStatus === "VERIFIED" && (
                        <Badge tone="green">KYC Verified</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span>{user.phoneNumber}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>Registered {new Date(user.createdAt).toLocaleDateString("en-NG")}</span>
                      </span>
                      {user.assistedByUserName && (
                        <span className="text-green-800 font-medium">
                          Assisted by: {user.assistedByUserName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600 pt-1">
                      <span>Listings: <strong>{user.listingsCount}</strong></span>
                      <span>Orders: <strong>{user.ordersCount}</strong></span>
                      {user.lastLoginAt && (
                        <span>Last Login: {new Date(user.lastLoginAt).toLocaleDateString("en-NG")}</span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenStatusDialog(user)}
                      className="min-h-[44px] w-full sm:w-auto text-xs"
                    >
                      {user.accountStatus === "ACTIVE" ? (
                        <>
                          <UserX className="h-3.5 w-3.5 text-amber-700 mr-1.5" />
                          <span>Restrict Access</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5 text-green-700 mr-1.5" />
                          <span>Restore Access</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Status Change Dialog */}
      {selectedUser && (
        <Dialog
          open={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title={`Update Access: ${selectedUser.fullName}`}
          description="Adjust account status and provide an administrative record reason."
          className="max-w-md"
        >
          <form onSubmit={handleSubmitStatusChange} className="space-y-4 pt-2">
            {dialogError && <Alert tone="error" title={dialogError} />}

            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
              <div><strong>User:</strong> {selectedUser.fullName} ({selectedUser.phoneNumber})</div>
              <div><strong>Role:</strong> {selectedUser.role}</div>
              <div><strong>Current Status:</strong> {selectedUser.accountStatus}</div>
            </div>

            <FormField label="Target Status" htmlFor="target-status">
              {({ id }) => (
                <Select
                  id={id}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AccountStatus)}
                >
                  <option value="ACTIVE">ACTIVE (Full Platform Access)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporary Trade Halt)</option>
                  <option value="LOCKED">LOCKED (Account Disabled)</option>
                </Select>
              )}
            </FormField>

            <FormField label="Administrative Reason" htmlFor="status-reason" required>
              {({ id, describedBy, hasError }) => (
                <Textarea
                  id={id}
                  rows={3}
                  placeholder="Reason for status change (logged into immutable audit trail)..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  aria-describedby={describedBy}
                  hasError={hasError}
                  required
                />
              )}
            </FormField>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setSelectedUser(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isUpdating}
                className={cn(
                  "min-h-[44px]",
                  newStatus === "LOCKED" && "bg-red-700 hover:bg-red-800",
                  newStatus === "SUSPENDED" && "bg-amber-700 hover:bg-amber-800",
                )}
              >
                Confirm Update
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
