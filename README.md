# UmojaFund: la plateforme de financement participatif pour les projets à impact en Afrique
 
## Contexte :
La République Démocratique du Congo (RDC) fait face à des défis économiques importants, notamment un taux de chômage élevé et une grande partie de la population vivant dans la pauvreté extrême. Les petites entreprises et les entrepreneurs locaux ont souvent du mal à accéder à des financements, ce qui limite leur capacité à développer leurs activités et à créer des emplois.
Solution :
Une plateforme de crowdfunding (financement participatif), qui est un outil en ligne qui permet à des porteurs de projets de collecter des fonds auprès d’un grand nombre de personnes, via les réseaux sociaux, pour financer une idée, une activité ou une cause.
## 1. Principe de base:Le crowdfunding repose sur une idée simple : Beaucoup de petites contributions peuvent ensemble financer un grand projet.
Au lieu de dépendre d’un seul investisseur ou d’une banque, vous présentez votre projet sur le plateforme, et des personnes du monde entier peuvent vous soutenir financièrement.
## 2. Comment ça va marche concrètement
## 1. Le porteur de projet: crée un projet sur la plateforme.
   * Il y décrit le projet, les objectifs, le budget, les indicateurs, les impacts attendus, etc.
   * Il fixe une somme à atteindre et une durée de campagne.
## 2. Les contributeurs découvrent le projet et peuvent y participer en ligne via la plateforme.
   * Chaque personne choisit combien elle veut donner.
## 3. À la fin de la campagne :
   * Si le montant cible est atteint, les fonds sont versés au porteur de projet.
   * Sinon, selon la plateforme, l’argent peut être remboursé aux donateurs ou affectés à un autre projet à grand impact. 
## 3. Avantages
* Accès direct au public sans passer par les banques.
* Création d’une communauté engagée autour de la cause.
* Visibilité accrue: la campagne fait connaître votre initiative.
## 4. Comment utiliser Cardano 
une plate forme web 3 qui utilise des contrats intelligents; 
Utilisation des $Ada comme monnaie pour le financement participative.

Cahier des Charges – UmojaFund
Plateforme Web3 de financement participatif basée sur la blockchain Cardano

# 1. Titre et Nom du Projet
UmojaFund – La plateforme de financement participatif pour projets à impact en Afrique
# 2. Description Simple du Projet
UmojaFund est une plateforme de crowdfunding Web3 destinée à aider les entrepreneurs, associations et innovateurs africains à lever des fonds grâce à des contributions en ADA (la crypto-monnaie native de Cardano).
Le projet combine :
Une application web3 moderne
Une base de données décentralisée
Des smart contracts Cardano (Plutus)
Un système transparent et automatique de collecte et de déblocage de fonds

# 3. Une Petite Histoire (Narrative Pitch)
En RDC et dans de nombreux pays africains, des milliers de jeunes ont des idées brillantes. Ils créent des solutions en agriculture, technologie, énergie, éducation…
 Mais sans financement, la majorité de ces initiatives ne voient jamais le jour.
UmojaFund naît de ce constat :
Permettre à chacun de lancer son projet et d’être financé par une communauté mondiale.
 Grâce à la blockchain Cardano, les contributions sont sécurisées, transparentes, traçables, et les fonds sont libérés automatiquement selon les règles fixées dans le smart contract.
C’est une plateforme où :
les projets sont authentiques,
l’argent est protégé,
Les contributeurs voient l’impact réel de leur participation.
# 4. La Solution
UmojaFund propose :
Une plateforme web3 pour publier des projets et collecter des fonds.
Des smart contracts Cardano pour automatiser la gestion des fonds.
Un système de contribution via wallets Cardano.
Une transparence totale : toutes les contributions sont visibles sur la blockchain.
# 5. Rôle et Intervention de Cardano
Cardano intervient à 4 niveaux :
1) Smart Contracts Plutus
Ils gèrent :
la réception des ADA,
le verrouillage des fonds,
la libération automatique lorsque l’objectif est atteint,
2) Transactions blockchain
Chaque contribution est une transaction signée par le wallet du contributeur.
3) Sécurité & Transparence
Impossible d’effacer ou modifier les contributions.
4) Interaction Off-chain
L’application communique avec Cardano via :
Blockfrost API
Ogmios
Un backend off-chain pour suivre les transactions (indexation).
6. Besoins Fonctionnels
Fonctionnels principaux
Inscription / Connexion utilisateur
Création d’un projet
Validation admin
Publication du projet + création du smart contract
Contribution via wallet Cardano/ou MOMO ( l’argent collecté via mobil money sera automatiquement converti en Ada )
Suivi en temps réel des fonds collectés
Déblocage automatique des fonds
Notifications (email/web)
Tableau de bord utilisateur & admin

7. Besoins Non Fonctionnels
Sécurité : hashing, authentification JWT, gestion wallet → smart contract.
Performance : optimisation API, indexation rapide des transactions.
Scalabilité : capacité à supporter des milliers de projets.
Fiabilité : disponibilité de 99%.
UX : interface intuitive, moderne et responsive.
Traçabilité : logs + transactions blockchain consultables.
9. Use Cases (Cas d’utilisation)

✔️ UC1 : Créer une campagne
Acteur : Porteur de projet
L’utilisateur crée un compte
Remplit le formulaire du projet
Soumet à l’approbation
Le projet est publié avec une adresse smart contract
✔️ UC2 : Contribuer à un projet
Acteur : Contributeur
L’utilisateur connecte son wallet/ ou son compte mobil money
Choisit un montant
Signe la transaction
La contribution apparaît sur la blockchain
Le total se met à jour
✔️ UC3 : Collecte des fonds
Acteur : Smart Contract
Vérifie objectif (montant à atteindre)+ date
Si l’objectif est atteint → les fonds sont libérés automatiquement au porteur du projet
Sinon → à la fin de la campagne, les fonds sont quand même transférés au porteur du projet pour l’aider à démarrer ses activités, même si l’objectif n’a pas été atteint
✔️ UC4 : Fin de Campagne
Acteur : Porteur de projet
Une fois la campagne terminée, le smart contract libère les fonds collectés au porteur du projet, qu’il ait atteint ou non l’objectif (Montant demandé)
10. Modèle de Base de Données (hors-chaine)

🔸 Table : Users
id | name | email | password | walletAddress | role
🔸 Table : Projects
id | title | description | imageUrl | goalADA | deadline | ownerId | status | smartContractAddress
🔸 Table : Contributions
id | projectId | userId | amountADA | txHash | date
🔸 Table : ProjectImpact (optionnel)
id | projectId | indicatorName | indicatorValue

11. Modules Applicatifs

Module Utilisateur
Authentification, profils, gestion wallet
Module Gestion de Projets
Création, édition, validation, publication
Module Contribution / Paiement ADA
Interaction wallet → smart contract
Module Smart Contract Cardano
Verrouillage / déblocage des fonds
Module Admin
Validation des projets, gestion utilisateurs
Module Indexation Blockchain
Lecture transactions via Blockfrost
Module Notifications
Emails, messages, alertes système

12. Architecture générale

🔹 Frontend (React / Next.js)
UI/UX
Connexion au wallet
Gestion des contributions
🔹 Backend (Node.js / Django)
API REST
Gestion BD
Communication avec la blockchain



🔹 Blockchain Cardano
Smart contracts Plutus
Stockage des contributions
Libération/résolution automatique
13. Technologies recommandées
lien github du projet 
https://github.com/Marcellin3
Côté
Technologies
Frontend
React / Next.js, Tailwind
Backend
Node.js (NestJS), Laravel ou Django
Base de données
PostgreSQL
Blockchain
Plutus, Cardano CLI, Blockfrost
Auth
JWT
Intégration wallets
Nami, Lace, Eternl

14. Conclusion
UmojaFund est une plateforme innovante combinant :
le crowdfunding,
une architecture web moderne,
la sécurité des smart contracts Cardano.
Elle offre une solution concrète pour financer les projets africains de manière transparente, automatisée et accessible à tout le monde.

ANNEXE
quelques diagrammes de sequence



