"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useApi } from "@/lib/hooks/useApi";
import { 
  CheckCircle, 
  ArrowLeft, 
  Shield, 
  Wallet, 
  TrendingUp,
  Calendar,
  Users
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Contribution {
  contributionId: string;
  amountADA: number;
  status: string;
  txHash: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    creatorName: string;
    expectedROI: number;
    endDate: string;
  };
}

export default function ContributionSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { fetchApi } = useApi();

  const projectId = params?.id as string;
  const contributionId = searchParams.get("contributionId");
  
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/projects/${projectId}/contribution/success?contributionId=${contributionId}`);
      return;
    }

    if (!contributionId) {
      setError("ID de contribution manquant");
      setLoading(false);
      return;
    }

    const fetchContribution = async () => {
      try {
        setLoading(true);
        setError(null);

        // Appel à une nouvelle route API pour récupérer les détails
        const response = await fetchApi(`/contributions/${contributionId}`, {
          requiresAuth: true
        });

        if (response.success && response.data) {
          setContribution(response.data);
        } else {
          setError(response.error || "Impossible de charger les détails de la contribution");
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement de la contribution:", err);
        setError("Erreur réseau ou contribution introuvable");
      } finally {
        setLoading(false);
      }
    };

    fetchContribution();
  }, [contributionId, isAuthenticated, projectId, router, fetchApi]);

  const formatADA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' ADA';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chargement de votre contribution...</h2>
            <p className="text-gray-600">Veuillez patienter quelques instants.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !contribution) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
              <p className="text-gray-600 mb-6">{error || "Contribution non trouvée"}</p>
              <Link
                href={`/projects/${projectId}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au projet
              </Link>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Contribution réussie ! 🎉
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Merci d’avoir contribué au projet <strong>{contribution.project.title}</strong>. 
              Votre soutien fait la différence !
            </p>
          </div>

          {/* Résumé de la contribution */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Détails de votre contribution
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Projet</span>
                <Link 
                  href={`/projects/${contribution.project.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {contribution.project.title}
                </Link>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Montant contribué</span>
                <span className="font-bold text-2xl text-primary">{formatADA(contribution.amountADA)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Statut</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {contribution.status === 'confirmed' ? 'Confirmée' : 'En attente'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{formatDate(contribution.createdAt)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Transaction (txHash)</span>
                <span className="font-mono text-sm text-gray-700 break-all max-w-[200px] text-right">
                  {contribution.txHash}
                </span>
              </div>
            </div>
          </div>

          {/* Impact estimé */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Votre impact estimé
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{contribution.project.expectedROI}%</div>
                <div className="text-sm text-blue-600">ROI annuel estimé</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {formatADA(contribution.amountADA * (contribution.project.expectedROI / 100))}
                </div>
                <div className="text-sm text-blue-600">Retour attendu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {formatDate(contribution.project.endDate)}
                </div>
                <div className="text-sm text-blue-600">Fin du projet</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au projet
            </Link>
            <Link
              href="/dashboard/contributions"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 font-medium"
            >
              <Users className="w-4 h-4" />
              Voir toutes mes contributions
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}