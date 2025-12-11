"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useApi } from "@/lib/hooks/useApi";
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  Shield,
  Loader2
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";

interface Contribution {
  _id: string;
  amountADA: number;
  status: 'pending' | 'confirmed';
  txHash: string;
  createdAt: string;
  project: {
    _id: string;
    title: string;
    creatorName: string;
    expectedROI: number;
    endDate: string;
  };
}

export default function ContributionsDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { fetchApi } = useApi();
  const router = useRouter();

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/contributions');
      return;
    }

    const fetchContributions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchApi('/contributions/me', {
          requiresAuth: true
        });

        if (response.success && Array.isArray(response.data)) {
          setContributions(response.data);
        } else {
          setError("Aucune contribution trouvée.");
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des contributions:", err);
        setError("Impossible de charger vos contributions.");
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [isAuthenticated, router, fetchApi]);

  const formatADA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' ADA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mes contributions</h1>
            <p className="text-gray-600">
              Toutes vos participations aux projets sur UmojaFund
            </p>
          </div>

          {error && contributions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune contribution</h3>
              <p className="text-gray-600 mb-6">
                Vous n’avez pas encore contribué à un projet. Découvrez des projets actifs !
              </p>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                Explorer les projets
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {contributions.map((contribution) => (
                <div 
                  key={contribution._id} 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link 
                          href={`/projects/${contribution.project._id}`}
                          className="text-lg font-bold text-primary hover:underline"
                        >
                          {contribution.project.title}
                        </Link>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          contribution.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {contribution.status === 'confirmed' ? 'Confirmée' : 'En attente'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        par {contribution.project.creatorName}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 text-right">
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {formatADA(contribution.amountADA)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <TrendingUp className="w-4 h-4" />
                          {contribution.project.expectedROI}% ROI
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Date</div>
                        <div className="font-medium">{formatDate(contribution.createdAt)}</div>
                      </div>
                      
                      <div className="flex items-center gap-2 md:ml-4">
                        {contribution.status === 'confirmed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                        <Link
                          href={`/projects/${contribution.project._id}`}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                          aria-label="Voir le projet"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {contributions.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-500">
              Vous avez contribué à <span className="font-medium">{contributions.length}</span> projet(s)
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}