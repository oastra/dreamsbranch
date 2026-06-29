import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { PageHeader } from "@/components/admin/shared/page-header";
import { formatCurrency } from "@/lib/utils";

type OrderLineItem = {
  description: string | null;
  quantity: number | null;
};

type OrderRow = {
  id: string;
  status: string;
  amount_total: number;
  currency: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  line_items: OrderLineItem[];
  created_at: string;
};

export default async function OrdersPage() {
  await requireAdmin();

  const sb = createAdminClient();
  // `shop_orders` isn't in the generated Supabase types yet (added via
  // migration) — cast the query off the typed client.
  const { data } = await (
    sb as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          order: (
            col: string,
            opts: { ascending: boolean },
          ) => {
            limit: (n: number) => Promise<{ data: OrderRow[] | null }>;
          };
        };
      };
    }
  )
    .from("shop_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = data ?? [];

  return (
    <div>
      <PageHeader title="Shop orders" />

      {orders.length === 0 ? (
        <p className="mt-6 text-body text-text-secondary">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const items = Array.isArray(o.line_items) ? o.line_items : [];
                const count = items.reduce(
                  (n, it) => n + (Number(it.quantity) || 0),
                  0,
                );
                return (
                  <tr
                    key={o.id}
                    className="border-b border-border align-top last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                      {new Date(o.created_at).toLocaleDateString("en-AU", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-strong">
                        {o.customer_name || "—"}
                      </div>
                      <div className="text-text-secondary">
                        {o.customer_email}
                      </div>
                      {o.customer_phone && (
                        <div className="text-text-secondary">
                          {o.customer_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-strong">{count}</div>
                      <ul className="text-text-secondary">
                        {items.map((it, i) => (
                          <li key={i}>
                            {it.quantity}× {it.description}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-text-strong">
                      {formatCurrency(Number(o.amount_total))}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-caption font-medium capitalize text-green-700">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
