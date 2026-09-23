import { getCurrentUser } from "./auth";

const API_BASE =
  import.meta.env.VITE_API_BASE || "/odata/v4/marketplace";

  console.log("API_BASE =", API_BASE);
  
function getAuthHeaders(extraHeaders = {}) {
  const currentUser = getCurrentUser();

  return {
    "Content-Type": "application/json",
    "x-user-email": currentUser?.email || "",
    ...extraHeaders,
  };
}

export async function fetchProducts() {
  const response = await fetch(
    `${API_BASE}/Products?$expand=category,seller,country`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchCategories() {
  const response = await fetch(`${API_BASE}/Categories`);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function createProduct(productData) {
  const response = await fetch(`${API_BASE}/Products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create product: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

export async function fetchCountries() {
  const response = await fetch(`${API_BASE}/Countries`);

  if (!response.ok) {
    throw new Error(`Failed to fetch countries: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchProductsByCountry(countryId) {
  const response = await fetch(
    `${API_BASE}/Products?$expand=category,seller,country`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch filtered products: ${response.status}`);
  }

  const data = await response.json();
  return data.value.filter((product) => product.country_ID === countryId);
}

export async function fetchFarmAnimalsByOwner(ownerId) {
  const response = await fetch(
    `${API_BASE}/FarmAnimals?$expand=animalType,variant,place,cage&$filter=owner_ID eq '${ownerId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch farm animals: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchIncubatorsByOwner(ownerId) {
  const response = await fetch(
    `${API_BASE}/Incubators?$filter=owner_ID eq '${ownerId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch incubators: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchIncubationCycles() {
  const response = await fetch(
    `${API_BASE}/IncubationCycles?$expand=incubator`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch incubation cycles: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchIncubationCyclesByIncubator(incubatorId) {
  const response = await fetch(
    `${API_BASE}/IncubationCycles?$filter=incubator_ID eq '${incubatorId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch incubation cycles: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function createIncubator(incubatorData) {
  const response = await fetch(`${API_BASE}/Incubators`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(incubatorData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create incubator: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

export async function fetchPlacesByOwner(ownerId) {
  const response = await fetch(
    `${API_BASE}/Places?$filter=owner_ID eq '${ownerId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch places: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchCagesByOwner(ownerId) {
  const response = await fetch(
    `${API_BASE}/Cages?$expand=place&$filter=owner_ID eq '${ownerId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch cages: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchEquipmentsByOwner(ownerId) {
  const response = await fetch(
    `${API_BASE}/Equipments?$filter=owner_ID eq '${ownerId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch equipments: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchAnimalTypes() {
  const response = await fetch(`${API_BASE}/AnimalTypes`);

  if (!response.ok) {
    throw new Error(`Failed to fetch animal types: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchAnimalVariants() {
  const response = await fetch(
    `${API_BASE}/AnimalVariants?$expand=animalType`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch animal variants: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function createFarmAnimal(animalData) {
  const response = await fetch(`${API_BASE}/FarmAnimals`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(animalData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create farm animal: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

export async function updateFarmAnimal(id, animalData) {
  const response = await fetch(`${API_BASE}/FarmAnimals('${id}')`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(animalData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update farm animal: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function deleteFarmAnimal(id) {
  const response = await fetch(`${API_BASE}/FarmAnimals('${id}')`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete farm animal: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function createIncubationCycle(cycleData) {
  const response = await fetch(`${API_BASE}/IncubationCycles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(cycleData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create incubation cycle: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

export async function updateIncubationCycle(id, cycleData) {
  const response = await fetch(`${API_BASE}/IncubationCycles('${id}')`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(cycleData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update incubation cycle: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function deleteIncubationCycle(id) {
  const response = await fetch(`${API_BASE}/IncubationCycles('${id}')`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete incubation cycle: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function createPlace(placeData) {
  const response = await fetch(`${API_BASE}/Places`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(placeData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create place: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

export async function updatePlace(id, placeData) {
  const response = await fetch(`${API_BASE}/Places('${id}')`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(placeData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update place: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function deletePlace(id) {
  const response = await fetch(`${API_BASE}/Places('${id}')`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete place: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function createCage(cageData) {
  const response = await fetch(`${API_BASE}/Cages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(cageData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create cage: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

export async function updateCage(id, cageData) {
  const response = await fetch(`${API_BASE}/Cages('${id}')`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(cageData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update cage: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function deleteCage(id) {
  const response = await fetch(`${API_BASE}/Cages('${id}')`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete cage: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function createEquipment(equipmentData) {
  const response = await fetch(`${API_BASE}/Equipments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(equipmentData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create equipment: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

export async function updateEquipment(id, equipmentData) {
  const response = await fetch(`${API_BASE}/Equipments('${id}')`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(equipmentData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update equipment: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function deleteEquipment(id) {
  const response = await fetch(`${API_BASE}/Equipments('${id}')`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete equipment: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function fetchLearningCategories() {
  const response = await fetch(`${API_BASE}/LearningCategories`);

  if (!response.ok) {
    throw new Error(`Failed to fetch learning categories: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchLearningArticles() {
  const response = await fetch(
    `${API_BASE}/LearningArticles?$expand=category`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch learning articles: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function deleteLearningArticle(articleId) {
  const response = await fetch(`${API_BASE}/LearningArticles('${articleId}')`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to delete learning article");
  }

  return true;
}

export async function updateLearningArticle(articleId, payload) {
  const response = await fetch(`${API_BASE}/LearningArticles('${articleId}')`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update learning article");
  }

  return response.json();
}

export async function createLearningArticle(payload) {
  const response = await fetch(`${API_BASE}/LearningArticles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create learning article");
  }

  return response.json();
}

export async function fetchUsers() {
  const response = await fetch(`${API_BASE}/Users?$expand=country`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch users: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  return data.value || [];
}

export async function updateProfile(id, updates) {
  const response = await fetch(`${API_BASE}/Users('${id}')`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update profile: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function updateUser(id, updates) {
  const response = await fetch(`${API_BASE}/Users('${id}')`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update user: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function deleteUser(id) {
  const response = await fetch(`${API_BASE}/Users('${id}')`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete user: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function createUser(userData) {
  const response = await fetch(`${API_BASE}/Users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create user: ${response.status} - ${errorText}`
    );
  }

  return response.json();
}

export async function loginRequest(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function fetchCurrentUser() {
  const response = await fetch(`${API_BASE}/me()`, {
    method: "GET",
    headers: {
      "x-user-email": getCurrentUser()?.email || "",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch current user: ${response.status} - ${errorText}`
    );
  }

  return response.json();
}

export async function updateIncubator(id, incubatorData) {
  const response = await fetch(`${API_BASE}/Incubators('${id}')`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(incubatorData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update incubator: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function deleteIncubator(id) {
  const response = await fetch(`${API_BASE}/Incubators('${id}')`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete incubator: ${response.status} - ${errorText}`
    );
  }

  return true;
}