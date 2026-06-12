// Row -> API shape mappers shared by storefront and admin routes.

function safeParse(json, fallback) {
  if (json == null) return fallback;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function toProduct(row) {
  return {
    id: String(row.id),
    name: row.name,
    type: row.type,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    badge: row.badge || undefined,
    image: row.image,
    category: row.category,
    sizes: safeParse(row.sizes, undefined),
    hasBlousePiece: !!row.has_blouse_piece,
    section: row.section,
    sortOrder: Number(row.sort_order),
    active: !!row.active,
  };
}

function toCategory(row) {
  return {
    id: String(row.id),
    name: row.name,
    image: row.image,
    href: row.href,
    kind: row.kind,
    sortOrder: Number(row.sort_order),
    active: !!row.active,
  };
}

function toTestimonial(row) {
  return {
    id: String(row.id),
    text: row.text,
    customer: row.customer,
    date: row.date,
    product: row.product,
    rating: Number(row.rating),
    image: row.image,
    sortOrder: Number(row.sort_order),
    active: !!row.active,
  };
}

module.exports = { safeParse, toProduct, toCategory, toTestimonial };
