"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Mail, Phone, MapPin, Send, User, MessageSquare, Clock, CheckCircle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { motion } from "framer-motion"
import { useState } from "react"

export default function Contact() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Réinitialiser après 3 secondes
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 3000)
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: t.contact.email,
      value: "hello@umojafund.com",
      link: "mailto:hello@umojafund.com",
      description: "Nous répondons sous 24h",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Phone,
      title: t.contact.phone,
      value: "+1 (234) 567-890",
      link: "tel:+1234567890",
      description: "Lundi - Vendredi, 9h-18h",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MapPin,
      title: t.contact.location,
      value: "123 Innovation St",
      link: "#",
      description: "Tech City, TC 12345",
      color: "from-purple-500 to-pink-500"
    }
  ]

  const faqs = [
    {
      question: "Quel est le temps de réponse moyen ?",
      answer: "Nous répondons généralement dans les 24 heures ouvrables."
    },
    {
      question: "Puis-je contacter pour un support technique ?",
      answer: "Oui, notre équipe technique est disponible pour vous aider."
    },
    {
      question: "Quels sont les horaires de support ?",
      answer: "Du lundi au vendredi, de 9h à 18h."
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/10 to-white">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              {t.contact.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-blue-100/90 max-w-3xl mx-auto leading-relaxed"
            >
              {t.contact.subtitle}
            </motion.p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8 mb-16"
            >
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={{ y: -10 }}
                    className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{info.title}</h3>
                    {info.link ? (
                      <a 
                        href={info.link} 
                        className="text-primary hover:text-primary/80 font-medium text-lg block mb-2"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-primary font-medium text-lg mb-2">{info.value}</p>
                    )}
                    <p className="text-gray-600 text-sm">{info.description}</p>
                  </motion.div>
                )
              })}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Form */}
              <motion.div
                {...fadeInUp}
                viewport={{ once: true }}
                className="lg:col-span-2"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
                    <h2 className="text-2xl font-bold">{t.contact.sendMessage}</h2>
                    <p className="text-blue-100 mt-2">
                      Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                    </p>
                  </div>
                  
                  <div className="p-8">
                    {isSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Message envoyé !</h3>
                        <p className="text-gray-600">
                          Nous vous répondrons dans les plus brefs délais.
                        </p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {t.contact.name}
                              </div>
                            </label>
                            <input
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              type="text"
                              required
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                              placeholder={t.contact.formPlaceholders.name}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {t.contact.emailLabel}
                              </div>
                            </label>
                            <input
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              type="email"
                              required
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                              placeholder={t.contact.formPlaceholders.email}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.contact.subject}
                          </label>
                          <input
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder={t.contact.formPlaceholders.subject}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              {t.contact.message}
                            </div>
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={5}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                            placeholder={t.contact.formPlaceholders.message}
                          />
                        </div>

                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Envoi en cours...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Send className="w-5 h-5" />
                              {t.contact.sendBtn}
                            </div>
                          )}
                        </motion.button>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {/* Office Hours */}
                <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-6 shadow-lg border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">Horaires d'ouverture</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-blue-50">
                      <span className="text-gray-700">Lundi - Vendredi</span>
                      <span className="font-medium">9h - 18h</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-50">
                      <span className="text-gray-700">Samedi</span>
                      <span className="font-medium">10h - 16h</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-700">Dimanche</span>
                      <span className="font-medium">Fermé</span>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold mb-6">Questions fréquentes</h3>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {t.contact.visit}
                    </h3>
                  </div>
                  <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Carte interactive</p>
                        <p className="text-gray-500 text-sm mt-1">123 Innovation St, Tech City</p>
                      </div>
                    </div>
                    {/* Interactive overlay */}
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2">
                      <a 
                        href="https://maps.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary font-medium text-sm hover:text-primary/80"
                      >
                        Voir sur Google Maps →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact Tips */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                  <h3 className="text-lg font-bold mb-4">Conseils pour une réponse rapide</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Soyez précis dans votre demande</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Incluez toutes les informations pertinentes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Vérifiez votre email pour éviter les erreurs</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/5 via-white to-primary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Besoin d'aide immédiate ?</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Notre équipe de support est disponible pour vous aider avec vos projets et questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="mailto:support@umojafund.com"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Contactez le support
                </motion.a>
                <motion.a
                  href="/help"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary border-2 border-primary px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all"
                >
                  Centre d'aide
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}