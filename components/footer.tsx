import Link from "next/link"
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  MessageSquare, 
  Globe, 
  Shield, 
  Heart 
} from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Projects", href: "/projects" },
        { label: "Wallet", href: "/dashboard/wallet" },
        { label: "How it works", href: "/how-it-works" },
        { label: "Pricing", href: "/pricing" },
        { label: "Roadmap", href: "/roadmap" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About us", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Partners", href: "/partners" },
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy", icon: Shield },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Disclaimer", href: "/disclaimer" },
        { label: "Compliance", href: "/compliance" },
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Contact us", href: "/contact", icon: Mail },
        { label: "FAQ", href: "/faq" },
        { label: "Community", href: "/community", icon: MessageSquare },
        { label: "Documentation", href: "/docs" },
      ]
    }
  ]

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/umojafund", label: "Twitter" },
    { icon: Facebook, href: "https://facebook.com/umojafund", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/umojafund", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/umojafund", label: "LinkedIn" },
  ]

  const stats = [
    { value: "500+", label: "Projects Funded" },
    { value: "10K+", label: "Community Members" },
    { value: "$2M+", label: "Total Raised" },
    { value: "98%", label: "Success Rate" },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Newsletter Section */}
      <div className="bg-primary/10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Heart className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Join Our Community</h3>
            <p className="text-gray-300 mb-6">
              Subscribe to our newsletter and be the first to know about new projects and updates.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400"
                aria-label="Email for newsletter subscription"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link 
                href="/" 
                className="flex items-center space-x-3 mb-6 group"
                aria-label="UmojaFund Home"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-xl">U</span>
                </div>
                <div>
                  <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    UmojaFund
                  </span>
                  <p className="text-sm text-gray-400">Empowering communities together</p>
                </div>
              </Link>
              
              <p className="text-gray-300 mb-6 max-w-md">
                We connect innovative projects with passionate supporters. Together, we're building a better future through collaborative funding and community empowerment.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {stats.map((stat) => (
                  <div 
                    key={stat.label} 
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700"
                  >
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      aria-label={`Follow us on ${social.label}`}
                    >
                      <Icon size={18} />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-lg mb-6 pb-2 border-b border-gray-800 inline-block">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => {
                    const Icon = link.icon
                    return (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 group"
                        >
                          {Icon && <Icon size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-400">
                  &copy; {currentYear} UmojaFund. All rights reserved.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Built with ❤️ for global communities
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Language Selector */}
                <div className="flex items-center space-x-2 text-gray-400">
                  <Globe size={16} />
                  <select 
                    className="bg-transparent border-none focus:outline-none text-sm"
                    aria-label="Select language"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="pt">Português</option>
                  </select>
                </div>

                {/* Trust Seals */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Shield size={14} />
                    <span>SSL Secured</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                  <span className="text-xs text-gray-400">PCI Compliant</span>
                </div>

                {/* Payment Methods */}
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-gray-400">Accepted payments:</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-5 bg-gray-800 rounded-sm"></div>
                    <div className="w-8 h-5 bg-gray-800 rounded-sm"></div>
                    <div className="w-8 h-5 bg-gray-800 rounded-sm"></div>
                    <div className="w-8 h-5 bg-gray-800 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile App Links */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <p className="text-sm text-gray-400 mb-4 sm:mb-0">
                  Get the UmojaFund mobile app
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
                    aria-label="Download on App Store"
                  >
                    <div className="w-6 h-6 bg-gray-700 rounded"></div>
                    <div>
                      <div className="text-xs text-gray-400">Download on the</div>
                      <div className="text-sm font-medium">App Store</div>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
                    aria-label="Get it on Google Play"
                  >
                    <div className="w-6 h-6 bg-gray-700 rounded"></div>
                    <div>
                      <div className="text-xs text-gray-400">Get it on</div>
                      <div className="text-sm font-medium">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-40"
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  )
}