import sql from "@/lib/db";
import type { StockMovementWithProduct } from "@/types";
import StockBadge from "@/components/stock-badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import StockAdjustmentForm from "./stock-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: number) {
  const [product] = await sql`
    SELECT p.*, c.name AS category_name, s.name AS supplier_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN suppliers s ON s.id = p.supplier_id
    WHERE p.id = ${id}
  `;
  return product ?? null;
}

async function getMovements(productId: number) {
  return sql<StockMovementWithProduct[]>`
    SELECT sm.*, p.name AS product_name, p.sku AS product_sku
    FROM stock_movements sm
    JOIN products p ON p.id = sm.product_id
    WHERE sm.product_id = ${productId}
    ORDER BY sm.created_at DESC
    LIMIT 10
  `;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) notFound();

  const product = await getProduct(productId);
  if (!product) notFound();

  const movements = await getMovements(productId);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/products" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <span className="text-sm text-gray-400 font-mono">{product.sku}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium text-gray-900">{product.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">SKU</dt>
                <dd className="font-mono text-gray-900">{product.sku}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900">{product.category_name ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Supplier</dt>
                <dd className="text-gray-900">{product.supplier_name ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Unit Price</dt>
                <dd className="text-gray-900">${Number(product.unit_price).toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Cost Price</dt>
                <dd className="text-gray-900">${Number(product.cost_price).toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Unit</dt>
                <dd className="text-gray-900">{product.unit}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd>{product.is_active ? <span className="text-green-600 font-medium">Active</span> : <span className="text-gray-400">Inactive</span>}</dd>
              </div>
              {product.description && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Description</dt>
                  <dd className="text-gray-900">{product.description}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Movement History</h2>
            {movements.length === 0 ? (
              <p className="text-gray-500 text-sm">No stock movements recorded.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Quantity</th>
                    <th className="pb-2 font-medium">Reference</th>
                    <th className="pb-2 font-medium">Notes</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
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
                      <td className="py-2 text-gray-500">{m.notes ?? "-"}</td>
                      <td className="py-2 text-gray-500">{new Date(m.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Current Stock</h2>
            <p className="text-4xl font-bold text-gray-900 mb-2">{product.stock_quantity}</p>
            <StockBadge quantity={product.stock_quantity} threshold={product.low_stock_threshold} />
            <p className="text-xs text-gray-400 mt-2">Threshold: {product.low_stock_threshold}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Adjustment</h2>
            <StockAdjustmentForm productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
