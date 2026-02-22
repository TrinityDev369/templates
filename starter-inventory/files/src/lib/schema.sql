-- Inventory Starter Schema

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 10,
  unit TEXT NOT NULL DEFAULT 'unit',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INT NOT NULL,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (name, slug) VALUES
  ('Electronics', 'electronics'),
  ('Clothing', 'clothing'),
  ('Food & Beverage', 'food-beverage'),
  ('Office Supplies', 'office-supplies'),
  ('Hardware', 'hardware')
ON CONFLICT DO NOTHING;

-- Seed suppliers
INSERT INTO suppliers (name, contact_email) VALUES
  ('TechCorp Supplies', 'orders@techcorp.example'),
  ('Global Goods Ltd', 'supply@globalgoods.example')
ON CONFLICT DO NOTHING;

-- Seed products
INSERT INTO products (name, sku, description, category_id, supplier_id, unit_price, cost_price, stock_quantity, low_stock_threshold, unit) VALUES
  ('Wireless Bluetooth Headphones', 'ELEC-WBH-001', 'Over-ear noise-cancelling headphones with 30hr battery', (SELECT id FROM categories WHERE slug = 'electronics'), (SELECT id FROM suppliers WHERE name = 'TechCorp Supplies'), 79.99, 42.50, 150, 20, 'unit'),
  ('USB-C Charging Cable 2m', 'ELEC-USB-002', 'Braided nylon USB-C to USB-C fast charging cable', (SELECT id FROM categories WHERE slug = 'electronics'), (SELECT id FROM suppliers WHERE name = 'TechCorp Supplies'), 12.99, 4.25, 3, 25, 'unit'),
  ('Cotton Crew T-Shirt', 'CLTH-CTS-001', '100% organic cotton unisex crew neck t-shirt', (SELECT id FROM categories WHERE slug = 'clothing'), (SELECT id FROM suppliers WHERE name = 'Global Goods Ltd'), 24.99, 8.75, 320, 50, 'unit'),
  ('Denim Slim Jeans', 'CLTH-DSJ-002', 'Classic slim-fit denim jeans, stretch fabric', (SELECT id FROM categories WHERE slug = 'clothing'), (SELECT id FROM suppliers WHERE name = 'Global Goods Ltd'), 59.99, 22.00, 85, 20, 'unit'),
  ('Organic Green Tea Box', 'FOOD-OGT-001', 'Box of 50 organic green tea bags, Japanese sencha', (SELECT id FROM categories WHERE slug = 'food-beverage'), (SELECT id FROM suppliers WHERE name = 'Global Goods Ltd'), 14.99, 6.50, 200, 30, 'box'),
  ('Cold Brew Coffee Concentrate', 'FOOD-CBC-002', '1L bottle of cold brew coffee concentrate', (SELECT id FROM categories WHERE slug = 'food-beverage'), (SELECT id FROM suppliers WHERE name = 'Global Goods Ltd'), 18.99, 7.80, 45, 15, 'bottle')
ON CONFLICT DO NOTHING;

-- Seed stock movements for initial stock
INSERT INTO stock_movements (product_id, type, quantity, reference, notes) VALUES
  ((SELECT id FROM products WHERE sku = 'ELEC-WBH-001'), 'in', 150, 'Initial stock', 'Opening inventory count'),
  ((SELECT id FROM products WHERE sku = 'ELEC-USB-002'), 'in', 3, 'Initial stock', 'Opening inventory count'),
  ((SELECT id FROM products WHERE sku = 'CLTH-CTS-001'), 'in', 320, 'Initial stock', 'Opening inventory count'),
  ((SELECT id FROM products WHERE sku = 'CLTH-DSJ-002'), 'in', 85, 'Initial stock', 'Opening inventory count'),
  ((SELECT id FROM products WHERE sku = 'FOOD-OGT-001'), 'in', 200, 'Initial stock', 'Opening inventory count'),
  ((SELECT id FROM products WHERE sku = 'FOOD-CBC-002'), 'in', 45, 'Initial stock', 'Opening inventory count')
ON CONFLICT DO NOTHING;
