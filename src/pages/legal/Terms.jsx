import React from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './Legal.css';

const Terms = () => {
  return (
    <>
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1>📋 Conditions d'utilisation</h1>
          <p className="last-updated">Dernière mise à jour: 3 janvier 2026</p>

          <section>
            <h2>1. Objet et Acceptation</h2>
            <p>
              OutilPartage est une plateforme numérique permettant aux utilisateurs de partager, louer et emprunter des outils et équipements entre particuliers et professionnels. En accédant et utilisant cette plateforme, vous acceptez sans réserve l'intégralité de ces conditions d'utilisation.
            </p>
            <p>
              Si vous n'acceptez pas ces conditions, veuillez cesser immédiatement l'utilisation de la plateforme.
            </p>
          </section>

          <section>
            <h2>2. Définitions</h2>
            <ul>
              <li><strong>Plateforme:</strong> Le site web et l'application mobile OutilPartage</li>
              <li><strong>Propriétaire:</strong> Utilisateur qui propose des outils en location</li>
              <li><strong>Emprunteur:</strong> Utilisateur qui loue des outils</li>
              <li><strong>Outil:</strong> Équipement proposé à la location</li>
              <li><strong>Réservation:</strong> Contrat de location entre propriétaire et emprunteur</li>
            </ul>
          </section>

          <section>
            <h2>3. Inscription et Compte Utilisateur</h2>
            <h3>3.1 Conditions d'inscription</h3>
            <p>Pour utiliser la plateforme, vous devez:</p>
            <ul>
              <li>Avoir au moins 18 ans</li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Disposer d'une adresse email valide</li>
              <li>Accepter les conditions d'utilisation et politique de confidentialité</li>
            </ul>

            <h3>3.2 Responsabilité du compte</h3>
            <p>
              Vous êtes responsable de la confidentialité de vos identifiants. Toute activité sur votre compte vous est imputable. Vous devez nous notifier immédiatement de toute utilisation non autorisée.
            </p>
          </section>

          <section>
            <h2>4. Utilisation de la Plateforme</h2>
            <h3>4.1 Vous acceptez de ne pas:</h3>
            <ul>
              <li>Utiliser la plateforme pour des activités illégales ou frauduleuses</li>
              <li>Usurper l'identité d'une autre personne</li>
              <li>Partager du contenu offensant, discriminatoire ou haineux</li>
              <li>Partager des informations privées d'autres utilisateurs</li>
              <li>Contourner les mécanismes de sécurité de la plateforme</li>
              <li>Proposer des outils dangereux, contrefaits ou illégaux</li>
              <li>Effectuer du spam ou du harcèlement</li>
            </ul>

            <h3>4.2 Contenu utilisateur</h3>
            <p>
              Vous conservez la propriété de votre contenu (photos, descriptions). En le partageant, vous nous accordez une licence non-exclusive pour l'afficher sur la plateforme.
            </p>
          </section>

          <section>
            <h2>5. Propriétaires d'Outils</h2>
            <h3>5.1 Responsabilités</h3>
            <ul>
              <li>Fournir des descriptions exactes et honnêtes de vos outils</li>
              <li>Partager des photos claires et représentatives</li>
              <li>Indiquer l'état réel de l'équipement</li>
              <li>Fixer des prix justes et raisonnables</li>
              <li>Maintenir les outils en bon état de fonctionnement</li>
              <li>Respecter les délais de disponibilité</li>
            </ul>

            <h3>5.2 Assurance et Responsabilité</h3>
            <p>
              Vous êtes responsable de l'assurance de vos outils. OutilPartage ne couvre pas les dommages, vol ou perte. Nous vous recommandons de souscrire une assurance spécifique.
            </p>

            <h3>5.3 Caution de dépôt</h3>
            <p>
              Vous pouvez demander une caution de dépôt pour sécuriser vos outils. Cette caution sera retenue en cas de dommage constaté à la restitution.
            </p>
          </section>

          <section>
            <h2>6. Emprunteurs</h2>
            <h3>6.1 Responsabilités</h3>
            <ul>
              <li>Traiter les outils avec soin et responsabilité</li>
              <li>Les restituer dans le même état (usure normale acceptée)</li>
              <li>Respecter les délais de location convenus</li>
              <li>Rembourser les frais de réparation en cas de dommage</li>
              <li>Notifier le propriétaire en cas de problème pendant la location</li>
            </ul>

            <h3>6.2 Caution de dépôt</h3>
            <p>
              La caution est restituée intégralement si l'outil est retourné en bon état. Elle peut être partiellement ou totalement conservée pour couvrir les dommages.
            </p>
          </section>

          <section>
            <h2>7. Transactions et Paiements</h2>
            <h3>7.1 Modalités de paiement</h3>
            <p>
              Les paiements s'effectuent via notre plateforme sécurisée (Stripe). OutilPartage agit en tant qu'intermédiaire de paiement et retient une commission.
            </p>

            <h3>7.2 Commission</h3>
            <p>
              OutilPartage prélève une commission sur chaque transaction (détails disponibles lors de la publication). Cette commission couvre les frais de plateforme, support client et paiement sécurisé.
            </p>

            <h3>7.3 Remboursement</h3>
            <p>
              Les remboursements sont effectués selon nos conditions d'annulation:
            </p>
            <ul>
              <li>Annulation 7 jours avant: Remboursement 100% (hors commission)</li>
              <li>Annulation 3-7 jours avant: Remboursement 50%</li>
              <li>Annulation moins de 3 jours: Remboursement 0% (non-remboursable)</li>
            </ul>
          </section>

          <section>
            <h2>8. Système d'Avis et Notation</h2>
            <h3>8.1 Avis honnêtes</h3>
            <p>
              Les avis doivent être honnêtes, constructifs et basés sur votre expérience réelle. Les avis faux ou malveillants peuvent entraîner la suppression de compte.
            </p>

            <h3>8.2 Notation</h3>
            <p>
              Les notes de 1 à 5 étoiles reflètent votre satisfaction globale. Une note basse sans motif valide peut être contestée.
            </p>

            <h3>8.3 Modération</h3>
            <p>
              Nous nous réservons le droit de modérer, masquer ou supprimer les avis non conformes à nos standards.
            </p>
          </section>

          <section>
            <h2>9. Responsabilités et Limitations</h2>
            <h3>9.1 Absence de garantie</h3>
            <p>
              La plateforme est fournie "en l'état" sans garantie expresse. Nous ne garantissons pas l'absence d'erreurs, interruptions ou bugs.
            </p>

            <h3>9.2 Limitation de responsabilité</h3>
            <p>
              OutilPartage ne peut être tenue responsable des:
            </p>
            <ul>
              <li>Dommages directs ou indirects résultant de l'utilisation</li>
              <li>Perte de données ou d'accès</li>
              <li>Conflits entre utilisateurs</li>
              <li>Qualité ou condition des outils loués</li>
            </ul>

            <h3>9.3 Responsabilité de l'utilisateur</h3>
            <p>
              Vous êtes responsable de vos actions sur la plateforme. Vous indemnisez OutilPartage contre toute réclamation, perte ou dommage résultant de votre utilisation.
            </p>
          </section>

          <section>
            <h2>10. Modération et Sanctions</h2>
            <h3>10.1 Violations</h3>
            <p>
              En cas de violation de ces conditions, OutilPartage peut:
            </p>
            <ul>
              <li>Envoyer un avertissement</li>
              <li>Suspendre votre compte temporairement</li>
              <li>Supprimer définitivement votre compte</li>
              <li>Signaler les activités illégales aux autorités</li>
            </ul>

            <h3>10.2 Appel</h3>
            <p>
              Vous pouvez contester une sanction en nous écrivant à support@outilpartage.fr dans les 15 jours.
            </p>
          </section>

          <section>
            <h2>11. Propriété Intellectuelle</h2>
            <p>
              Le contenu, design et code de la plateforme OutilPartage sont protégés par les droits d'auteur. Vous ne pouvez pas les reproduire ou les utiliser sans autorisation.
            </p>
          </section>

          <section>
            <h2>12. Modifications des Conditions</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions. Les modifications importantes seront communiquées par email. Votre utilisation continue implique votre acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2>13. Droit Applicable et Juridiction</h2>
            <p>
              Ces conditions sont régies par le droit français. En cas de litige, les tribunaux compétents sont ceux du ressort de notre siège social.
            </p>
          </section>

          <section>
            <h2>14. Contact</h2>
            <p>Pour toute question sur ces conditions:</p>
            <ul>
              <li>📧 Email: <a href="mailto:legal@outilpartage.fr">legal@outilpartage.fr</a></li>
              <li>📱 Téléphone: +33 1 23 45 67 89</li>
              <li>💬 Chat support: Disponible en semaine 9h-18h</li>
            </ul>
          </section>

          <div className="legal-footer">
            <p>© 2026 OutilPartage. Tous droits réservés.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terms;
