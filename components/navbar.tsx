"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { translations } from "@/lib/i18n";
import { useLanguage } from "@/app/providers";

// Load ConnectWallet only on the client to avoid pulling WASM into the server build
const ConnectWallet = dynamic(
  () => import("./wallet/connect-wallet").then((mod) => mod.ConnectWallet),
  { ssr: false }
);

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/projects", label: t.nav.projects },
    { href: "/blog", label: t.nav.blog },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <img src="/umoja.PNG" alt="logo" />
            </div>
            <span className="font-bold text-xl text-primary">UmojaFund</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <ConnectWallet />
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t.nav.login}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-gray-700 hover:text-primary py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <LanguageSwitcher />
              <ConnectWallet />
              <Link
                href="/auth/login"
                className="block text-primary font-medium py-2"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/auth/register"
                className="block bg-primary text-white px-4 py-2 rounded-lg text-center font-medium"
              >
                {t.nav.signUp}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
