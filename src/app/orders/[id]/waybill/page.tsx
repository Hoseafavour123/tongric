import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, EmptyState, buttonClasses } from "@/components/ui";
import { getServerSession } from "@/modules/auth/guards";
import { getWaybill } from "@/modules/orders";
import { WaybillView } from "@/components/orders/waybill-view";

export const dynamic = "force-dynamic";

interface WaybillPageProps {
  params: Promise<{ id: string }>;
}

export default async function WaybillPage({ params }: WaybillPageProps) {
  const session = await getServerSession().catch(() => null);
  if (!session) {
    redirect("/login?returnUrl=/orders");
  }

  const { id } = await params;

  let waybill = null;
  try {
    waybill = await getWaybill(
      { id: session.user.id, role: session.user.role },
      id,
    );
  } catch {
    waybill = null;
  }

  if (!waybill) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-12 text-center">
            <EmptyState
              title="Waybill not found or access denied"
              description="This dispatch waybill does not exist or you do not have permission to view this haulage manifest."
              action={
                <Link
                  href={`/orders/${id}`}
                  className={buttonClasses({
                    variant: "primary",
                    className: "min-h-[44px] mt-4",
                  })}
                >
                  Back to Order
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <WaybillView waybill={waybill} />;
}
