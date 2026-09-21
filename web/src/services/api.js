import { getCurrentUser } from "./auth";

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
    const errorText = await response.text();
    throw new Error(`Failed to create product: ${response.status} - ${errorText}`);
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
    const errorText = await response.text();
    throw new Error(`Failed to create user: ${response.status} - ${errorText}`);
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
    "/odata/v4/marketplace/Products?$expand=category,seller,country"
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch filtered products: ${response.status}`);
  }

  const data = await response.json();

  return data.value.filter((product) => product.country_ID === countryId);
}

export async function fetchFarmAnimalsByOwner(ownerId) {
  const response = await fetch(
    `/odata/v4/marketplace/FarmAnimals?$expand=animalType,variant,place,cage&$filter=owner_ID eq '${ownerId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch farm animals: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchIncubatorsByOwner(ownerId) {
  const response = await fetch(
    `/odata/v4/marketplace/Incubators?$filter=owner_ID eq '${ownerId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch incubators: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchIncubationCycles() {
  const response = await fetch(
    `/odata/v4/marketplace/IncubationCycles?$expand=incubator`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch incubation cycles: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchIncubationCyclesByIncubator(incubatorId) {
  const response = await fetch(
    `/odata/v4/marketplace/IncubationCycles?$filter=incubator_ID eq '${incubatorId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch incubation cycles: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchPlacesByOwner(ownerId) {
  const response = await fetch(
    `/odata/v4/marketplace/Places?$filter=owner_ID eq '${ownerId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch places: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchCagesByOwner(ownerId) {
  const response = await fetch(
    `/odata/v4/marketplace/Cages?$expand=place&$filter=owner_ID eq '${ownerId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch cages: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchEquipmentsByOwner(ownerId) {
  const response = await fetch(
    `/odata/v4/marketplace/Equipments?$filter=owner_ID eq '${ownerId}'`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch equipments: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchAnimalTypes() {
  const response = await fetch("/odata/v4/marketplace/AnimalTypes");

  if (!response.ok) {
    throw new Error(`Failed to fetch animal types: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchAnimalVariants() {
  const response = await fetch(
    "/odata/v4/marketplace/AnimalVariants?$expand=animalType"
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch animal variants: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function createFarmAnimal(animalData) {
  const response = await fetch("/odata/v4/marketplace/FarmAnimals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(animalData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create farm animal: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function updateFarmAnimal(id, animalData) {
  const response = await fetch(`/odata/v4/marketplace/FarmAnimals('${id}')`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(animalData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update farm animal: ${response.status} - ${errorText}`);
  }

  return true;
}

export async function deleteFarmAnimal(id) {
  const response = await fetch(`/odata/v4/marketplace/FarmAnimals('${id}')`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete farm animal: ${response.status} - ${errorText}`);
  }

  return true;
}

export async function createIncubator(incubatorData) {
  const response = await fetch("/odata/v4/marketplace/Incubators", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(incubatorData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create incubator: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function createIncubationCycle(cycleData) {
  const response = await fetch("/odata/v4/marketplace/IncubationCycles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cycleData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create incubation cycle: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function updateIncubationCycle(id, cycleData) {
  const response = await fetch(
    `/odata/v4/marketplace/IncubationCycles('${id}')`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cycleData),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update incubation cycle: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function deleteIncubationCycle(id) {
  const response = await fetch(
    `/odata/v4/marketplace/IncubationCycles('${id}')`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete incubation cycle: ${response.status} - ${errorText}`
    );
  }

  return true;
}

export async function createPlace(placeData) {
  const response = await fetch("/odata/v4/marketplace/Places", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(placeData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create place: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function updatePlace(id, placeData) {
  const response = await fetch(`/odata/v4/marketplace/Places('${id}')`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(placeData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update place: ${response.status} - ${errorText}`);
  }

  return true;
}

export async function deletePlace(id) {
  const response = await fetch(`/odata/v4/marketplace/Places('${id}')`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete place: ${response.status} - ${errorText}`);
  }

  return true;
}

export async function createCage(cageData) {
  const response = await fetch("/odata/v4/marketplace/Cages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cageData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create cage: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function updateCage(id, cageData) {
  const response = await fetch(`/odata/v4/marketplace/Cages('${id}')`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cageData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update cage: ${response.status} - ${errorText}`);
  }

  return true;
}

export async function deleteCage(id) {
  const response = await fetch(`/odata/v4/marketplace/Cages('${id}')`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete cage: ${response.status} - ${errorText}`);
  }

  return true;
}

export async function createEquipment(equipmentData) {
  const response = await fetch("/odata/v4/marketplace/Equipments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipmentData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create equipment: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function updateEquipment(id, equipmentData) {
  const response = await fetch(`/odata/v4/marketplace/Equipments('${id}')`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipmentData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update equipment: ${response.status} - ${errorText}`);
  }

  return true;
}

export async function deleteEquipment(id) {
  const response = await fetch(`/odata/v4/marketplace/Equipments('${id}')`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete equipment: ${response.status} - ${errorText}`);
  }

  return true;
}

export async function updateUser(id, userData) {
  const response = await fetch(`/odata/v4/marketplace/Users('${id}')`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update user: ${response.status} - ${errorText}`);
  }

  return true;
}

export async function fetchLearningCategories() {
  const response = await fetch("/odata/v4/marketplace/LearningCategories");

  if (!response.ok) {
    throw new Error(`Failed to fetch learning categories: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}

export async function fetchLearningArticles() {
  const response = await fetch(
    "/odata/v4/marketplace/LearningArticles?$expand=category"
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch learning articles: ${response.status}`);
  }

  const data = await response.json();
  return data.value;
}


export async function deleteLearningArticle(articleId) {
  const response = await fetch(`/odata/v4/marketplace/LearningArticles/${articleId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to delete learning article");
  }

  return true;
}

export async function updateLearningArticle(articleId, payload) {
  const response = await fetch(`/odata/v4/marketplace/LearningArticles/${articleId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update learning article");
  }

  return response.json();
}

const API_BASE = "/odata/v4/marketplace";

export async function createLearningArticle(payload) {
  const currentUser = getCurrentUser();

  const response = await fetch(`${API_BASE}/LearningArticles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": currentUser?.ID || ""
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create learning article");
  }

  return response.json();
}