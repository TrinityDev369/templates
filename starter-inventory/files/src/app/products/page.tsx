import sql from "@/lib/db";
import type { ProductWithCategory } from "@/types";
import ProductTable from "@/components/product-table";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q } = await searchParams;

  let products: ProductWithCategory[];

  if (q && q.trim()) {
    const pattern = `%${q.trim()}%`;
    products = await sql<ProductWithCategory[]>`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = true
        AND (p.name ILIKE ${pattern} OR p.sku ILIKE ${pattern})
      ORDER BY p.name ASC
    `;
  } else {
    products = await sql<ProductWithCategory[]>`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = true
      ORDER BY p.name ASC
    `;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} product{products.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          href="/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Product
        </Link>
      </div>

      <div className="mb-6">
        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name or SKU..."
            className="flex-1 max-w-md border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Search
          </button>
          {q && (
            <Link
              href="/products"
              className="text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ProductTable products={products} />
      </div>
    </div>
  );
}
