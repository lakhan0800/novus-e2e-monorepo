import { Button, Card, ErrorMessage, SelectField, TextField } from "@fieldnotes/ui";
import { useEffect, useState, type FormEvent } from "react";
import { trackAdminEvent } from "../analytics/track";
import { adminApi, type Billing, type Plan } from "../api/client";
import { useAdminAuth } from "../auth/AdminAuthContext";

const PLAN_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "team", label: "Team" },
  { value: "enterprise", label: "Enterprise" },
];

const PLAN_RANK: Record<Plan, number> = { free: 0, team: 1, enterprise: 2 };

export function BillingPage() {
  const { admin } = useAdminAuth();
  const [billing, setBilling] = useState<Billing | null>(null);
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
      // Conversion milestone: the server accepted the plan and seat count. billingEmail is PII and is not sent.
      const previousPlan = savedBilling?.plan;
      trackAdminEvent("billing_plan_updated", {
        plan: updated.plan,
        previousPlan,
        planChange:
          previousPlan === undefined || previousPlan === updated.plan
            ? "none"
            : PLAN_RANK[updated.plan] > PLAN_RANK[previousPlan]
              ? "upgrade"
              : "downgrade",
        seats: updated.seats,
        previousSeats: savedBilling?.seats,
        organizationId: admin?.organization.id,
      });
      setBilling(updated);
      setSavedBilling(updated);
      setSaved(true);
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
