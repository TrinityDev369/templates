import sql from "@/lib/db";
import AddSupplierForm from "./add-supplier-form";

export const dynamic = "force-dynamic";

interface SupplierWithCount {
  id: number;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  created_at: string;
  product_count: number;
}

export default async function SuppliersPage() {
  const suppliers = await sql<SupplierWithCount[]>`
    SELECT s.*, COUNT(p.id)::int AS product_count
    FROM suppliers s
    LEFT JOIN products p ON p.supplier_id = s.id AND p.is_active = true
    GROUP BY s.id
    ORDER BY s.name ASC
  `;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {suppliers.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No suppliers yet. Add one using the form.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Phone</th>
                      <th className="pb-3 font-medium">Address</th>
                      <th className="pb-3 font-medium text-right">Products</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 font-medium text-gray-900">{supplier.name}</td>
                        <td className="py-3 text-gray-500">{supplier.contact_email ?? "-"}</td>
                        <td className="py-3 text-gray-500">{supplier.contact_phone ?? "-"}</td>
                        <td className="py-3 text-gray-500">{supplier.address ?? "-"}</td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                            {supplier.product_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Supplier</h2>
            <AddSupplierForm />
          </div>
        </div>
      </div>
    </div>
  );
}
