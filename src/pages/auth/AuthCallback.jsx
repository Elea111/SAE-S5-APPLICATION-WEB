import React, { useEffect } from 'react'
import { supabase } from '../../infra/supabaseClient'
import Header from '../../components/layout/header/Header'
import Footer from '../../components/layout/footer/Footer'

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Attendre que Supabase traite le callback depuis l'URL
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          alert('Erreur lors de la connexion: ' + error.message)
          window.location.href = '/connexion'
          return
        }

        if (data.session) {
          const user = data.session.user
          console.log('User connecté via OAuth:', user)

          // Créer/mettre à jour user dans localStorage
          localStorage.setItem('auth', JSON.stringify({
            userId: user.id,
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.full_name || user.email.split('@')[0],
            last_name: user.user_metadata?.last_name || '',
            avatar_url: user.user_metadata?.avatar_url || null,
            token: data.session.access_token,
            isPro: false,
          }))

          // Rediriger vers le profil
          window.location.href = '/profil-proprietaire'
        } else {
          console.log('No session found')
          window.location.href = '/connexion'
        }
      } catch (err) {
        console.error('Auth callback exception:', err)
        alert('Erreur: ' + err.message)
        window.location.href = '/connexion'
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <>
      <Header />
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '70vh' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>
          ⏳ Connexion en cours...
        </div>
      </div>
      <Footer />
    </>
  )
}
