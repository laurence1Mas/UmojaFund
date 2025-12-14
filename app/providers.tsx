"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { translations, type Language } from "@/lib/i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (typeof translations)[Language]
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function Providers({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr")

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguageContext() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguageContext must be used within a Providers component")
  }
  return context
}

export function useLanguage() {
  return useLanguageContext()
}
