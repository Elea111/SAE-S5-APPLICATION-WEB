CAHIER DE CHARGE
PROJET
OUTILLIO
Plateforme de loca-on de matériels
pour professionnels
Version : 1.0
BUT3 INFORMATIQUE
PAR
Groupe : 305
Emmanuel OKITO
Éléa REN
Romain CRISTEV
Léona TRAN
Table des matières
1. Présentation du projet ........................................................................................................................ 2
1.1. Contexte : .............................................................................................................................. 2
1.2. Problématique : ..................................................................................................................... 2
1.3 Objectifs généraux : ...................................................................................................................... 2
2. Enjeux et périmètre ............................................................................................................................ 2
2.1. Enjeux principaux : ....................................................................................................................... 2
2.2. Périmètre du projet : ................................................................................................................... 2
2.3. Hors périmètre : ........................................................................................................................... 3
3. Acteurs et parties prenantes .............................................................................................................. 3
3.1. Utilisateurs finaux : ...................................................................................................................... 3
3.2. Autres acteurs éventuels : ........................................................................................................... 3
4. Besoins fonctionnels ........................................................................................................................... 3
4.1. Cas d'usage principaux : ............................................................................................................... 3
4.2. Fonctionnalités attendues par ordre de priorité : ....................................................................... 4
5. Contraintes et exigences ..................................................................................................................... 5
5.1. Techniques : ................................................................................................................................. 5
5..2. Non fonctionnelles : .................................................................................................................... 5
5.3. Durabilité : ................................................................................................................................... 5
6. Maquettes et UX ................................................................................................................................. 5
6.1. Wireframes : ................................................................................................................................ 6
7. Déroulement du projet ....................................................................................................................... 7
7.1. Phases prévues (Agile) : ............................................................................................................... 7
7.2. Planning prévisionnel : ................................................................................................................. 7
7.3. Répartition des rôles : .................................................................................................................. 8
8. Critères de validation .......................................................................................................................... 8
9. Annexes Glossaire : ............................................................................................................................. 8
1. Présenta,on du projet
1.1. Contexte :
Dans un contexte de transi>on écologique et d'économie circulaire, il est crucial de
réduire la surconsomma>on et le gaspillage des ressources. Le modèle de consomma>on
collabora>ve permet d'op>miser l'usage des biens, de réduire leur impact environnemental.
Cela veut dire moins de produc>on, moins de déchets, tout en créant du lien social et en
générant des économies.
1.2. Probléma8que :
Les ar>sans, indépendants et pe>tes entreprises B2B inves>ssent dans du matériel
professionnel coûteux tels que : perceuses laser, imprimantes 3D, matériel de BTP , qui est
souvent sous-u>lisé et encombre les ateliers. Inversement, d'autres ont besoin
ponctuellement de ce matériel sans pouvoir se permeQre son achat.
1.3 Objec8fs généraux :
1. Économique : PermeQre aux professionnels de rentabiliser leurs équipements inac>fs
et à d'autres d'accéder à du matériel à moindre coût.
2. Écologique : Promouvoir une économie de l'usage plutôt que de la possession,
réduisant ainsi l'empreinte carbone liée à la produc>on de biens.
3. Social : Créer un réseau d'entraide et de confiance entre professionnels d'un même
quar>er ou d'une même zone d'ac>vité.
Public cible : Ar>sans, auto-entrepreneurs, TPE/PME, indépendants (B2B). Ex : menuisiers,
graphistes, plombiers, paysagistes.
2. Enjeux et périmètre
2.1. Enjeux principaux :
Pour l'u>lisateur : Réduc>on des coûts, gain d'espace, créa>on de nouvelles
opportunités commerciales.
Pour la société : Réduc>on de l'impact environnemental, dynamisa>on de l'économie locale
et circulaire.
2.2. Périmètre du projet :
Applica>on web responsive (mobile-first), Système de catalogue, réserva>on,
paiement en ligne intégré, messagerie interne et nota>on. Ges>on des u>lisateurs et des
annonces. Mise en produc>on sur un hébergeur cloud.
2.3. Hors périmètre :
Service de livraison/transport des objets. Assurance juridique intégrée sur les objets
loués.
3. Acteurs et par,es prenantes
3.1. U8lisateurs finaux :
• Les prêteurs/loueurs : Professionnels propriétaires d'un équipement qu'ils souhaitent
rentabiliser.
• Les emprunteurs/locataires : Professionnels ayant un besoin ponctuel d'un
équipement.
3.2. Autres acteurs éventuels :
Chambres de commerce, associa>ons de ar>sans, collec>vités territoriales pour
promouvoir la plateforme.
4. Besoins fonc,onnels
4.1. Cas d'usage principaux :
• Utilisateurs finaux :
1. 2. 3. 4. En tant qu'u>lisateur, je veux m'inscrire et créer mon profil professionnel pour être
iden>fié sur la plateforme.
En tant que prêteur, je veux publier une annonce pour un objet avec sa descrip>on,
son prix de loca>on et ses disponibilités.
En tant qu'emprunteur, je veux rechercher un objet par catégorie et localisa>on, et
voir les disponibilités.
En tant qu'emprunteur, je veux envoyer une demande de réserva>on pour une
période précise.
5. 6. En tant que prêteur, je veux accepter ou refuser une demande de réserva>on.
En tant qu'u>lisateur, je veux communiquer avec mon interlocuteur via une
messagerie sécurisée.
7. En tant qu’emprunteur, je veux eﬀectuer un paiement en ligne pour l’objet de mon
choix.
8. 9. En tant que prêteur, je veux encaisser le paiement pour une loca>on précise.
En tant qu'u>lisateur, je veux confirmer la prise en charge et la res>tu>on de l'objet
pour finaliser la transac>on.
10. En tant qu'u>lisateur, je veux noter et commenter l'échange après une loca>on.
• Administrateur :
1. 2. 3. En tant qu'administrateur, je veux modérer les annonces avant publication.
En tant qu'administrateur, je veux gérer les litiges entre utilisateurs.
En tant qu'administrateur, je veux consulter les statistiques de la plateforme.
4.2. Fonc8onnalités aKendues par ordre de priorité :
Indispensables pour le MVP V1 :
• Cas d'usage 1 à 9 (gestion complète du cycle de location)
• Interface d'administration basique
Importantes pour la V2 :
• Système de notation et commentaires (cas d'usage 10)
• Calendrier de disponibilités avancé
• Système de notifications par Email
• Chat en temps réel
Optionnelles pour la V3+ :
• Système de garantie dématérialisée
• Notifications push
• Programme de fidélité
Exemple de scénario utilisateur :
Marc, paysagiste, a besoin d'une broyeuse de végétaux pour 2 jours. Il se connecte à Outillio,
recherche par catégorie "jardinage" et localisation. Il trouve l'annonce de Marianne à 5 km
de chez lui proposant une broyeuse à 45€/jour.
Marc envoie une demande de réservation pour le weekend. Marianne accepte la demande.
Marc effectue le paiement en ligne soit 90€ pour 2 jours. Ils conviennent via la messagerie
d'un rendez-vous samedi matin. Samedi, Marc récupère la broyeuse. Sur l'application,
Marianne confirme la remise de l'objet. Marc l'utilise pendant le weekend et la rapporte
dimanche soir. Marianne confirme la restitution en bon état, ce qui finalise
automatiquement la transaction et libère le paiement.
Après la location, Marc et Marianne peuvent se noter et commenter leur échange respectif
sur la plateforme.
5. Contraintes et exigences
5.1. Techniques :
Front-End : React.js pour une Applica>on Web Progressive - PWA.
Back-End : Node.js avec Express avec Django REST Framework.
Base de données : PostgreSQL.
Hébergement : Render ou Heroku pour le back-end, Netlify/Vercel pour le front-end.
Base de données sur Supabase ou ElephantSQL.
5..2. Non fonc8onnelles :
Performance :
Temps de chargement des pages < 3s.
Sécurité : Hash des mots de passe (bcrypt), valida>on des données côté serveur, HTTPS
obligatoire.
RGPD : Consentement explicite pour les données, droit à l'oubli, poli>que de confiden>alité.
Accessibilité : Respect des standards WCAG (niveau AA minimum).
Compa>bilité : Mobile-first, compa>ble Chrome, Firefox, Safari.
5.3. Durabilité :
Choix d'un hébergeur cloud avec une poli>que environnementale verte Exemples :
Vercel, Render cloud, Heroku, Supabase.
Hébergement prévu : Front-End sur Vercel (oﬀre gratuite) | Back-End API sur Render (oﬀre
gratuite) | Base de données PostgreSQL sur Supabase (oﬀre gratuite).
Concep>on sobre : op>misa>on des images, réduc>on du nombre de requêtes HTTP, code
eﬃcient pour réduire la consomma>on CPU/énergie.
Documenta>on des bonnes pra>ques de code durable pour l'équipe.
6. MaqueEes et UX
MaqueQe à rajouter ici, à rajouter pour la version 2 du document
6.1. Wireframes :
Esquisses des pages principales :
Login, Catalogue, Détail d'une annonce, Profil u>lisateur, Messagerie.
Parcours u>lisateur :
Principes ergonomiques : Interface simple, intui>ve et épurée. Formulaire de réserva>on en
moins de 3 clics. Design responsive.
7. Déroulement du projet
7.1. Phases prévues (Agile) :
Sprint 0 (Sem 1-2) : Finalisa>on du CdC, choix techniques, setup de l'environnement de dev.
Sprint 1 (Sem 3-5) : MVP - Développement des fonc>onnalités de base (User stories 1, 2, 3).
Sprint 2 (Sem 6-8) : Développement du système de réserva>on et de messagerie (User
stories 4, 5, 6).
Sprint 3 (Sem 9-12) : Ajout des fonc>onnalités avancées (nota>ons, carte), tests intensifs,
documenta>on.
Sem 13-15 : Mise en produc>on, audit de performance, prépara>on de la soutenance.
7.2. Planning prévisionnel :
Tableau simple avec les semaines et les tâches principales
7.3. Répar88on des rôles :
Chef de projet / Scrum et backend : Emmanuel
Front-end: Leona
Full stack: Romain
Responsable qualité tests/Front-end : Éléa
8. Critères de valida,on
Indicateurs de succès :
Technique : 100% des user stories du sprint implémenté et passant les tests unitaires.
Performance : Score Lighthouse > 80/100 sur les performances et l'accessibilité.
U>lisateur : lors des tests u>lisateurs, 90% des u>lisateurs testeurs parviennent à eﬀectuer
une réserva>on complète sans aide.
Procédure de receQe :
Tests unitaires et d'intégra>on automa>sés à chaque merge de code. Revue de code par un
pair obligatoire.
Session de tests u>lisateurs avec des personas d'autres étudiants ou nos encadrants en fin de
sprint. Valida>on formelle par notre encadrant lors de la sprint review.
9. Annexes Glossaire :
MVP (Minimum Viable Product) :
Produit viable minimum avec les fonc>onnalités de base.
PWA (Progressive Web App) :
Applica>on web qui u>lise des technologies modernes pour oﬀrir une expérience u>lisateur
similaire à une applica>on mobile na>ve.
Références : Zilok, Allo Voisins.
Ar>cle sur l'économie de la fonc>onnalité Schémas techniques :
hQps://www.ademe.fr/les-defis-de-la-transi>on/economie-circulair