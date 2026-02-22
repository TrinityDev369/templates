import Link from "next/link";
import type { ProductWithCategory } from "@/types";
import StockBadge from "@/components/stock-badge";

interface ProductTableProps {
  products: ProductWithCategory[];
}

export default function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No products found.</p>
        <p className="text-sm mt-1">Add your first product to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">SKU</th>
            <th className="pb-3 font-medium">Category</th>
            <th className="pb-3 font-medium">Stock</th>
            <th className="pb-3 font-medium text-right">Unit Price</th>
            <th className="pb-3 font-medium text-right">Cost Price</th>
            <th className="pb-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 font-medium text-gray-900">{product.name}</td>
              <td className="py-3 text-gray-500 font-mono text-xs">{product.sku}</td>
              <td className="py-3 text-gray-500">{product.category_name ?? "-"}</td>
              <td className="py-3">
                <StockBadge quantity={product.stock_quantity} threshold={product.low_stock_threshold} />
              </td>
              <td className="py-3 text-right text-gray-900">${Number(product.unit_price).toFixed(2)}</td>
              <td className="py-3 text-right text-gray-500">${Number(product.cost_price).toFixed(2)}</td>
              <td className="py-3 text-right">
                <Link
                  href={`/products/${product.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
