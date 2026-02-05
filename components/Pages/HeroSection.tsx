
"use client"


import Link from 'next/link'
import Slider from '../banner'

import { FaMobileAlt, FaLaptop, FaTshirt, FaShoePrints, FaHeart, FaShoppingBag, FaAppleAlt } from 'react-icons/fa'

const categories = [
  { id: 1, title: "Mobil telefonlar", link: "/category/electronics/mobile-phones", icon: <FaMobileAlt /> },
  { id: 2, title: "Noutbuklar", link: "/category/electronics/laptops", icon: <FaLaptop /> },
  { id: 3, title: "Erkak kiyimlari", link: "/category/fashion/mens-clothing", icon: <FaTshirt /> },
  { id: 4, title: "Oyoq kiyimlar", link: "/category/fashion/shoes", icon: <FaShoePrints /> },
  { id: 5, title: "Go'zallik va sog'liq", link: "/category/beauty/health", icon: <FaHeart /> },
  { id: 6, title: "Grocery / Oziq-ovqat", link: "/category/grocery", icon: <FaAppleAlt /> },
  { id: 7, title: "Aksessuarlar", link: "/category/fashion/accessories", icon: <FaShoppingBag /> },
];

export function HeroSection() {
  return (<section className="relative  overflow-hidden">

    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 h-full">
      <div className="">
        <div className='flex items-center gap-3 py-4'>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={cat.link}
              className='flex items-center text-sm gap-2 border border-gray-200 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 transition'
            >
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </Link>
          ))}
        </div>
        <Slider />
      </div>
    </div>
  </section>


  )
}