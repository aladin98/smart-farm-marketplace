export async function fetchProducts() {
  const response = await fetch(
    "/odata/v4/marketplace/Products?$expand=category,seller,country"
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}