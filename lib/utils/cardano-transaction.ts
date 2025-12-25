import type { BrowserWallet } from "@meshsdk/core";

/**
 * Envoi simple d'ADA à une adresse Cardano
 * Version simplifiée sans validations complexes
 */
export async function sendADA(
    wallet: BrowserWallet,
    recipientAddress: string,
    amountADA: number
): Promise<string> {
    try {
        // Importer Mesh SDK
        const { Transaction } = await import("@meshsdk/core");

        // Créer la transaction
        const tx = new Transaction({ initiator: wallet });

        // Convertir ADA en Lovelace (1 ADA = 1,000,000 Lovelace)
        const amountLovelace = (amountADA * 1_000_000).toString();

        // Envoyer les ADA
        tx.sendLovelace(recipientAddress, amountLovelace);

        // Construire, signer et soumettre
        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx);
        const txHash = await wallet.submitTx(signedTx);

        return txHash;
    } catch (error: any) {
        console.error("Erreur envoi ADA:", error);
        throw new Error(error.message || "Erreur lors de l'envoi");
    }
}

/**
 * Vérifie si une adresse est mock (générée aléatoirement)
 */
function isMockAddress(address: string): boolean {
    if (!address) return true;

    // Les adresses mock générées par CardanoSimulator ont souvent des patterns
    // Vérifier si l'adresse commence par addr mais semble générée aléatoirement
    // Une vraie adresse Cardano a un format bech32 spécifique
    if (!address.startsWith('addr1') && !address.startsWith('addr_test1')) {
        return true;
    }

    // Si l'adresse est trop courte ou trop longue, c'est probablement mock
    if (address.length < 100 || address.length > 110) {
        return true;
    }

    return false;
}

/**
 * Construit et signe une transaction Cardano pour contribuer à un projet
 * Si l'adresse est mock, utilise l'adresse du wallet connecté
 */
export async function buildAndSignContributionTransaction(
    wallet: BrowserWallet,
    recipientAddress: string,
    amountADA: number,
    metadata?: Record<string, any>
): Promise<{ txHash: string; signedTx: string }> {
    try {
        // Obtenir l'adresse du wallet connecté
        const usedAddresses = await wallet.getUsedAddresses();
        const userAddress = usedAddresses[ 0 ];

        if (!userAddress) {
            throw new Error("Aucune adresse trouvée dans le wallet");
        }

        // Si l'adresse est mock, utiliser l'adresse du wallet connecté
        let finalAddress = recipientAddress;
        if (isMockAddress(recipientAddress)) {
            console.log("⚠️ Adresse mock détectée, utilisation de l'adresse du wallet:", userAddress);
            finalAddress = userAddress;
        }

        // Vérification basique de l'adresse finale
        if (!finalAddress || (!finalAddress.startsWith('addr1') && !finalAddress.startsWith('addr_test1'))) {
            throw new Error("Adresse Cardano invalide");
        }

        // Importer Mesh SDK
        const { Transaction } = await import("@meshsdk/core");

        // Créer la transaction
        const tx = new Transaction({ initiator: wallet });

        // Convertir ADA en Lovelace
        const amountLovelace = (amountADA * 1_000_000).toString();

        // Envoyer les ADA à l'adresse finale
        tx.sendLovelace(finalAddress, amountLovelace);

        // Ajouter métadonnées si fournies (format compact pour respecter la limite de 64 bytes)
        if (metadata) {
            // Créer un format compact : seulement l'ID du projet (le plus important)
            // Format: "p:projectId" pour rester sous 64 bytes
            let metadataValue: string;

            if (metadata.projectId) {
                // Utiliser seulement l'ID du projet (sans préfixe "p:" si trop long)
                const projectId = metadata.projectId.toString();
                // Si l'ID seul dépasse 64 bytes, utiliser seulement les premiers caractères
                if (projectId.length <= 64) {
                    metadataValue = projectId;
                } else {
                    // Prendre les 64 premiers caractères
                    metadataValue = projectId.substring(0, 64);
                }
            } else {
                // Si pas d'ID, créer un hash court
                const metadataStr = JSON.stringify(metadata);
                if (metadataStr.length <= 64) {
                    metadataValue = metadataStr;
                } else {
                    // Prendre seulement les 64 premiers caractères
                    metadataValue = metadataStr.substring(0, 64);
                }
            }

            tx.setMetadata(674, metadataValue);
        }

        // Construire, signer et soumettre
        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx);
        const txHash = await wallet.submitTx(signedTx);

        return {
            txHash,
            signedTx,
        };
    } catch (error: any) {
        console.error("Erreur transaction:", error);
        throw new Error(error.message || "Erreur lors de la transaction");
    }
}

/**
 * Vérifie si le wallet a suffisamment de fonds
 */
export async function checkWalletBalance(
    wallet: BrowserWallet,
    requiredAmountADA: number
): Promise<{ sufficient: boolean; balance: number }> {
    try {
        const lovelace = await wallet.getLovelace();
        const balanceADA = parseFloat(lovelace) / 1_000_000;
        const requiredLovelace = requiredAmountADA * 1_000_000;

        return {
            sufficient: parseFloat(lovelace) >= requiredLovelace,
            balance: balanceADA,
        };
    } catch (error: any) {
        console.error("Erreur lors de la vérification du solde:", error);
        throw new Error(
            `Erreur lors de la vérification du solde: ${error.message || "Erreur inconnue"}`
        );
    }
}

