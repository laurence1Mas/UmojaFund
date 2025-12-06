"use client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-xl text-gray-600">We'd love to hear from you. Get in touch with us today.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Email</h3>
                <a href="mailto:hello@umojafund.com" className="text-primary hover:text-primary/80">
                  hello@umojafund.com
                </a>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Phone</h3>
                <a href="tel:+1234567890" className="text-primary hover:text-primary/80">
                  +243 983 804 271
                </a>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Location</h3>
                <p className="text-gray-600">123 Innovation St, Tech City, TC 12345</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your message..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Map */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Visit Us</h2>
                <div className="bg-gray-300 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Interactive map placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
