export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  avatar: string;
  birthDate: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  company: string;
  jobTitle: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  sku: string;
  weight: number;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  userId: string;
  tags: string[];
  reactions: number;
  views: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  body: string;
  author: string;
  email: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  userId: string;
  todo: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

export interface Cart {
  id: string;
  userId: string;
  products: CartItem[];
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  roomId: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Quote {
  id: string;
  content: string;
  author: string;
  category: string;
  likes: number;
  createdAt: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  cuisine: string;
  calories: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  image: string;
  rating: number;
  createdAt: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  currency: string;
  language: string;
  flag: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  foundedYear: number;
  employees: number;
  revenue: string;
  logo: string;
  createdAt: string;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  exchange: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  organizer: string;
  attendees: number;
  maxAttendees: number;
  price: number;
  isFree: boolean;
  image: string;
  tags: string[];
  createdAt: string;
}
