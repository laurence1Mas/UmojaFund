"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, Eye, Heart, MessageCircle, Calendar, User, Tag, TrendingUp, Search, Clock } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { motion } from "framer-motion"
import { useState } from "react"

type Post = {
    id: string
    title: string
    excerpt: string
    date: string
    category?: string
    image?: string
    slug: string
    views: number
    likes: number
    comments: number
    readTime: string
    author: string
}

const posts: Post[] = [
    {
        id: "1",
        title: "Lancer un projet à impact : guide pas à pas",
        excerpt: "Comment structurer votre campagne, définir un objectif clair et mobiliser votre communauté pour réussir votre collecte de fonds.",
        date: "2025-10-10",
        category: "Guide",
        image: "/blog/launch-project.jpg",
        slug: "lancer-projet-impact",
        views: 1250,
        likes: 85,
        comments: 12,
        readTime: "8 min",
        author: "Marie Dubois"
    },
    {
        id: "2",
        title: "Histoires de réussite — Clean Water Initiative",
        excerpt: "Retour d'expérience sur une campagne communautaire qui a apporté de l'eau potable à 3 villages.",
        date: "2025-09-02",
        category: "Success",
        image: "/blog/clean-water.jpg",
        slug: "clean-water-initiative",
        views: 2340,
        likes: 156,
        comments: 28,
        readTime: "10 min",
        author: "Jean Martin"
    },
    {
        id: "3",
        title: "Conseils pour rédiger une page de projet convaincante",
        excerpt: "Les éléments essentiels d'une bonne description de projet pour gagner la confiance des donateurs.",
        date: "2025-08-15",
        category: "Conseils",
        image: "/blog/project-copy.jpg",
        slug: "rediger-page-projet",
        views: 980,
        likes: 62,
        comments: 8,
        readTime: "6 min",
        author: "Sophie Laurent"
    },
    {
        id: "4",
        title: "Les tendances du crowdfunding en 2025",
        excerpt: "Analyses et prédictions sur l'avenir du financement participatif en Afrique.",
        date: "2025-07-22",
        category: "Analyse",
        image: "/blog/trends.jpg",
        slug: "tendances-crowdfunding-2025",
        views: 1850,
        likes: 120,
        comments: 34,
        readTime: "12 min",
        author: "David Kofi"
    },
    {
        id: "5",
        title: "Blockchain et transparence dans le crowdfunding",
        excerpt: "Comment la technologie blockchain révolutionne la transparence des dons.",
        date: "2025-06-30",
        category: "Tech",
        image: "/blog/blockchain.jpg",
        slug: "blockchain-transparence",
        views: 2100,
        likes: 189,
        comments: 45,
        readTime: "15 min",
        author: "Thomas Ndiaye"
    },
    {
        id: "6",
        title: "Engager votre communauté : stratégies efficaces",
        excerpt: "Techniques prouvées pour créer et maintenir une communauté engagée autour de votre projet.",
        date: "2025-05-18",
        category: "Marketing",
        image: "/blog/community.jpg",
        slug: "engager-communaute",
        views: 1420,
        likes: 95,
        comments: 21,
        readTime: "9 min",
        author: "Lisa Traoré"
    },
]

const categories = [
    { name: "Tous", count: 12, color: "bg-blue-500" },
    { name: "Guides", count: 4, color: "bg-green-500" },
    { name: "Succès", count: 3, color: "bg-purple-500" },
    { name: "Conseils", count: 2, color: "bg-orange-500" },
    { name: "Tech", count: 2, color: "bg-cyan-500" },
    { name: "Analyse", count: 1, color: "bg-pink-500" },
]

const popularPosts = posts.slice(0, 3).sort((a, b) => b.views - a.views)

const tags = [
    "Crowdfunding", "Impact", "Communauté", "Blockchain", "Finance",
    "Développement", "Transparence", "Innovation", "Afrique", "Tech"
]

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
    } catch {
        return iso
    }
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

export default function BlogPage() {
    const { t } = useLanguage()
    const [selectedCategory, setSelectedCategory] = useState("Tous")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredPosts = posts.filter(post => {
        const matchesCategory = selectedCategory === "Tous" || post.category === selectedCategory
        const matchesSearch = searchQuery === "" ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

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
                            {t.blog.title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-blue-100/90 max-w-3xl mx-auto leading-relaxed"
                        >
                            {t.blog.subtitle}
                        </motion.p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Main Blog Posts */}
                            <div className="lg:w-2/3">
                                {/* Search and Filter */}
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-12"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                        <div className="relative w-full md:w-auto">
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher un article..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full md:w-80 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.name}
                                                    onClick={() => setSelectedCategory(cat.name)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.name
                                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    {cat.name} ({cat.count})
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Blog Grid */}
                                {filteredPosts.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12"
                                    >
                                        <p className="text-gray-500 text-lg">Aucun article trouvé pour votre recherche.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        variants={staggerContainer}
                                        initial="initial"
                                        animate="animate"
                                        className="grid md:grid-cols-2 gap-8"
                                    >
                                        {filteredPosts.map((post, index) => (
                                            <motion.article
                                                key={post.id}
                                                variants={fadeInUp}
                                                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300"
                                            >
                                                {/* Image Container */}
                                                <div className="relative h-56 overflow-hidden">
                                                    <div className={`absolute inset-0 ${!post.image ? 'bg-gradient-to-r from-blue-500 to-blue-600' : ''}`} />
                                                    {post.image ? (
                                                        <img
                                                            src={post.image}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="text-white text-2xl font-bold">
                                                                {post.title.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 left-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${post.category === "Guide" ? 'bg-green-500' : post.category === "Success" ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                            {post.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-6">
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(post.date)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{post.readTime} de lecture</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <User className="w-4 h-4" />
                                                            <span>{post.author}</span>
                                                        </div>
                                                    </div>

                                                    <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                                        {post.title}
                                                    </h2>
                                                    <p className="text-gray-600 mb-6 line-clamp-3">
                                                        {post.excerpt}
                                                    </p>

                                                    {/* Stats */}
                                                    <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-2">
                                                                <Eye className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-gray-600">{post.views}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Heart className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-gray-600">{post.likes}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MessageCircle className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-gray-600">{post.comments}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Link
                                                        href={`/blog/${post.slug}`}
                                                        className="inline-flex items-center gap-2 text-primary font-semibold group/link hover:text-primary/80 transition-colors"
                                                    >
                                                        {t.blog.readMore}
                                                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </motion.article>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Pagination */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-12 flex items-center justify-center"
                                >
                                    <nav className="inline-flex rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <button className="px-5 py-3 bg-white text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200">
                                            {t.blog.previous}
                                        </button>
                                        <button className="px-5 py-3 bg-primary text-white">
                                            1
                                        </button>
                                        <button className="px-5 py-3 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                                            2
                                        </button>
                                        <button className="px-5 py-3 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                                            3
                                        </button>
                                        <button className="px-5 py-3 bg-white text-gray-700 hover:bg-gray-50 transition-colors border-l border-gray-200">
                                            {t.blog.next}
                                        </button>
                                    </nav>
                                </motion.div>
                            </div>

                            {/* Sidebar */}
                            <div className="lg:w-1/3">
                                <motion.aside
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-8"
                                >
                                    {/* About Card */}
                                    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                                        <h3 className="text-xl font-bold mb-4">À propos du blog</h3>
                                        <p className="text-blue-100 mb-6">
                                            Découvrez les dernières tendances, conseils et succès dans le crowdfunding d'impact en Afrique.
                                        </p>
                                        <button className="w-full bg-white text-primary font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors">
                                            S'abonner à la newsletter
                                        </button>
                                    </div>

                                    {/* Categories */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <Tag className="w-5 h-5 text-primary" />
                                            Catégories
                                        </h3>
                                        <div className="space-y-3">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.name}
                                                    onClick={() => setSelectedCategory(cat.name)}
                                                    className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${selectedCategory === cat.name
                                                            ? "bg-blue-50 text-primary font-semibold"
                                                            : "hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                                                        <span>{cat.name}</span>
                                                    </div>
                                                    <span className="text-gray-500 text-sm">({cat.count})</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Popular Posts */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                            Articles populaires
                                        </h3>
                                        <div className="space-y-6">
                                            {popularPosts.map((post) => (
                                                <Link
                                                    key={post.id}
                                                    href={`/blog/${post.slug}`}
                                                    className="group flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                        {post.image ? (
                                                            <img
                                                                src={post.image}
                                                                alt={post.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-500">
                                                                <span className="text-white font-bold text-sm">
                                                                    {post.title.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                                            {post.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{formatDate(post.date)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="w-3 h-3" />
                                                                <span className="text-xs">{post.views}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Heart className="w-3 h-3" />
                                                                <span className="text-xs">{post.likes}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tags Cloud */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                        <h3 className="text-xl font-bold mb-6">Mots-clés</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <button
                                                    key={tag}
                                                    className="px-3 py-2 bg-gray-100 hover:bg-blue-50 hover:text-primary rounded-lg text-sm transition-colors"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Newsletter */}
                                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-lg border border-blue-100">
                                        <h3 className="text-xl font-bold mb-4">Restez informé</h3>
                                        <p className="text-gray-600 mb-6 text-sm">
                                            Recevez nos derniers articles et conseils directement dans votre boîte mail.
                                        </p>
                                        <div className="space-y-3">
                                            <input
                                                type="email"
                                                placeholder="Votre email"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <button className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors">
                                                S'abonner
                                            </button>
                                        </div>
                                    </div>
                                </motion.aside>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}