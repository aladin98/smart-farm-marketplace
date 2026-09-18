namespace smartfarm.marketplace;

using { cuid, managed } from '@sap/cds/common';

entity Countries : cuid, managed {
  code : String(10);
  name : localized String(100);
}

entity Users : cuid, managed {
  firstName     : String(100);
  lastName      : String(100);
  email         : String(150);
  passwordHash  : String(255);
  phoneNumber   : String(30);
  idCardNumber  : String(50);
  city          : String(100);
  country       : Association to Countries;
  profilePhoto  : String(500);
}

entity Categories : cuid, managed {
  name          : localized String(100);
  description   : localized String(255);
}

entity Products : cuid, managed {
  name              : String(150);
  age               : String(50);
  description       : String(1000);
  photoUrl          : String(500);
  deliveryAvailable : Boolean;
  condition         : String(30);
  isNegotiable      : Boolean;
  price             : Decimal(10,2);
  phoneNumber       : String(30);
  city              : String(100);
  country           : Association to Countries;
  status            : String(30);
  seller            : Association to Users;
  category          : Association to Categories;
}

entity AnimalTypes : cuid, managed {
  name         : localized String(100);
  description  : localized String(255);
  photoUrl     : String(500);
}

entity AnimalVariants : cuid, managed {
  name         : localized String(100);
  description  : localized String(255);
  animalType   : Association to AnimalTypes;
}

entity FarmAnimals : cuid, managed {
  owner        : Association to Users;
  animalType   : Association to AnimalTypes;
  variant      : Association to AnimalVariants;
  customName   : String(100);
  photoUrl     : String(500);
  quantity     : Integer;
  notes        : String(1000);
}

entity Incubators : cuid, managed {
  owner        : Association to Users;
  name         : String(150);
  condition    : String(30);   // New / Used
  capacity     : Integer;
  photoUrl     : String(500);
  notes        : String(1000);
}

entity IncubationCycles : cuid, managed {
  incubator        : Association to Incubators;
  eggsCount        : Integer;
  startDate        : Date;
  checkDate        : Date;
  stopDate         : Date;
  hatchDate        : Date;
  status           : String(30);
  notes            : String(1000);
}

entity Places : cuid, managed {
  owner        : Association to Users;
  name         : String(150);
  placeNumber  : String(50);
  description  : String(500);
}

entity Cages : cuid, managed {
  owner        : Association to Users;
  place        : Association to Places;
  cageNumber   : String(50);
  capacity     : Integer;
  notes        : String(500);
}

entity Equipments : cuid, managed {
  owner        : Association to Users;
  name         : String(150);
  category     : String(100);
  condition    : String(30);
  quantity     : Integer;
  photoUrl     : String(500);
  notes        : String(1000);
}

entity LearningCategories : cuid, managed {
  name         : localized String(100);
  description  : localized String(255);
}

entity LearningArticles : cuid, managed {
  title        : localized String(200);
  summary      : localized String(500);
  content      : localized String(5000);
  imageUrl     : String(500);
  category     : Association to LearningCategories;
}