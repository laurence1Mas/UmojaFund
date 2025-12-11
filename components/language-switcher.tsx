"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { translations, type Language } from "@/lib/i18n"
import { useLanguage } from "@/app/providers"

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const t = translations[language]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <p className="text-xs font-semibold text-gray-600 px-3 py-2">{t.nav.selectLanguage}</p>
            {(["en", "fr", "sw"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  language === lang ? "bg-primary text-white font-medium" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {lang === "en" ? t.nav.english : lang === "fr" ? t.nav.french : t.nav.swahili}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
