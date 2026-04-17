import { pgTable, uuid, text, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";

export const appRoleEnum = pgEnum("app_role", [
  "super_admin",
  "admin_config",
  "warehouse",
  "store_manager",
  "finance",
  "readonly",
]);

export const movementTypeEnum = pgEnum("movement_type", ["in", "out", "transfer"]);
export const referenceTypeEnum = pgEnum("reference_type", ["purchase", "sale", "return", "manual"]);

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const warehouses = pgTable("warehouses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productSkus = pgTable("product_skus", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  brand: text("brand"),
  description: text("description"),
  isSerialized: boolean("is_serialized").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  email: text("email"),
  fullName: text("full_name"),
  storeId: uuid("store_id"),
  warehouseId: uuid("warehouse_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  role: appRoleEnum("role").notNull(),
});

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  skuId: uuid("sku_id").notNull(),
  productUnitId: uuid("product_unit_id"),
  warehouseId: uuid("warehouse_id").notNull(),
  movementType: movementTypeEnum("movement_type").notNull(),
  quantity: integer("quantity").notNull().default(1),
  referenceType: referenceTypeEnum("reference_type").notNull(),
  referenceId: uuid("reference_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productUnits = pgTable("product_units", {
  id: uuid("id").primaryKey().defaultRandom(),
});
