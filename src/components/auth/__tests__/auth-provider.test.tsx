import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth, type AuthUserSummary } from "../auth-provider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

function Consumer() {
  const { user, role, isAuthenticated, hasRole } = useAuth();
  return (
    <div>
      <div id="auth-state">{isAuthenticated ? "authenticated" : "unauthenticated"}</div>
      <div id="user-name">{user?.fullName ?? "anonymous"}</div>
      <div id="user-role">{role ?? "none"}</div>
      <div id="has-farmer-role">{hasRole(["FARMER"]) ? "yes" : "no"}</div>
      <div id="has-admin-role">{hasRole(["ADMIN"]) ? "yes" : "no"}</div>
    </div>
  );
}

describe("AuthProvider & useAuth", () => {
  it("renders authenticated context values when initialUser is provided", () => {
    const mockUser: AuthUserSummary = {
      id: "usr_farmer_1",
      fullName: "Tersoo Vembe",
      phoneNumber: "+2348031112233",
      email: null,
      role: "FARMER",
      accountStatus: "ACTIVE",
      preferredLanguageCode: "tiv",
    };

    const html = renderToStaticMarkup(
      <AuthProvider initialUser={mockUser}>
        <Consumer />
      </AuthProvider>,
    );

    expect(html).toContain("authenticated");
    expect(html).toContain("Tersoo Vembe");
    expect(html).toContain("FARMER");
    expect(html).toContain('<div id="has-farmer-role">yes</div>');
    expect(html).toContain('<div id="has-admin-role">no</div>');
  });

  it("renders unauthenticated context values when initialUser is null", () => {
    const html = renderToStaticMarkup(
      <AuthProvider initialUser={null}>
        <Consumer />
      </AuthProvider>,
    );

    expect(html).toContain("unauthenticated");
    expect(html).toContain("anonymous");
    expect(html).toContain("none");
    expect(html).toContain('<div id="has-farmer-role">no</div>');
    expect(html).toContain('<div id="has-admin-role">no</div>');
  });
});

