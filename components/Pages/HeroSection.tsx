"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from 'next/link'

export function HeroSection() {
  return (<section className="relative min-h-screen overflow-hidden bg-linear-to-b from-blue-500 via-blue-500 to-blue-0">

    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 h-full">
      <div className="flex justify-center items-center min-h-screen gap-8">

        <div className='flex flex-col items-center text-center'>
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Savdo Marketga
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                xush kelibsiz!
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl leading-relaxed">
              Minglab mahsulotlarda ajoyib chegirmalarni kashf qiling va tezkor yetkazib berish bilan uyga qulay xarid qiling.
            </p>
          </div>

          <a href={'/#takliflar'}>
            <Button size={"lg"}  className="flex rounded-xl items-center mt-4 bg-white text-blue-600 hover:bg-white/90 font-semibold text-lg px-8 py-6">
              Xaridni Boshlash
              <ChevronRight className="w-5 h-5 " />
            </Button>
          </a>

        </div>
      </div>
    </div>
    

  </section>


  )
}
