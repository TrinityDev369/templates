import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { product_id, type, quantity, reference, notes } = body;

    if (!product_id) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    if (!type || !["in", "out", "adjustment"].includes(type)) {
      return NextResponse.json({ error: "type must be 'in', 'out', or 'adjustment'" }, { status: 400 });
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "quantity must be greater than 0" }, { status: 400 });
    }

    const [movement] = await sql`
      INSERT INTO stock_movements (product_id, type, quantity, reference, notes)
      VALUES (${product_id}, ${type}, ${quantity}, ${reference ?? null}, ${notes ?? null})
      RETURNING *
    `;

    let updateResult;

    if (type === "in") {
      [updateResult] = await sql`
        UPDATE products
        SET stock_quantity = stock_quantity + ${quantity}, updated_at = NOW()
        WHERE id = ${product_id}
        RETURNING stock_quantity
      `;
    } else if (type === "out") {
      [updateResult] = await sql`
        UPDATE products
        SET stock_quantity = GREATEST(stock_quantity - ${quantity}, 0), updated_at = NOW()
        WHERE id = ${product_id}
        RETURNING stock_quantity
      `;
    } else {
      [updateResult] = await sql`
        UPDATE products
        SET stock_quantity = ${quantity}, updated_at = NOW()
        WHERE id = ${product_id}
        RETURNING stock_quantity
      `;
    }

    return NextResponse.json({
      movement,
      new_quantity: updateResult.stock_quantity,
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
