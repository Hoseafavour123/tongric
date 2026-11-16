import { getServerSession } from "@/modules/auth/guards";
import {
  getCorridors,
  listOpenTransportRequests,
  listTransporterAssignments,
  listVerifiedTransporters,
} from "@/modules/transport";
import type {
  TransportRequestSummary,
  TransporterAssignmentSummary,
} from "@/modules/transport/schemas";
import { TransportHubView } from "@/components/transport/transport-hub-view";

export const dynamic = "force-dynamic";

export default async function TransportPage() {
  const session = await getServerSession();
  const isTransporter =
    session?.user.role === "TRANSPORT_PROVIDER" || session?.user.role === "ADMIN";

  const corridors = getCorridors();
  const verifiedTransporters = await listVerifiedTransporters();

  let openRequests: TransportRequestSummary[] = [];
  let myAssignments: TransporterAssignmentSummary[] = [];

  if (session) {
    const actor = { id: session.user.id, role: session.user.role };
    openRequests = await listOpenTransportRequests();

    if (isTransporter) {
      myAssignments = await listTransporterAssignments(actor);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <TransportHubView
        corridors={corridors}
        openRequests={openRequests}
        myAssignments={myAssignments}
        verifiedTransporters={verifiedTransporters}
        isTransporter={isTransporter}
        currentUserRole={session?.user.role}
        currentUserId={session?.user.id}
      />
    </div>
  );
}
