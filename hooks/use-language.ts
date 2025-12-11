"use client"

import { useContext } from "react"
import { LanguageContext } from "@/app/providers"

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return {
    language: context.language,
    t: context.t,
    setLanguage: context.setLanguage,
  }
}
