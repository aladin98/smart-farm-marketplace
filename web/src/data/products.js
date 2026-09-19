import quailsImg from "../assets/images/quails.jpg";
import incubatorImg from "../assets/images/incubator.jpg";
import eggsImg from "../assets/images/eggs.jpg";
import vetImg from "../assets/images/vet.jpg";

export const categories = [
  "All",
  "Animals",
  "Services",
  "Veterinarian",
  "Couveuses",
  "Equipment",
  "Feed",
  "Medicines",
  "Other",
];

export const products = [
  {
    id: 1,
    name: "Jumbo Quails Pack",
    age: "6 weeks",
    description: "Healthy quails for egg production",
    price: "250 MAD",
    city: "Casablanca",
    delivery: true,
    category: "Quails",
    image: quailsImg,
  },
  {
    id: 2,
    name: "Incubator 48 Eggs",
    age: "1 year",
    description: "Automatic incubator in excellent condition",
    price: "1200 MAD",
    city: "Rabat",
    delivery: false,
    category: "Couveuses",
    image: incubatorImg,
  },
  {
    id: 3,
    name: "Country Eggs",
    age: "Fresh",
    description: "Natural farm eggs",
    price: "40 MAD",
    city: "Meknes",
    delivery: true,
    category: "Eggs",
    image: eggsImg,
  },
  {
    id: 4,
    name: "Veterinary Visit",
    age: "Service",
    description: "Home animal doctor consultation",
    price: "300 MAD",
    city: "Kenitra",
    delivery: false,
    category: "Veterinarian",
    image: vetImg,
  },
];