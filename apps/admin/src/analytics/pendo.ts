import { adminApi, tokenStore, type AdminProfile, type Billing } from "../api/client";

function identify(admin: AdminProfile, billing?: Billing) {
  pendo.identify({
    visitor: {
      id: admin.id,
      email: admin.email,
      full_name: admin.name,
      role: admin.role,
      accountId: admin.organization.id,
    },
    account: {
      id: admin.organization.id,
      name: admin.organization.name,
      plan: admin.organization.plan,
      ...(billing ? { seats: billing.seats } : {}),
    },
  });
}

/**
 * Registers the signed-in admin with Novus by Pendo. Seats are only exposed by
 * /admin/billing, so they are added in a follow-up identify once that resolves.
 */
export function identifyAdmin(admin: AdminProfile) {
  identify(admin);
  const token = tokenStore.get();
  adminApi
    .getBilling()
    .then((billing) => {
      // Skip if the admin signed out (or another one signed in) meanwhile.
      if (token !== null && tokenStore.get() === token) identify(admin, billing);
    })
    .catch(() => undefined);
}

export function clearPendoSession() {
  pendo.clearSession();
}
