"use client"

import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"
import { Heart } from "lucide-react"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section - Join Our Community */}
      <div className="w-full bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Join Our Community</h3>
            <p className="text-gray-300 mb-6">
              Subscribe to our newsletter and be the first to know about new projects and updates.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400 text-sm"
                aria-label="Email for newsletter subscription"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <img src="/umoja.png" alt="" className="rounded-lg w-auto" />
                </div>
                <span className="font-bold text-lg">UmojaFund</span>
              </div>
              <p className="text-gray-400 text-sm">{t.footer.brandDesc}</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-4">{t.footer.quickLinks}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    {t.nav.home}
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="hover:text-white transition-colors">
                    {t.nav.projects}
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    {t.nav.about}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    {t.nav.contact}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-4">{t.footer.support}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="/help" className="hover:text-white transition-colors">
                    {t.footer.helpCenter}
                  </a>
                </li>
                <li>
                  <a href="/docs" className="hover:text-white transition-colors">
                    {t.footer.documentation}
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-white transition-colors">
                    {t.footer.faq}
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition-colors">
                    {t.footer.contactSupport}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold mb-4">{t.footer.legal}</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="/privacy" className="hover:text-white transition-colors">
                    {t.footer.privacyPolicy}
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-white transition-colors">
                    {t.footer.termsOfService}
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="hover:text-white transition-colors">
                    {t.footer.cookiePolicy}
                  </a>
                </li>
                <li>
                  <a href="/disclaimer" className="hover:text-white transition-colors">
                    {t.footer.disclaimer}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
              <p>© 2025 UmojaFund. {t.footer.rights}</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">
                  {t.footer.twitter}
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  {t.footer.facebook}
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  {t.footer.linkedin}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}