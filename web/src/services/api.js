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

export async function fetchCategories() {
  const response = await fetch("/odata/v4/marketplace/Categories");

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function createProduct(productData) {
  const response = await fetch("/odata/v4/marketplace/Products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create product: ${response.status}`);
  }

  return await response.json();
}

export async function fetchCountries() {
  const response = await fetch("/odata/v4/marketplace/Countries");

  if (!response.ok) {
    throw new Error(`Failed to fetch countries: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function createUser(userData) {
  const response = await fetch("/odata/v4/marketplace/Users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.status}`);
  }

  return await response.json();
}

export async function fetchUsers() {
  const response = await fetch("/odata/v4/marketplace/Users?$expand=country");

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchProductsByCountry(countryId) {
  const response = await fetch(
    `/odata/v4/marketplace/Products?$expand=category,seller,country&$filter=country_ID eq '${countryId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch filtered products: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}