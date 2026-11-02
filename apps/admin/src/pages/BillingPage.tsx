import { Button, Card, ErrorMessage, SelectField, TextField } from "@fieldnotes/ui";
import { useEffect, useState, type FormEvent } from "react";
import { trackEvent } from "../analytics/pendo";
import { adminApi, type Billing, type Plan } from "../api/client";
import { useAdminAuth } from "../auth/AdminAuthContext";

const PLAN_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "team", label: "Team" },
  { value: "enterprise", label: "Enterprise" },
];

const PLAN_RANK: Record<Plan, number> = { free: 0, team: 1, enterprise: 2 };

function billingChangeType(previous: Billing, next: Billing): string {
  if (PLAN_RANK[next.plan] > PLAN_RANK[previous.plan]) return "upgrade";
  if (PLAN_RANK[next.plan] < PLAN_RANK[previous.plan]) return "downgrade";
  if (next.seats !== previous.seats) return "seats_only";
  return "no_change";
}

export function BillingPage() {
  const { admin } = useAdminAuth();
  const [billing, setBilling] = useState<Billing | null>(null);
  // Last billing state confirmed by the API, kept to compare against on save.
  const [savedBilling, setSavedBilling] = useState<Billing | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getBilling()
      .then((loaded) => {
        setBilling(loaded);
        setSavedBilling(loaded);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  if (!billing) return <ErrorMessage message={error} />;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaved(false);
    setError(null);
    try {
      const updated = await adminApi.updateBilling(billing);
      setBilling(updated);
      setSaved(true);
      const previous = savedBilling ?? billing;
      setSavedBilling(updated);
      // Confirmed plan/seat subscription change (billing email is PII and is not sent).
      trackEvent("billing_subscription_updated", {
        previous_plan: previous.plan,
        new_plan: updated.plan,
        previous_seats: previous.seats,
        new_seats: updated.seats,
        change_type: billingChangeType(previous, updated),
        organization_id: admin?.organization.id ?? "unknown",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save billing details");
    }
  };

  return (
    <>
      <h1>Billing</h1>
      <Card title="Subscription">
        <form onSubmit={(event) => void save(event)}>
          <SelectField
            id="billing-plan-select"
            label="Plan"
            options={PLAN_OPTIONS}
            value={billing.plan}
            onChange={(event) => setBilling({ ...billing, plan: event.target.value as Plan })}
          />
          <TextField
            id="billing-email-input"
            label="Billing email"
            type="email"
            value={billing.billingEmail}
            onChange={(event) => setBilling({ ...billing, billingEmail: event.target.value })}
          />
          <TextField
            id="billing-seats-input"
            label="Seats"
            type="number"
            min={1}
            value={billing.seats}
            onChange={(event) => setBilling({ ...billing, seats: Number(event.target.value) })}
          />
          <ErrorMessage message={error} />
          <Button id="save-billing-button" type="submit">
            Save billing
          </Button>
          {saved && <span className="fn-muted"> Saved.</span>}
        </form>
      </Card>
    </>
  );
}
