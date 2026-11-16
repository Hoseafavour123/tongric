import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/modules/auth/guards.ts";
import { getLoanApplicationById } from "@/modules/finance";
import { LoanApplicationDetailView } from "@/components/finance/loan-application-detail-view.tsx";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LoanApplicationPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const application = await getLoanApplicationById(id);
  if (!application) {
    notFound();
  }

  if (application.farmerId !== session.user.id && session.user.role !== "ADMIN") {
    notFound();
  }

  return <LoanApplicationDetailView application={application} />;
}

