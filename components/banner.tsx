'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Pagination, Navigation, Autoplay } from 'swiper/modules'
import Image from 'next/image'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

// Banner interface
interface Banner {
  id: string
  imageUrl: string
  title: string
  link: string
  isActive: boolean
  order: number
}

export default function Slider() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const q = query(collection(db, 'banners'), orderBy('order', 'asc'))
        const snapshot = await getDocs(q)
        const data = snapshot.docs
          .map(doc => {
            const d = doc.data()
            return {
              id: doc.id,
              imageUrl: d.imageUrl,
              title: d.title,
              link: d.link,
              isActive: d.isActive,
              order: d.order,
            } as Banner
          })
          .filter(b => b.isActive) // faqat active bannerlar
        setBanners(data)
      } catch (error) {
        console.error('Error fetching banners:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!banners.length) return <div>No banners available</div>

  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={30}
      loop={true}
      pagination={{ clickable: true }}
      navigation={true}
      autoplay={{ delay: 5000 }}
      modules={[Pagination, Navigation, Autoplay]}
      className="mySwiper"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id}>
          <a href={banner.link || '#'}>
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              width={1200}
              height={600}
              className="object-cover w-full h-[300px] sm:h-[600px]"
            />
          </a>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
