import React from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './Legal.css';

const RGPD = () => {
  return (
    <>
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1>⚖️ Informations RGPD</h1>
          <p className="last-updated">Dernière mise à jour: 3 janvier 2026</p>

          <section>
            <h2>1. Qu'est-ce que le RGPD?</h2>
            <p>
              Le Règlement Général sur la Protection des Données (RGPD) est une loi européenne qui protège vos droits concernant vos données personnelles. Elle s'applique à toutes les organisations traitant des données de résidents de l'UE.
            </p>
            <p>
              OutilPartage respecte strictement le RGPD pour protéger votre vie privée et vos données.
            </p>
          </section>

          <section>
            <h2>2. Vos 8 Droits Fondamentaux</h2>

            <div className="right-card">
              <h3>📋 1. Droit d'accès</h3>
              <p>
                Vous avez le droit d'accéder à toutes vos données personnelles que nous détenons et d'obtenir une copie.
              </p>
              <p className="how-to"><strong>Comment l'exercer:</strong> Allez à Paramètres → RGPD & Données → "Télécharger mes données"</p>
            </div>

            <div className="right-card">
              <h3>✏️ 2. Droit de rectification</h3>
              <p>
                Vous pouvez corriger ou mettre à jour vos informations personnelles.
              </p>
              <p className="how-to"><strong>Comment l'exercer:</strong> Allez à Paramètres → Profil → "Modifier mon profil"</p>
            </div>

            <div className="right-card">
              <h3>🗑️ 3. Droit à l'oubli (Droit à la suppression)</h3>
              <p>
                Vous pouvez demander la suppression complète de vos données personnelles.
              </p>
              <p><strong>Exceptions légales:</strong> Nous devons conserver certaines données pour des obligations légales (facturation, prévention de la fraude) pendant 6 ans minimum.</p>
              <p className="how-to"><strong>Comment l'exercer:</strong> Allez à Paramètres → RGPD & Données → "Supprimer mon compte"</p>
            </div>

            <div className="right-card">
              <h3>🚫 4. Droit de limitation du traitement</h3>
              <p>
                Vous pouvez demander l'arrêt temporaire du traitement de vos données.
              </p>
              <p><strong>Exemple:</strong> Vous pouvez contester l'exactitude de vos données pendant que nous vérifions.</p>
              <p className="how-to"><strong>Comment l'exercer:</strong> Contactez-nous à privacy@outilpartage.fr</p>
            </div>

            <div className="right-card">
              <h3>📊 5. Droit à la portabilité des données</h3>
              <p>
                Vous pouvez recevoir vos données dans un format structuré, courant et lisible (JSON, CSV).
              </p>
              <p><strong>Utilité:</strong> Transférer vos données vers un autre service.</p>
              <p className="how-to"><strong>Comment l'exercer:</strong> Allez à Paramètres → RGPD & Données → "Télécharger mes données"</p>
            </div>

            <div className="right-card">
              <h3>✋ 6. Droit d'opposition</h3>
              <p>
                Vous pouvez refuser certains traitements de vos données.
              </p>
              <p><strong>Exemple:</strong> Refuser les emails marketing, les cookies de suivi, l'analyse comportementale.</p>
              <p className="how-to"><strong>Comment l'exercer:</strong> Allez à Paramètres → Notifications pour configurer vos préférences</p>
            </div>

            <div className="right-card">
              <h3>⏸️ 7. Droit à la déconnexion/désactivation</h3>
              <p>
                Vous pouvez mettre votre compte en pause temporairement (30 jours) sans suppression permanente.
              </p>
              <p><strong>Avantage:</strong> Vous gardez l'option de revenir plus tard.</p>
              <p className="how-to"><strong>Comment l'exercer:</strong> Allez à Paramètres → RGPD & Données → "Désactiver mon compte"</p>
            </div>

            <div className="right-card">
              <h3>⚖️ 8. Droit de déposer plainte</h3>
              <p>
                Vous pouvez déposer plainte auprès de l'autorité compétente (CNIL en France).
              </p>
              <p>
                <strong>Contact CNIL:</strong> <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</a>
              </p>
            </div>
          </section>

          <section>
            <h2>3. Comment Exercer Vos Droits</h2>
            <h3>Demande Simple (par la plateforme)</h3>
            <p>Pour la plupart des demandes (accès, téléchargement, suppression), utilisez directement votre tableau de bord Paramètres.</p>

            <h3>Demande Formelle (par email)</h3>
            <p>Écrivez à <a href="mailto:privacy@outilpartage.fr">privacy@outilpartage.fr</a> avec:</p>
            <ul>
              <li>Votre nom complet</li>
              <li>Votre adresse email utilisée</li>
              <li>La nature de votre demande</li>
              <li>Une copie de votre pièce d'identité</li>
            </ul>

            <h3>Délai de Réponse</h3>
            <p>
              <strong>Nous nous engageons à répondre dans les 30 jours.</strong> Ce délai peut être prolongé de 60 jours supplémentaires pour les demandes complexes.
            </p>
          </section>

          <section>
            <h2>4. Base Légale de nos Traitements</h2>
            <p>Nous traitons vos données sur les bases légales suivantes:</p>
            <ul>
              <li><strong>Exécution du contrat:</strong> Traitement nécessaire pour fournir nos services</li>
              <li><strong>Obligation légale:</strong> Respect de la loi (fiscalité, lutte anti-fraude)</li>
              <li><strong>Intérêt légitime:</strong> Amélioration des services, prévention de fraude</li>
              <li><strong>Consentement:</strong> Pour les emails marketing, cookies non-essentiels</li>
            </ul>
          </section>

          <section>
            <h2>5. Transferts Internationaux</h2>
            <p>
              Vos données sont stockées exclusivement en France et dans l'Union Européenne. Aucun transfert vers des pays tiers (hors UE) n'est effectué.
            </p>
            <p>
              <strong>Garantie:</strong> Conformité totale avec les standards de protection européens.
            </p>
          </section>

          <section>
            <h2>6. Violation de Données</h2>
            <p>
              En cas de violation de données affectant vos informations personnelles, nous nous engageons à:
            </p>
            <ul>
              <li>✅ Vous notifier dans les 72 heures</li>
              <li>✅ Notifier les autorités compétentes</li>
              <li>✅ Expliquer les mesures prises</li>
              <li>✅ Fournir un numéro de référence</li>
            </ul>
          </section>

          <section>
            <h2>7. Durée de Conservation</h2>
            <table className="retention-table">
              <thead>
                <tr>
                  <th>Type de données</th>
                  <th>Durée de conservation</th>
                  <th>Raison</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Données de profil</td>
                  <td>Tant qu'actif + 90 jours</td>
                  <td>Service utilisateur</td>
                </tr>
                <tr>
                  <td>Données financières</td>
                  <td>6 ans</td>
                  <td>Obligation légale</td>
                </tr>
                <tr>
                  <td>Avis et commentaires</td>
                  <td>Tant qu'actif</td>
                  <td>Référence utilisateur</td>
                </tr>
                <tr>
                  <td>Logs de sécurité</td>
                  <td>12 mois</td>
                  <td>Prévention de fraude</td>
                </tr>
                <tr>
                  <td>Cookies analytiques</td>
                  <td>13 mois</td>
                  <td>Analyse d'usage</td>
                </tr>
                <tr>
                  <td>Communications</td>
                  <td>90 jours après suppression</td>
                  <td>Support client</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>8. Données Sensibles</h2>
            <p>
              <strong>Nous ne collectons jamais intentionnellement de données sensibles</strong> telles que:
            </p>
            <ul>
              <li>❌ Origine ethnique ou raciale</li>
              <li>❌ Opinions politiques</li>
              <li>❌ Croyances religieuses</li>
              <li>❌ Données biométriques</li>
              <li>❌ Antécédents judiciaires</li>
            </ul>
            <p>
              Si nous détectons de telles données dans votre compte, nous les supprimerons immédiatement.
            </p>
          </section>

          <section>
            <h2>9. Protection des Enfants</h2>
            <p>
              <strong>OutilPartage n'accepte pas les utilisateurs de moins de 18 ans.</strong>
            </p>
            <p>
              Si nous découvrons qu'un utilisateur est mineur, nous supprimerons immédiatement son compte et ses données.
            </p>
            <p>
              Si vous êtes parent et découvrez que votre enfant utilise la plateforme, contactez-nous immédiatement.
            </p>
          </section>

          <section>
            <h2>10. Données des Tiers</h2>
            <p>
              Si vous partagez des données de tiers sur notre plateforme (photos d'autres personnes, coordonnées, etc.), vous garantissez avoir leur consentement.
            </p>
            <p>
              OutilPartage n'est pas responsable du partage non autorisé de données tiers.
            </p>
          </section>

          <section>
            <h2>11. Audit et Conformité</h2>
            <p>Nos mesures de conformité RGPD:</p>
            <ul>
              <li>✅ Audits de sécurité annuels</li>
              <li>✅ Certification ISO 27001 (en cours)</li>
              <li>✅ Analyse d'impact relative à la protection des données</li>
              <li>✅ Politique de droit d'accès restricif aux données</li>
              <li>✅ Formation RGPD de l'équipe</li>
              <li>✅ Clauses RGPD avec tous nos prestataires</li>
            </ul>
          </section>

          <section>
            <h2>12. Préposé à la Protection des Données (DPO)</h2>
            <p>
              OutilPartage dispose d'un Délégué à la Protection des Données chargé de s'assurer de la conformité RGPD.
            </p>
            <p>
              <strong>Contact DPO:</strong> <a href="mailto:dpo@outilpartage.fr">dpo@outilpartage.fr</a>
            </p>
          </section>

          <section>
            <h2>13. Réclamations et Plaintes</h2>
            <h3>Chez OutilPartage</h3>
            <p>
              Contactez-nous d'abord: <a href="mailto:privacy@outilpartage.fr">privacy@outilpartage.fr</a>
            </p>
            <p>Nous répondons dans les 30 jours.</p>

            <h3>Auprès de la CNIL (France)</h3>
            <p>
              <strong>CNIL - Commission Nationale de l'Informatique et des Libertés</strong>
            </p>
            <ul>
              <li>🌐 <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</a></li>
              <li>📧 plaintes@cnil.fr</li>
              <li>📱 +33 1 53 73 22 22</li>
            </ul>
          </section>

          <section>
            <h2>14. Questions Fréquentes</h2>

            <div className="faq-item">
              <h3>Q: Comment supprimer définitivement mon compte?</h3>
              <p>
                R: Allez à Paramètres → RGPD & Données → "Supprimer mon compte". Vous devez confirmer deux fois. Vos données seront supprimées dans les 90 jours (sauf obligations légales).
              </p>
            </div>

            <div className="faq-item">
              <h3>Q: Puis-je mettre mon compte en pause plutôt que de le supprimer?</h3>
              <p>
                R: Oui! Allez à Paramètres → RGPD & Données → "Désactiver mon compte". Votre compte sera désactivé 30 jours. Vous pouvez le réactiver en vous reconnectant.
              </p>
            </div>

            <div className="faq-item">
              <h3>Q: OutilPartage vend-il mes données?</h3>
              <p>
                R: Non, jamais. Nous ne vendons pas vos données. Nous les partageons uniquement pour fournir nos services ou si légalement requis.
              </p>
            </div>

            <div className="faq-item">
              <h3>Q: Combien de temps mettez-vous pour répondre à mes demandes?</h3>
              <p>
                R: Nous répondons dans les 30 jours maximum (jusqu'à 60 jours pour les demandes complexes).
              </p>
            </div>

            <div className="faq-item">
              <h3>Q: Mes données sont-elles chiffrées?</h3>
              <p>
                R: Oui, toutes les communications sont chiffrées (SSL/TLS) et les mots de passe sont stockés chiffrés.
              </p>
            </div>
          </section>

          <div className="legal-footer">
            <p>© 2026 OutilPartage. Tous droits réservés.</p>
            <p>Dernière mise à jour: 3 janvier 2026</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RGPD;
