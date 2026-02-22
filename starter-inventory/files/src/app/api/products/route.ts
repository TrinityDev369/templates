import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const meta = searchParams.get("meta");

  if (meta === "options") {
    const categories = await sql`SELECT id, name FROM categories ORDER BY name`;
    const suppliers = await sql`SELECT id, name FROM suppliers ORDER BY name`;
    return NextResponse.json({ categories, suppliers });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, sku, description, category_id, supplier_id, unit_price, cost_price, stock_quantity, low_stock_threshold, unit } = body;

    if (!name || !sku) {
      return NextResponse.json({ error: "Name and SKU are required" }, { status: 400 });
    }

    const [product] = await sql`
      INSERT INTO products (name, sku, description, category_id, supplier_id, unit_price, cost_price, stock_quantity, low_stock_threshold, unit)
      VALUES (
        ${name},
        ${sku},
        ${description ?? null},
        ${category_id ?? null},
        ${supplier_id ?? null},
        ${unit_price ?? 0},
        ${cost_price ?? 0},
        ${stock_quantity ?? 0},
        ${low_stock_threshold ?? 10},
        ${unit ?? "unit"}
      )
      RETURNING *
    `;

    if (stock_quantity && stock_quantity > 0) {
      await sql`
        INSERT INTO stock_movements (product_id, type, quantity, reference)
        VALUES (${product.id}, 'in', ${stock_quantity}, 'Initial stock')
      `;
    }

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
