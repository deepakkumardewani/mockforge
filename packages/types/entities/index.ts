export interface User {
  id: number;
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
  id: number;
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
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: number;
  views: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  body: string;
  author: string;
  email: string;
  createdAt: string;
}

export interface Todo {
  id: number;
  userId: number;
  todo: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
}

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

export interface Cart {
  id: number;
  userId: number;
  products: CartItem[];
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  roomId: number;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Quote {
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
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
