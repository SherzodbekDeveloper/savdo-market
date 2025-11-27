"use client"

import { FC, useState } from "react"
import Image from "next/image"
import { Item } from '@/types'

interface Props {
  product: Item
  fill?: boolean
  className?: string
}

const CustomImage: FC<Props> = ({ product, fill, className }) => {
  const [isLoading, setIsLoading] = useState(true)

  const conditionalProps = fill
    ? { fill: true as const }
    : { width: 400, height: 1000 }

  return (
    <div className={fill ? "relative w-full h-80" : undefined}>
      <Image
        src={product.image}
        alt={product.title}
        {...conditionalProps}
        onLoadingComplete={() => setIsLoading(false)}
        className={`object-contain duration-700 ease-in-out transition-all ${className}`}
        style={{
          filter: isLoading ? "blur(20px) grayscale(100%)" : "blur(0px) grayscale(0%)",
          transform: isLoading ? "scale(1.3)" : "scale(1)",
          transition: "filter 0.7s ease, transform 0.7s ease"
        }}
      />
    </div>
  )
}

export default CustomImage
