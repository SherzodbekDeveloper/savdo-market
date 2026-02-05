// Product Specifications
export interface ProductSpecs {
  model?: string
  display?: string
  processor?: string
  camera?: string
  battery?: string
  warranty?: string
  material?: string
  weight?: string
  dimensions?: string
  color?: string
  storage?: string
  ram?: string
  [key: string]: any
}

// Product Variants
export interface ProductVariant {
  value: string
  priceDiff: number
}

export interface ProductVariants {
  colors?: ProductVariant[]
  sizes?: ProductVariant[]
  [key: string]: ProductVariant[] | undefined
}

// Main Product Item
export interface Item {
  id: string
  docId?: string
  title: string
  price: number
  basePrice?: number
  desc?: string
  brand?: string
  category: string
  image: string
  imageUrl?: string
  quantity?: number
  specs?: ProductSpecs
  rating?: {
    rate: number
    count: number
  }
  variants?: ProductVariants
  extra?: {
    material?: string
    Qalinligi?: string
    [key: string]: any
  }
}

// Fetch State for async operations
export interface FetchState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

// User Profile
export interface User {
  uid: string
  email: string
  firstName: string
  lastName: string
  phone: string
  age: number
  region: string
  createdAt: Date
  updatedAt: Date
}

// Cart Item with product reference
export interface CartItem {
  id?: string
  productId: string
  variantKey?: string
  quantity: number
  addedAt: Date
  price: number
  title: string
  image: string
  specs?: ProductSpecs
}

// Favorite Item
export interface FavoriteItem {
  productId: string
  addedAt: Date
  price: number
  title: string
  image: string
  brand?: string
}

// Order
export interface Order {
  orderId: string
  userId: string
  items: CartItem[]
  totalPrice: number
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: Date
  updatedAt?: Date
  shippingAddress: string
}

// Auth Context Type
export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
}

// Filter Options for products
export interface FilterOptions {
  category?: string
  brand?: string
  priceRange?: {
    min: number
    max: number
  }
  searchQuery?: string
}

// API Response Type
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
