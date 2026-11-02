import type { AdminProfile, Billing } from "./api/client";

export function identifyAdmin(profile: AdminProfile, billing?: Billing) {
  pendo.identify({
    visitor: {
      id: profile.id,
      email: profile.email,
      full_name: profile.name,
      role: profile.role,
      accountId: profile.organization.id,
    },
    account: {
      id: profile.organization.id,
      name: profile.organization.name,
      plan: billing?.plan ?? profile.organization.plan,
      ...(billing ? { seats: billing.seats } : {}),
    },
  });
}
