"use client";

import { useState } from "react";
import { PackageOpen } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  EmptyState,
  FormField,
  Input,
  LoadingSkeleton,
  Select,
  Spinner,
  StatusStepper,
  Textarea,
  type StepItem,
} from "@/components/ui";

const SAMPLE_STEPS: readonly StepItem[] = [
  {
    id: "requested",
    label: "Transportation requested",
    description: "Order #TRG-1042 from Gboko to Makurdi",
    state: "completed",
  },
  {
    id: "confirmed",
    label: "Provider confirmed",
    description: "Benue Agro Haulage · Pickup van",
    state: "completed",
  },
  {
    id: "collected",
    label: "Produce collected",
    description: "500kg fresh tomatoes loaded at farm gate",
    state: "current",
  },
  {
    id: "dispatched",
    label: "Shipment dispatched",
    state: "upcoming",
  },
  {
    id: "delivered",
    label: "Produce delivered",
    state: "upcoming",
  },
];

export function StyleguideDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <Badge tone="green">Development Preview Only</Badge>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Tongric Design System &amp; UI Kit
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Clean white surfaces, green actions, accessible labels, and 44px+
          touch targets designed for rural Nigerian mobile devices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buttons &amp; Interaction States</CardTitle>
          <CardDescription>
            Primary green actions with focus, disabled, and loading states.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="primary">Publish Produce</Button>
          <Button variant="secondary">Make Counter-Offer</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Suspend Account</Button>
          <Button variant="primary" loading loadingLabel="Submitting...">
            Submit
          </Button>
          <Button variant="primary" disabled>
            Disabled Action
          </Button>
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Test Modal Dialog
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessible Form Fields</CardTitle>
          <CardDescription>
            Visible labels, helper text, and aria-linked validation errors.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Crop Quantity"
            required
            hint="Enter available weight or baskets at your farm."
          >
            {({ id, describedBy, hasError }) => (
              <Input
                id={id}
                type="number"
                defaultValue="500"
                aria-describedby={describedBy}
                hasError={hasError}
              />
            )}
          </FormField>

          <FormField
            label="Benue Local Government Area"
            required
            error="Please select your farm pickup LGA."
          >
            {({ id, describedBy, hasError }) => (
              <Select
                id={id}
                defaultValue=""
                aria-describedby={describedBy}
                hasError={hasError}
              >
                <option value="" disabled>
                  Select LGA...
                </option>
                <option value="gboko">Gboko</option>
                <option value="makurdi">Makurdi</option>
                <option value="katsina-ala">Katsina-Ala</option>
              </Select>
            )}
          </FormField>

          <FormField
            label="Quality &amp; Packaging Notes"
            hint="Describe ripeness or crate packaging clearly."
            className="sm:col-span-2"
          >
            {({ id, describedBy, hasError }) => (
              <Textarea
                id={id}
                placeholder="Freshly harvested Roma tomatoes in ventilated crates."
                aria-describedby={describedBy}
                hasError={hasError}
              />
            )}
          </FormField>
        </CardContent>
        <CardFooter>
          <Badge tone="green">Verified Farmer</Badge>
          <Badge tone="amber">Perishable · Urgent</Badge>
          <Badge tone="blue">In Transit</Badge>
          <Badge tone="red">Disputed</Badge>
          <Badge tone="neutral">Draft</Badge>
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contextual Alerts &amp; Loading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert tone="success" title="Order confirmed">
              200kg reserved cleanly. Remaining listing stock: 300kg.
            </Alert>
            <Alert tone="warning" title="Slow network detected">
              Keep this page open while your listing finishes saving.
            </Alert>
            <Alert tone="error" title="Could not submit offer">
              Requested quantity exceeds available stock.
            </Alert>
            <div className="space-y-2 pt-2">
              <Spinner label="Loading nearby transporters..." />
              <LoadingSkeleton className="h-4 w-3/4" />
              <LoadingSkeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Milestone Stepper</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusStepper steps={SAMPLE_STEPS} />
          </CardContent>
        </Card>
      </div>

      <EmptyState
        icon={<PackageOpen className="h-5 w-5" aria-hidden="true" />}
        title="No active produce listings yet"
        description="Farmers in Gboko and Makurdi can add tomatoes, pepper, or mangoes in under two minutes."
        action={<Button variant="primary">Add First Listing</Button>}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Confirm Produce Order"
        description="Payments are settled directly off-platform in Release 1."
      >
        <p className="text-sm text-gray-700">
          Confirming reserves 200kg of fresh tomatoes from the farmer&apos;s
          listing so another buyer cannot claim the same stock.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => setDialogOpen(false)}>
            Acknowledge
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

