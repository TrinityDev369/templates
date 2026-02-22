import sql from "@/lib/db";
import type { ProductWithCategory, StockMovementWithProduct } from "@/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalProducts] = await sql<[{ count: number }]>`
    SELECT COUNT(*)::int AS count FROM products WHERE is_active = true
  `;
  const [lowStock] = await sql<[{ count: number }]>`
    SELECT COUNT(*)::int AS count FROM products
    WHERE is_active = true AND stock_quantity <= low_stock_threshold
  `;
  const [inventoryValue] = await sql<[{ total: number }]>`
    SELECT COALESCE(SUM(stock_quantity * cost_price), 0)::float AS total
    FROM products WHERE is_active = true
  `;
  const [recentMovements] = await sql<[{ count: number }]>`
    SELECT COUNT(*)::int AS count FROM stock_movements
    WHERE created_at >= NOW() - INTERVAL '7 days'
  `;
  return {
    total_products: totalProducts.count,
    low_stock_count: lowStock.count,
    total_value: inventoryValue.total,
    recent_movements: recentMovements.count,
  };
}

async function getLowStockProducts() {
  return sql<ProductWithCategory[]>`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = true AND p.stock_quantity <= p.low_stock_threshold
    ORDER BY p.stock_quantity ASC
    LIMIT 10
  `;
}

async function getRecentMovements() {
  return sql<StockMovementWithProduct[]>`
    SELECT sm.*, p.name AS product_name, p.sku AS product_sku
    FROM stock_movements sm
    JOIN products p ON p.id = sm.product_id
    ORDER BY sm.created_at DESC
    LIMIT 5
  `;
}

export default async function DashboardPage() {
  const [stats, lowStockProducts, recentMovements] = await Promise.all([
    getStats(),
    getLowStockProducts(),
    getRecentMovements(),
  ]);

  const statCards = [
    { label: "Total Products", value: stats.total_products.toString(), color: "bg-blue-500" },
    { label: "Low Stock Alerts", value: stats.low_stock_count.toString(), color: "bg-amber-500" },
    { label: "Inventory Value", value: `$${stats.total_value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "bg-emerald-500" },
    { label: "Recent Movements", value: stats.recent_movements.toString(), color: "bg-purple-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">{card.value.charAt(0) === "$" ? "$" : "#"}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Products</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">All products are well stocked.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">SKU</th>
                    <th className="pb-2 font-medium">Stock</th>
                    <th className="pb-2 font-medium">Threshold</th>
                    <th className="pb-2 font-medium">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="py-2">
                        <Link href={`/products/${product.id}`} className="text-blue-600 hover:underline">
                          {product.name}
                        </Link>
                      </td>
                      <td className="py-2 text-gray-500 font-mono text-xs">{product.sku}</td>
                      <td className="py-2">
                        <span className={`font-semibold ${product.stock_quantity === 0 ? "text-red-600" : "text-amber-600"}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500">{product.low_stock_threshold}</td>
                      <td className="py-2 text-gray-500">{product.category_name ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Movements</h2>
          {recentMovements.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent stock movements.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Qty</th>
                    <th className="pb-2 font-medium">Reference</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2">{m.product_name}</td>
                      <td className="py-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
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
                      <td className="py-2 font-medium">
                        {m.type === "out" ? `-${m.quantity}` : `+${m.quantity}`}
                      </td>
                      <td className="py-2 text-gray-500">{m.reference ?? "-"}</td>
                      <td className="py-2 text-gray-500">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
