def build_product_text(product):
    parts = []

    if product.get("listingType"):
        parts.append(product["listingType"])

    if product.get("name_norm"):
        parts.append(f"{product['name_norm']}")

    if product.get("material_norm"):
        parts.append(f"{product['material_norm']} fabric")

    if product.get("category_norm"):
        parts.append(f"for {product['category_norm']}")

    if product.get("description_norm"):
        parts.append(product["description_norm"])

    if product.get("tags"):
        parts.append(" ".join(product["tags"]))

    return " ".join(parts)
