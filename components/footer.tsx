import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
const currentYear = new Date().getFullYear()

return ( <footer className="max-w-7xl mx-auto text-gray-600 mt-20">


  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-12 py-12">
  
    <div className="space-y-4">
      <h3 className="text-black font-bold text-lg">Savdo Market</h3>
      <p className="text-sm leading-relaxed">
        Sifatli mahsulotlarni eng yaxshi narxlarda onlayn xarid qilishingiz mumkin bo'lgan ishonchli manzil.
      </p>
      <div className="flex gap-4 pt-2">
        <Link href="#" className="hover:text-blue-400 transition-colors">
          <Facebook className="w-5 h-5" />
        </Link>
        <Link href="#" className="hover:text-blue-400 transition-colors">
          <Twitter className="w-5 h-5" />
        </Link>
        <Link href="#" className="hover:text-blue-400 transition-colors">
          <Instagram className="w-5 h-5" />
        </Link>
        <Link href="#" className="hover:text-blue-400 transition-colors">
          <Linkedin className="w-5 h-5" />
        </Link>
      </div>
    </div>

    
    <div className="space-y-4">
      <h4 className="text-black font-semibold">Tezkor havolalar</h4>
      <ul className="space-y-2 text-sm">
        <li>
          <Link href="#" className="hover:text-blue-400 transition-colors">
            Bosh sahifa
          </Link>
        </li>
        <li>
          <Link href="#" className="hover:text-blue-400 transition-colors">
            Kategoriyalar
          </Link>
        </li>
        <li>
          <Link href="#" className="hover:text-blue-400 transition-colors">
            Trenddagi
          </Link>
        </li>
        <li>
          <Link href="#" className="hover:text-blue-400 transition-colors">
            Chegirmalar
          </Link>
        </li>
      </ul>
    </div>


    <div className="space-y-4">
      <h4 className="text-black font-semibold">Mijozlar Xizmati</h4>
      <ul className="space-y-2 text-sm">
        <li>
          <Link href="#" className="hover:text-blue-400 transition-colors">
            Biz haqimizda
          </Link>
        </li>
        <li>
          <Link href="#" className="hover:text-blue-400 transition-colors">
            Bog'lanish
          </Link>
        </li>
        <li>
          <Link href="#" className="hover:text-blue-400 transition-colors">
            Maxfiylik siyosati
          </Link>
        </li>
        <li>
          <Link href="#" className="hover:text-blue-400 transition-colors">
            Shartlar & Qoidalar
          </Link>
        </li>
      </ul>
    </div>

   
    <div className="space-y-4">
      <h4 className="text-black font-semibold">Kontakt ma'lumotlari</h4>
      <ul className="space-y-3 text-sm">
        <li className="flex items-start gap-3">
          <Phone className="w-5 h-5 mt-0.5 shrink-0" />
          <span>+998 (90) 123-45-67</span>
        </li>
        <li className="flex items-start gap-3">
          <Mail className="w-5 h-5 mt-0.5 shrink-0" />
          <span>support@eshop.uz</span>
        </li>
        <li className="flex items-start gap-3">
          <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
          <span>Toshkent, O‘zbekiston</span>
        </li>
      </ul>
    </div>
  </div>


  <div className="border-t border-gray-200"></div>

  
  <div className="px-4 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between">
    <p className="text-sm text-gray-400">&copy; {currentYear} Savdo Market. Barcha huquqlar himoyalangan.</p>
    <div className="flex gap-6 mt-4 md:mt-0 text-sm">
      <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
        Maxfiylik
      </Link>
      <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
        Shartlar
      </Link>
      <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
        Cookie-fayllar
      </Link>
    </div>
  </div>
</footer>


)
}
