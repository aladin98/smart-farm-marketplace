using { smartfarm.marketplace as db } from '../db/schema';

service marketplace {
  entity Countries          as projection on db.Countries;
  entity Users              as projection on db.Users;
  entity Categories         as projection on db.Categories;
  entity Products           as projection on db.Products;
  entity AnimalTypes        as projection on db.AnimalTypes;
  entity AnimalVariants     as projection on db.AnimalVariants;
  entity FarmAnimals        as projection on db.FarmAnimals;
  entity Incubators         as projection on db.Incubators;
  entity IncubationCycles   as projection on db.IncubationCycles;
  entity Places             as projection on db.Places;
  entity Cages              as projection on db.Cages;
  entity Equipments         as projection on db.Equipments;
  entity LearningCategories as projection on db.LearningCategories;
  entity LearningArticles   as projection on db.LearningArticles;

  action login(email: String, password: String) returns Users;
  function me() returns Users;
  action resetPassword(email: String, newPassword: String) returns String;
}