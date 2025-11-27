"use client"
import { useAuth } from "@/contexts/auth-context"
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function Navbar() {
	const { user } = useAuth()
	const [products, setProducts] = useState<any[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetchProducts() {
			try {
				const res = await fetch("https://fakestoreapi.com/products")
				const data = await res.json()
				setProducts(data)
			} catch (error) {
				console.error("Error fetching products:", error)
			} finally {
				setLoading(false)
			}
		}
		fetchProducts()
	}, [])

	const filteredProducts = products
		.filter((product) => product.title.toLowerCase().includes(searchTerm.toLowerCase()))
		.slice(0, 8)

	return (
		<header className="bg-white border-b border-gray-200 sticky top-0 w-full z-50 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 md:px-8">
				<div className="flex items-center justify-between h-16 gap-6">
					{/* Logo */}
					<Link href="/" className="flex-shrink-0">
						<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
							Savdo Market
						</h1>
					</Link>

					<div className="hidden md:flex flex-1 max-w-xl">
						<div className="relative w-full">
							<input
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								type="text"
								placeholder="Mahsulotlarni qidirish..."
								className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
							/>
							<Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />

							{searchTerm && filteredProducts.length > 0 && (
								<div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-10">
									<div className="p-3 space-y-2">
										{filteredProducts.map((product) => (
											<Link
												key={product.id}
												href={`/product/${product.id}`}
												className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
											>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
														{product.title}
													</p>
													<p className="text-xs text-gray-600 mt-0.5">${product.price?.toFixed(2)}</p>
												</div>
											</Link>
										))}
									</div>
									{searchTerm && filteredProducts.length === 0 && (
										<div className="p-6 text-center text-sm text-gray-500">Mahsulot topilmadi.</div>
									)}
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2 md:gap-6">
						<button
							onClick={() => setIsSearchOpen(!isSearchOpen)}
							className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
							aria-label="Search"
						>
							<Search className="w-5 h-5" />
						</button>

						{user ? (
							<>
								<div className="hidden sm:flex items-center gap-6">
									<Link
										href="/profile"
										className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
									>
										<User className="w-5 h-5" />
										<span className="hidden md:inline">{user.firstName}</span>
									</Link>
									<Link
										href="/favorites"
										className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
									>
										<Heart className="w-5 h-5" />
										<span className="hidden md:inline">Saralanganlar</span>
									</Link>
									<Link href="/cart" className="relative">
										<div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
											<ShoppingCart className="w-5 h-5" />
											<span className="hidden md:inline">Savat</span>
										</div>
									</Link>
								</div>

								<button
									onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
									className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
									aria-label="Menu"
								>
									{isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
								</button>
							</>
						) : (
							<>
								<div className="hidden sm:flex items-center gap-6">
									<Link
										href="/auth/login"
										className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
									>
										<User className="w-5 h-5" />
										<span className="hidden md:inline">Kirish</span>
									</Link>
									<Link
										href="/favorites"
										className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
									>
										<Heart className="w-5 h-5" />
										<span className="hidden md:inline">Saralanganlar</span>
									</Link>
									<Link href="/cart" className="relative">
										<div className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
											<ShoppingCart className="w-5 h-5" />
											<span className="hidden md:inline">Savat</span>
										</div>
									</Link>
								</div>

								<button
									onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
									className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
									aria-label="Menu"
								>
									{isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
								</button>
							</>
						)}
					</div>
				</div>

				{isSearchOpen && (
					<div className="md:hidden pb-4">
						<div className="relative">
							<input
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								type="text"
								placeholder="Mahsulotlarni qidirish..."
								className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
								autoFocus
							/>
							<Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						</div>
					</div>
				)}

				{isMobileMenuOpen && (
					<div className="sm:hidden pb-4 border-t border-gray-200 pt-4 space-y-3">
						{user ? (
							<>
								<Link
									href="/profile"
									className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
								>
									<User className="w-5 h-5" />
									{user.firstName}
								</Link>
								<Link
									href="/favorites"
									className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
								>
									<Heart className="w-5 h-5" />
									Saralanganlar
								</Link>
								<Link
									href="/cart"
									className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
								>
									<ShoppingCart className="w-5 h-5" />
									Savat
								</Link>
							</>
						) : (
							<>
								<Link
									href="/auth/login"
									className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
								>
									<User className="w-5 h-5" />
									Kirish
								</Link>
								<Link
									href="/favorites"
									className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
								>
									<Heart className="w-5 h-5" />
									Saralanganlar
								</Link>
								<Link
									href="/cart"
									className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
								>
									<ShoppingCart className="w-5 h-5" />
									Savat
								</Link>
							</>
						)}
					</div>
				)}
			</div>
		</header>
	)
}

export default Navbar
