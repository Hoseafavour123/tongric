"use client";

import { useWorkspaceMode } from "@/components/layout/workspace-mode-provider";
import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatusStepper,
  type StepItem,
} from "@/components/ui";

const FARMER_STEPS: readonly StepItem[] = [
  {
    id: "list",
    label: "List available harvest",
    description: "Publish quantity, price, LGA location, and compressed photo.",
    state: "completed",
  },
  {
    id: "agree",
    label: "Negotiate & confirm buyer order",
    description: "Review offers transparently and lock agreed quantity.",
    state: "current",
  },
  {
    id: "deliver",
    label: "Coordinate transport & confirm delivery",
    description: "Track 6 delivery milestones until buyer confirms receipt.",
    state: "upcoming",
  },
];

const BUYER_STEPS: readonly StepItem[] = [
  {
    id: "discover",
    label: "Search produce in Benue communities",
    description: "Filter verified farmers by crop, LGA, quantity, and price.",
    state: "completed",
  },
  {
    id: "offer",
    label: "Submit offer & lock order",
    description: "Negotiate terms directly with the farmer with clear payment notes.",
    state: "current",
  },
  {
    id: "receive",
    label: "Arrange logistics & confirm receipt",
    description: "Compare transport quotes and track produce to your destination.",
    state: "upcoming",
  },
];

export function HomeOverview() {
  const { mode } = useWorkspaceMode();
  const isFarmer = mode === "farmer";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone="green">
              {isFarmer ? "Farmer View Active" : "Buyer View Active"}
            </Badge>
            <Badge tone="neutral">Benue Pilot MVP · Phase 1</Badge>
          </div>
          <CardTitle className="mt-3 text-xl sm:text-2xl">
            {isFarmer
              ? "Sell your produce directly and arrange transport"
              : "Source fresh agricultural produce directly from farmers"}
          </CardTitle>
          <CardDescription>
            {isFarmer
              ? "List tomatoes, pepper, mangoes, and staples cleanly, compare buyer offers, and track deliveries from farm to buyer."
              : "Discover verified smallholder supply across Benue State, negotiate transparent orders, and coordinate haulage."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert
            tone="info"
            title="Foundation active — Marketplace, Orders, Transport & Finance unlock next"
          >
            You can switch between <strong>Farmer</strong> and{" "}
            <strong>Buyer</strong> view using the toggle in the header.
            Authentication, profiles, listings, logistics, and loan workflows
            are rolled out sequentially in Phases 2–9.
          </Alert>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {isFarmer ? "How Farmer Selling Works" : "How Buyer Sourcing Works"}
            </CardTitle>
            <CardDescription>
              Core transaction sequence prioritized for Tongric Release 1.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusStepper
              ariaLabel={
                isFarmer ? "Farmer selling steps" : "Buyer sourcing steps"
              }
              steps={isFarmer ? FARMER_STEPS : BUYER_STEPS}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobile-First Navigation</CardTitle>
            <CardDescription>
              Built for low-end Android phones and slow rural connectivity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              On mobile screens, Tongric organizes core sections into five
              bottom tabs: <strong>Home</strong>, <strong>Market</strong>,{" "}
              <strong>Orders</strong>, <strong>Transport</strong>, and{" "}
              <strong>Finance</strong>.
            </p>
            <p>
              Your <strong>Farmer / Buyer</strong> view switch and upcoming{" "}
              <strong>Account</strong> &amp; <strong>Language</strong> controls
              stay pinned in the top header so they are reachable from any tab.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

