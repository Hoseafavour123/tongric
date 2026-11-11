import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  FormField,
  Input,
  Select,
  StatusStepper,
} from "../index";

describe("Tongric UI Kit", () => {
  it("renders Button with accessible loading and disabled states", () => {
    const loadingHtml = renderToStaticMarkup(
      <Button loading loadingLabel="Saving...">
        Save
      </Button>,
    );
    expect(loadingHtml).toContain("disabled");
    expect(loadingHtml).toContain('aria-busy="true"');
    expect(loadingHtml).toContain("Saving...");
    expect(loadingHtml).toContain("min-h-11");
  });

  it("renders FormField with visible label, hint, and accessible error alert", () => {
    const html = renderToStaticMarkup(
      <FormField
        label="Quantity"
        required
        hint="In kilograms"
        error="Must be greater than zero"
      >
        {({ id, describedBy, hasError }) => (
          <Input
            id={id}
            aria-describedby={describedBy}
            hasError={hasError}
          />
        )}
      </FormField>,
    );

    expect(html).toContain("<label");
    expect(html).toContain("Quantity");
    expect(html).toContain("In kilograms");
    expect(html).toContain('role="alert"');
    expect(html).toContain("Must be greater than zero");
    expect(html).toContain('aria-invalid="true"');
  });

  it("renders Select, Card, Badge, Alert, EmptyState, and StatusStepper cleanly", () => {
    const html = renderToStaticMarkup(
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge tone="green">Verified</Badge>
            <Alert tone="error" title="Network error">
              Please retry.
            </Alert>
            <Select aria-label="Crop">
              <option value="tomatoes">Tomatoes</option>
            </Select>
            <StatusStepper
              steps={[
                { id: "1", label: "Confirmed", state: "completed" },
                { id: "2", label: "Collected", state: "current" },
                { id: "3", label: "Delivered", state: "upcoming" },
              ]}
            />
            <EmptyState
              title="No orders"
              description="Orders appear here."
            />
          </CardContent>
        </Card>
      </div>,
    );

    expect(html).toContain("Verified");
    expect(html).toContain("Network error");
    expect(html).toContain("Tomatoes");
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("No orders");
  });
});

