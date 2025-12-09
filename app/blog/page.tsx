"use client"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

type Post = {
    id: string
    title: string
    excerpt: string
    date: string
    category?: string
    image?: string
    slug: string
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
    },
    {
        id: "2",
        title: "Histoires de réussite — Clean Water Initiative",
        excerpt: "Retour d'expérience sur une campagne communautaire qui a apporté de l'eau potable à 3 villages.",
        date: "2025-09-02",
        category: "Success",
        image: "/blog/clean-water.jpg",
        slug: "clean-water-initiative",
    },
    {
        id: "3",
        title: "Conseils pour rédiger une page de projet convaincante",
        excerpt: "Les éléments essentiels d'une bonne description de projet pour gagner la confiance des donateurs.",
        date: "2025-08-15",
        category: "Conseils",
        image: "/blog/project-copy.jpg",
        slug: "rediger-page-projet",
    },
]

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
    } catch {
        return iso
    }
}

export default function BlogPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24">
                <section className="bg-primary text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Our blogs</h1>
                        <p className="text-xl text-blue-100">
                            Discover insightful articles, success stories, and tips to make the most of your crowdfunding journey with UmojaFund.
                        </p>
                    </div>
                </section>

                <section className="py-12">
                    {/* Filter part */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex justify-end">
                    
                        <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">All Categories</option>
                            <option value="Guide">Guides</option>
                            <option value="Success">Success Stories</option>
                            <option value="Conseils">Tips</option>
                        </select>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="h-44 w-full bg-gray-100">
                                        <img
                                            src={post.image || "/placeholder.svg"}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-secondary font-medium">{post.category}</span>
                                            <time className="text-xs text-muted">{formatDate(post.date)}</time>
                                        </div>
                                        <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
                                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                                        <div className="flex items-center justify-between">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="text-primary font-medium inline-flex items-center gap-2"
                                            >
                                                Lire la suite <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination (simple) */}
                        <div className="mt-10 flex items-center justify-center">
                            <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <a href="#" className="px-4 py-2 bg-white border text-sm text-gray-700 rounded-l-md">
                                    Préc
                                </a>
                                <a href="#" className="px-4 py-2 bg-white border text-sm text-gray-700">
                                    1
                                </a>
                                <a href="#" className="px-4 py-2 bg-white border text-sm text-gray-700">
                                    2
                                </a>
                                <a href="#" className="px-4 py-2 bg-white border text-sm text-gray-700 rounded-r-md">
                                    Suiv
                                </a>
                            </nav>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
