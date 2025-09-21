"use client"

import { useState } from "react"
import { LanguageTree } from "@/components/language-tree"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

export default function Home() {
  const [focusFamily, setFocusFamily] = useState<string>("")

  const handleFamilyClick = (familyName: string) => {
    setFocusFamily(familyName)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar onFamilyClick={handleFamilyClick} />
        <main className="flex-1 p-6">
          <LanguageTree focusFamily={focusFamily} />
        </main>
      </div>
    </div>
  )
}
