import React from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './Legal.css';

const Privacy = () => {
  return (
    <>
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1>🔐 Politique de Confidentialité</h1>
          <p className="last-updated">Dernière mise à jour: 3 janvier 2026</p>

          <section>
            <h2>1. Introduction</h2>
            <p>
              OutilPartage ("nous", "notre") s'engage à protéger votre vie privée. Cette politique explique comment nous collectons, utilisons, divulguons et sauvegardons vos informations.
            </p>
            <p>
              Veuillez lire attentivement cette politique. Si vous n'êtes pas d'accord, veuillez ne pas utiliser la plateforme.
            </p>
          </section>

          <section>
            <h2>2. Informations que nous Collectons</h2>
            <h3>2.1 Informations que vous nous fournissez directement</h3>
            <ul>
              <li><strong>Inscription:</strong> Nom, prénom, email, numéro de téléphone, adresse</li>
              <li><strong>Profil:</strong> Photo de profil, biographie, informations professionnelles</li>
              <li><strong>Annonces:</strong> Photos, descriptions, prix, localisation des outils</li>
              <li><strong>Réservations:</strong> Dates, montants, communications</li>
              <li><strong>Paiements:</strong> Données bancaires (traitées de manière sécurisée)</li>
              <li><strong>Avis:</strong> Commentaires, notes, contenus visuels</li>
              <li><strong>Messagerie:</strong> Communications entre utilisateurs</li>
            </ul>

            <h3>2.2 Informations collectées automatiquement</h3>
            <ul>
              <li><strong>Données techniques:</strong> Adresse IP, type de navigateur, système d'exploitation</li>
              <li><strong>Données de navigation:</strong> Pages visitées, temps passé, clics</li>
              <li><strong>Localisation:</strong> Données GPS (avec votre permission)</li>
              <li><strong>Cookies:</strong> Identifiants de suivi et préférences utilisateur</li>
              <li><strong>Logs serveur:</strong> Dates, heures, requêtes, erreurs</li>
            </ul>

            <h3>2.3 Informations provenant de tiers</h3>
            <ul>
              <li>Données d'authentification (Facebook, Google)</li>
              <li>Données bancaires (Stripe)</li>
              <li>Vérifications de solvabilité (prestataires tiers)</li>
              <li>Avis d'autres utilisateurs sur vous</li>
            </ul>
          </section>

          <section>
            <h2>3. Utilisation de vos Informations</h2>
            <p>Nous utilisons vos données pour:</p>
            <ul>
              <li>✅ Fournir et améliorer nos services</li>
              <li>✅ Traiter les réservations et paiements</li>
              <li>✅ Communiquer avec vous (support, notifications)</li>
              <li>✅ Prévenir la fraude et les abus</li>
              <li>✅ Respecter nos obligations légales</li>
              <li>✅ Analyser l'utilisation (anonymisée)</li>
              <li>✅ Vous envoyer des offres personnalisées</li>
              <li>✅ Améliorer la sécurité de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2>4. Partage de vos Informations</h2>
            <h3>4.1 Nous partageons vos données avec:</h3>
            <ul>
              <li><strong>Autres utilisateurs:</strong> Nom, prénom, photo, avis (selon vos paramètres)</li>
              <li><strong>Prestataires de paiement:</strong> Stripe (pour traiter les paiements)</li>
              <li><strong>Prestataires techniques:</strong> Hébergeur, CDN, services d'analyse</li>
              <li><strong>Autorités:</strong> Si légalement requis</li>
            </ul>

            <h3>4.2 Nous ne vendons jamais vos données</h3>
            <p>
              OutilPartage ne vend jamais vos informations personnelles à des tiers. Vos données ne sont partagées que pour fournir nos services ou si légalement requis.
            </p>
          </section>

          <section>
            <h2>5. Sécurité des Données</h2>
            <h3>5.1 Mesures de sécurité</h3>
            <p>Nous mettons en œuvre des mesures de sécurité robustes:</p>
            <ul>
              <li>🔐 Chiffrement SSL/TLS de toutes les communications</li>
              <li>🔐 Stockage chiffré des mots de passe</li>
              <li>🔐 Authentification à deux facteurs (optionnelle)</li>
              <li>🔐 Pare-feu et protection DDoS</li>
              <li>🔐 Audits de sécurité réguliers</li>
              <li>🔐 Politique d'accès aux données limitée</li>
            </ul>

            <h3>5.2 Limitations</h3>
            <p>
              Bien que nous utilisions des mesures de sécurité appropriées, aucun système n'est 100% sécurisé. Nous ne pouvons garantir une sécurité absolue.
            </p>
          </section>

          <section>
            <h2>6. Conservation des Données</h2>
            <p>Nous conservons vos données:</p>
            <ul>
              <li>
                <strong>Tant que votre compte est actif:</strong> Pendant l'utilisation de la plateforme
              </li>
              <li>
                <strong>Après suppression:</strong> 90 jours (sauf obligations légales)
              </li>
              <li>
                <strong>Données financières:</strong> 6 ans (obligation légale)
              </li>
              <li>
                <strong>Logs d'accès:</strong> 12 mois
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Vos Droits (RGPD)</h2>
            <p>Vous avez les droits suivants:</p>
            <ul>
              <li>
                <strong>Droit d'accès:</strong> Obtenir une copie de vos données
              </li>
              <li>
                <strong>Droit de rectification:</strong> Corriger vos informations
              </li>
              <li>
                <strong>Droit à l'oubli:</strong> Demander la suppression de vos données
              </li>
              <li>
                <strong>Droit à la portabilité:</strong> Télécharger vos données
              </li>
              <li>
                <strong>Droit d'opposition:</strong> Refuser certains traitements
              </li>
              <li>
                <strong>Droit de limitation:</strong> Limiter l'utilisation de vos données
              </li>
            </ul>

            <p>
              Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@outilpartage.fr">privacy@outilpartage.fr</a>
            </p>
          </section>

          <section>
            <h2>8. Cookies et Suivi</h2>
            <h3>8.1 Cookies essentiels</h3>
            <p>
              Nous utilisons des cookies nécessaires pour le fonctionnement (authentification, préférences).
            </p>

            <h3>8.2 Cookies analytiques</h3>
            <p>
              Nous utilisons Google Analytics pour comprendre l'utilisation de la plateforme (anonymisée).
            </p>

            <h3>8.3 Gestion des cookies</h3>
            <p>
              Vous pouvez contrôler les cookies via votre navigateur. Certains peuvent être nécessaires pour utiliser la plateforme.
            </p>
          </section>

          <section>
            <h2>9. Localisation des Données</h2>
            <p>
              Vos données sont stockées en France et dans l'Union Européenne, conformément au RGPD. Aucune donnée n'est transférée hors de l'UE sans protections appropriées.
            </p>
          </section>

          <section>
            <h2>10. Modifications de cette Politique</h2>
            <p>
              Nous pouvons mettre à jour cette politique. Les modifications importantes seront communiquées par email. Votre utilisation continue implique votre acceptation.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              Pour toute question sur cette politique ou vos données personnelles:
            </p>
            <ul>
              <li>📧 Email: <a href="mailto:privacy@outilpartage.fr">privacy@outilpartage.fr</a></li>
              <li>📱 Téléphone: +33 1 23 45 67 89</li>
              <li>💬 Chat support: Disponible en semaine 9h-18h</li>
            </ul>
          </section>

          <section>
            <h2>12. Délégué à la Protection des Données</h2>
            <p>
              Notre DPO est disponible à <a href="mailto:dpo@outilpartage.fr">dpo@outilpartage.fr</a>
            </p>
            <p>
              Vous avez également le droit de déposer une plainte auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés).
            </p>
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

export default Privacy;
