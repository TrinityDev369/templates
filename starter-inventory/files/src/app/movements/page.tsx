import sql from "@/lib/db";
import type { StockMovementWithProduct } from "@/types";

export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const movements = await sql<StockMovementWithProduct[]>`
    SELECT sm.*, p.name AS product_name, p.sku AS product_sku
    FROM stock_movements sm
    JOIN products p ON p.id = sm.product_id
    ORDER BY sm.created_at DESC
    LIMIT 50
  `;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stock Movements</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {movements.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No stock movements recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">SKU</th>
                  <th className="pb-3 font-medium">Quantity</th>
                  <th className="pb-3 font-medium">Reference</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.type === "in"
                            ? "bg-green-100 text-green-700"
                            : m.type === "out"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-gray-900">{m.product_name}</td>
                    <td className="py-3 text-gray-500 font-mono text-xs">{m.product_sku}</td>
                    <td className="py-3 font-medium">
                      <span className={m.type === "out" ? "text-red-600" : "text-green-600"}>
                        {m.type === "out" ? `-${m.quantity}` : `+${m.quantity}`}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{m.reference ?? "-"}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(m.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
