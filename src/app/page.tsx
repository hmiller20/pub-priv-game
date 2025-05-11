"use client"

import { useRouter } from "next/navigation"
import FloatingBubblesBackground from "./floating-bubbles"

export default function Home() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/avatar')
  }

  return (
    <FloatingBubblesBackground 
      title="Category Story" 
      onButtonClick={handleClick}
    />
  )
}
