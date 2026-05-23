import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { stagiaireAPI, paiementsAPI } from '../../api/client'
import { Button, Spinner, Badge } from '../../components/ui/UI'
import toast from 'react-hot-toast'
import styles from './Paiement.module.css'

export default function PaiementPage() {
  const { inscriptionId } = useParams()
  const navigate = useNavigate()
  const formRef = useRef(null)

  const [inscription, setInscription] = useState(null)
  const [cmiParams, setCmiParams]     = useState(null)
  const [loading, setLoading]         = useState(true)
  const [initiating, setInitiating]   = useState(false)

  useEffect(() => {
    stagiaireAPI.inscription(inscriptionId)
      .then(r => setInscription(r.data))
      .catch(() => toast.error('Inscription introuvable.'))
      .finally(() => setLoading(false))
  }, [inscriptionId])

  const initierPaiement = async () => {
    setInitiating(true)
    try {
      const { data } = await paiementsAPI.initier({ inscription_id: inscriptionId })
      setCmiParams(data.cmi_params)
      toast('Redirection vers CMI...', { icon: '💳' })
      setTimeout(() => formRef.current?.submit(), 1000)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erreur lors de l\'initialisation du paiement.'
      toast.error(msg)
    } finally { setInitiating(false) }
  }

  const initierPaiementStripe = async () => {
    setInitiating(true)
    try {
      const { data } = await paiementsAPI.stripeCheckout({ inscription_id: inscriptionId })
      window.location.href = data.checkout_url
    } catch (err) {
      toast.error('Erreur lors de l\'initialisation du paiement Stripe.')
    } finally { setInitiating(false) }
  }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'80vh' }}>
      <Spinner size={40} />
    </div>
  )
  if (!inscription) return <div className={styles.page}>Inscription introuvable.</div>

  const formation = inscription.formation_detail

  return (
    <div className={styles.page}>
      <div className={styles.paiementWrap}>
        {/* Résumé formation */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryTag}>⚡ Habilitation NF C18-510</div>
          <h2 className={styles.summaryTitle}>{formation?.titre}</h2>
          <div className={styles.summaryMeta}>
            <span>📖 {formation?.nb_chapitres} chapitres</span>
            <span>⏱ {formation?.duree_heures}h de formation</span>
            <span>🏆 Certificat valable {formation?.validite_mois} mois</span>
          </div>

          <div className={styles.summaryDivider} />

          <div className={styles.summaryLine}>
            <span>Prix de la formation</span>
            <span>{parseFloat(formation?.prix_mad || 0).toLocaleString('fr-MA')} MAD</span>
          </div>
          <div className={styles.summaryLine}>
            <span>TVA</span>
            <span>Incluse</span>
          </div>
          <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
            <span>Total à payer</span>
            <span>{parseFloat(formation?.prix_mad || 0).toLocaleString('fr-MA')} MAD</span>
          </div>
        </div>

        {/* Bloc paiement */}
        <div className={styles.cmiCard}>
          <div className={styles.cmiHeader}>
            <div className={styles.cmiLogo}>CMI</div>
            <div>
              <div className={styles.cmiTitle}>Paiement sécurisé</div>
              <div className={styles.cmiSub}>Centre Monétique Interbancaire — Maroc</div>
            </div>
          </div>

          <div className={styles.cmiFeatures}>
            {['🔒 Connexion SSL 256 bits', '💳 Visa, Mastercard, CIB', '🛡 3D-Secure activé', '✅ Paiement certifié CMI'].map(f => (
              <div key={f} className={styles.cmiFeature}>{f}</div>
            ))}
          </div>

          {cmiParams ? (
            <>
              <div className={styles.redirectMsg}>
                <Spinner size={20} />
                <span>Redirection vers la page CMI en cours...</span>
              </div>
              <form ref={formRef} method="POST" action={cmiParams.url} style={{ display:'none' }}>
                {Object.entries(cmiParams).filter(([k]) => k !== 'url').map(([k, v]) => (
                  <input key={k} type="hidden" name={k} value={v} />
                ))}
              </form>
            </>
          ) : (
            <>
              <p className={styles.cmiInfo}>
                Choisissez votre mode de paiement pour finaliser votre achat de{' '}
                <strong>{parseFloat(formation?.prix_mad || 0).toLocaleString('fr-MA')} MAD</strong>.
              </p>

              {/* Bouton CMI (Maroc) */}
              <Button
                loading={initiating}
                onClick={initierPaiement}
                style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:15, marginBottom:12 }}
              >
                💳 Payer avec CMI (Maroc)
              </Button>

              {/* Séparateur */}
              <div style={{ display:'flex', alignItems:'center', gap:10, margin:'8px 0' }}>
                <div style={{ flex:1, height:1, background:'#334155' }} />
                <span style={{ color:'#64748B', fontSize:13 }}>ou</span>
                <div style={{ flex:1, height:1, background:'#334155' }} />
              </div>

              {/* Bouton Stripe (International) */}
              <Button
                loading={initiating}
                onClick={initierPaiementStripe}
                style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:15, background:'#635BFF', marginBottom:12 }}
              >
                🌍 Payer avec Stripe (International)
              </Button>

              <button className={styles.cancelBtn} onClick={() => navigate('/formations')}>
                Annuler et revenir
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function PaiementSucces() {
  const navigate = useNavigate()
  return (
    <div className={styles.feedbackPage}>
      <div className={styles.feedbackCard}>
        <div className={styles.feedbackIcon} style={{ background:'#dcfce7' }}>✅</div>
        <h1 className={styles.feedbackTitle}>Paiement réussi !</h1>
        <p className={styles.feedbackText}>Votre paiement a été validé. Votre formation est maintenant accessible.</p>
        <Button onClick={() => navigate('/dashboard')} style={{ marginTop:20 }}>Accéder à ma formation →</Button>
      </div>
    </div>
  )
}

export function PaiementEchec() {
  const navigate = useNavigate()
  return (
    <div className={styles.feedbackPage}>
      <div className={styles.feedbackCard}>
        <div className={styles.feedbackIcon} style={{ background:'#fee2e2' }}>❌</div>
        <h1 className={styles.feedbackTitle} style={{ color:'var(--danger)' }}>Paiement échoué</h1>
        <p className={styles.feedbackText}>Le paiement n'a pas pu être traité. Veuillez réessayer ou contacter le support.</p>
        <div style={{ display:'flex', gap:12, marginTop:20, justifyContent:'center', flexWrap:'wrap' }}>
          <Button onClick={() => navigate(-1)}>Réessayer</Button>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>Tableau de bord</Button>
        </div>
      </div>
    </div>
  )
}
