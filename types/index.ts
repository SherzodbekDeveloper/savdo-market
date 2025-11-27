export interface Item {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: {
    rate: number
    count: number
  }
}

export interface FetchState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

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

export interface CartItem {
  productId: number
  quantity: number
  addedAt: Date
  price: number
  title: string
  image: string
}

export interface FavoriteItem {
  productId: number
  addedAt: Date
  price: number
  title: string
  image: string
}

export interface Order {
  orderId: string
  userId: string
  items: CartItem[]
  totalPrice: number
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
  shippingAddress: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
}
