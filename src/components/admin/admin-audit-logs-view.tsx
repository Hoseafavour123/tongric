"use client";

import { useState } from "react";
import { History, Filter, ChevronDown, ChevronRight, User, Terminal, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  FormField,
  Input,
  Select,
} from "@/components/ui";
import { AdminNavBar } from "./admin-nav-bar";
import type { AuditLogSummary } from "@/modules/admin/schemas";

interface AdminAuditLogsViewProps {
  initialLogs: AuditLogSummary[];
  totalCount: number;
}

export function AdminAuditLogsView({ initialLogs, totalCount }: AdminAuditLogsViewProps) {
  const [logs, setLogs] = useState<AuditLogSummary[]>(initialLogs);
  const [actionQuery, setActionQuery] = useState("");
  const [entityTypeQuery, setEntityTypeQuery] = useState("");
  const [actorUserIdQuery, setActorUserIdQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});

  function toggleExpand(id: string) {
    setExpandedLogIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleFilter(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsLoading(true);

    const params = new URLSearchParams();
    if (actionQuery.trim()) params.set("action", actionQuery.trim());
    if (entityTypeQuery.trim()) params.set("entityType", entityTypeQuery.trim());
    if (actorUserIdQuery.trim()) params.set("actorUserId", actorUserIdQuery.trim());

    try {
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          setLogs(json.data.logs || []);
        }
      }
    } catch {
      // Ignore background error
    } finally {
      setIsLoading(false);
    }
  }

  function getActionBadge(action: string) {
    if (action.includes("FAILED") || action.includes("CANCEL") || action.includes("DISPUTE")) {
      return <Badge tone="red">{action}</Badge>;
    }
    if (action.includes("SUCCESS") || action.includes("RESOLVED") || action.includes("VERIFIED")) {
      return <Badge tone="green">{action}</Badge>;
    }
    if (action.includes("UPDATE") || action.includes("CLAIM")) {
      return <Badge tone="amber">{action}</Badge>;
    }
    return <Badge tone="neutral">{action}</Badge>;
  }

  return (
    <div className="space-y-6">
      <AdminNavBar activeTab="audit" />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Immutable System Audit Trail
        </h1>
        <p className="text-sm text-gray-600">
          Search and inspect tamper-evident audit records across authentication, NDPA consents, KYC document decisions, trade negotiations, and haulage milestones.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <form onSubmit={handleFilter} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <FormField label="Action Name" htmlFor="action-filter">
                {({ id }) => (
                  <Input
                    id={id}
                    placeholder="e.g. LOGIN_SUCCESS, ORDER_DISPUTE_RESOLVED..."
                    value={actionQuery}
                    onChange={(e) => setActionQuery(e.target.value)}
                  />
                )}
              </FormField>
            </div>

            <div className="w-full sm:w-44">
              <FormField label="Entity Type" htmlFor="entity-type-filter">
                {({ id }) => (
                  <Select
                    id={id}
                    value={entityTypeQuery}
                    onChange={(e) => setEntityTypeQuery(e.target.value)}
                  >
                    <option value="">All Entities</option>
                    <option value="user">User</option>
                    <option value="order">Order</option>
                    <option value="produce_listing">Listing</option>
                    <option value="verification_document">Verification</option>
                    <option value="carrier_review">Review</option>
                  </Select>
                )}
              </FormField>
            </div>

            <div className="w-full sm:w-48">
              <FormField label="Actor User ID" htmlFor="actor-filter">
                {({ id }) => (
                  <Input
                    id={id}
                    placeholder="Filter by user ID..."
                    value={actorUserIdQuery}
                    onChange={(e) => setActorUserIdQuery(e.target.value)}
                  />
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
                <span>Search Logs</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-gray-600 px-1">
        <span>Showing {logs.length} of {totalCount} logged events</span>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <Card className="border-dashed border-gray-200 py-10 text-center">
            <CardContent>
              <History className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-800">No audit records found</p>
              <p className="text-xs text-gray-500 mt-1">Try broadening your search action or entity criteria.</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => {
            const isExpanded = Boolean(expandedLogIds[log.id]);
            return (
              <Card key={log.id} className="border-gray-200 hover:border-gray-300 transition-colors">
                <CardContent className="p-3 sm:p-4">
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        aria-label="Toggle details"
                        className="p-1 rounded text-gray-400 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {getActionBadge(log.action)}
                      <span className="text-xs font-semibold text-gray-700">
                        {log.entityType}{log.entityId ? `:${log.entityId}` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-600 pl-7 sm:pl-0">
                      {log.actorName ? (
                        <span className="flex items-center gap-1 font-medium text-gray-800">
                          <User className="h-3 w-3 text-gray-400" />
                          <span>{log.actorName}</span>
                        </span>
                      ) : log.actorUserId ? (
                        <span className="font-mono text-[11px] text-gray-500">
                          {log.actorUserId.slice(0, 12)}...
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">System</span>
                      )}

                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{new Date(log.createdAt).toLocaleString("en-NG")}</span>
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 pl-7 space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                        <div>
                          <strong>Audit Record ID:</strong> <span className="font-mono">{log.id}</span>
                        </div>
                        {log.ipAddress && (
                          <div>
                            <strong>IP Address:</strong> <span className="font-mono">{log.ipAddress}</span>
                          </div>
                        )}
                      </div>

                      {log.metadata && (
                        <div>
                          <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1 mb-1">
                            <Terminal className="h-3 w-3 text-gray-500" />
                            <span>Payload Metadata (JSON):</span>
                          </div>
                          <pre className="rounded-md bg-gray-900 p-2.5 text-[11px] text-green-400 overflow-x-auto font-mono">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
