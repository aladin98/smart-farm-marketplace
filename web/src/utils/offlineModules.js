import {
  // Places
  fetchPlacesByOwner,
  createPlace,
  updatePlace,
  deletePlace,

  // Equipments
  fetchEquipmentsByOwner,
  createEquipment,
  updateEquipment,
  deleteEquipment,

  // Animals
  fetchFarmAnimalsByOwner,
  createFarmAnimal,
  updateFarmAnimal,
  deleteFarmAnimal,

  // Incubators
  fetchIncubatorsByOwner,
  createIncubator,
  updateIncubator,
  deleteIncubator,

  // Cages
  fetchCagesByOwner,
  createCage,
  updateCage,
  deleteCage,

  // Learning
  fetchLearningArticles,
  createLearningArticle,
  updateLearningArticle,
  deleteLearningArticle,
} from "../services/api";

export const offlineModules = {
  places: {
    fetchFn: (userId) => fetchPlacesByOwner(userId),
    createFn: createPlace,
    updateFn: updatePlace,
    deleteFn: deletePlace,
    buildPayload: (item) => ({
      owner_ID: item.owner_ID,
      name: item.name,
      placeNumber: item.placeNumber,
      description: item.description,
    }),
  },

  equipments: {
    fetchFn: (userId) => fetchEquipmentsByOwner(userId),
    createFn: createEquipment,
    updateFn: updateEquipment,
    deleteFn: deleteEquipment,
    buildPayload: (item) => ({
      owner_ID: item.owner_ID,
      name: item.name,
      category: item.category,
      condition: item.condition,
      quantity: item.quantity,
      notes: item.notes,
      photoUrl: item.photoUrl,
    }),
  },

  animals: {
    fetchFn: (userId) => fetchFarmAnimalsByOwner(userId),
    createFn: createFarmAnimal,
    updateFn: updateFarmAnimal,
    deleteFn: deleteFarmAnimal,
    buildPayload: (item) => ({
      owner_ID: item.owner_ID,
      animalType_ID: item.animalType_ID,
      variant_ID: item.variant_ID || null,
      place_ID: item.place_ID || null,
      cage_ID: item.cage_ID || null,
      customName: item.customName,
      groupNumber: item.groupNumber,
      age: item.age,
      sourceType: item.sourceType,
      quantity: item.quantity,
      notes: item.notes,
      photoUrl: item.photoUrl,
    }),
  },

  incubators: {
    fetchFn: (userId) => fetchIncubatorsByOwner(userId),
    createFn: createIncubator,
    updateFn: updateIncubator,
    deleteFn: deleteIncubator,
    buildPayload: (item) => ({
      owner_ID: item.owner_ID,
      name: item.name,
      capacity: item.capacity,
      currentEggCount: item.currentEggCount,
      temperature: item.temperature,
      humidity: item.humidity,
      status: item.status,
      notes: item.notes,
      photoUrl: item.photoUrl,
    }),
  },

  cages: {
    fetchFn: (userId) => fetchCagesByOwner(userId),
    createFn: createCage,
    updateFn: updateCage,
    deleteFn: deleteCage,
    buildPayload: (item) => ({
      owner_ID: item.owner_ID,
      name: item.name,
      cageNumber: item.cageNumber,
      capacity: item.capacity,
      status: item.status,
      notes: item.notes,
      place_ID: item.place_ID || null,
      photoUrl: item.photoUrl,
    }),
  },

  learning: {
    fetchFn: () => fetchLearningArticles(),
    createFn: createLearningArticle,
    updateFn: updateLearningArticle,
    deleteFn: deleteLearningArticle,
    buildPayload: (item) => ({
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      imageUrl: item.imageUrl,
    }),
  },
};