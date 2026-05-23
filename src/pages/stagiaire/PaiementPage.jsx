import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { stagiaireAPI, paiementsAPI } from '../../api/client'
import { Button, Spinner } from '../../components/ui/UI'
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
  const [methodePaiement, setMethodePaiement] = useState(null)

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
      const msg = err.response?.data?.detail || "Erreur lors de l'initialisation du paiement."
      toast.error(msg)
    } finally { setInitiating(false) }
  }

  const initierPaiementStripe = async () => {
    setInitiating(true)
    try {
      const { data } = await paiementsAPI.stripeCheckout({ inscription_id: inscriptionId })
      window.location.href = data.checkout_url
    } catch (err) {
      toast.error("Erreur lors de l'initialisation du paiement Stripe.")
    } finally { setInitiating(false) }
  }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'80vh' }}>
      <Spinner size={40} />
    </div>
  )
  if (!inscription) return <div className={styles.page}>Inscription introuvable.</div>

  const formation = inscription.formation_detail
  const montant = parseFloat(formation?.prix_mad || 0).toLocaleString('fr-MA')
  const refCmd = `ESA-${inscriptionId?.slice(0,8).toUpperCase()}`

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
            <span>{montant} MAD</span>
          </div>
          <div className={styles.summaryLine}>
            <span>TVA</span>
            <span>Incluse</span>
          </div>
          <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
            <span>Total à payer</span>
            <span>{montant} MAD</span>
          </div>
        </div>

        {/* Bloc paiement */}
        <div className={styles.cmiCard}>

          {/* Sélection méthode */}
          {!methodePaiement && (
            <>
              <div className={styles.cmiHeader}>
                <div style={{ fontSize:22 }}>💳</div>
                <div>
                  <div className={styles.cmiTitle}>Choisissez votre mode de paiement</div>
                  <div className={styles.cmiSub}>Paiement 100% sécurisé</div>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:20 }}>
                <button onClick={() => setMethodePaiement('cmi')}
                  style={{ background:'#1E3A5F', border:'1px solid #2D5A8E', borderRadius:8, padding:'14px 16px', cursor:'pointer', textAlign:'left', color:'white' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ background:'#DC2626', borderRadius:4, padding:'4px 8px', fontWeight:700, fontSize:13 }}>CMI</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>Carte bancaire marocaine</div>
                      <div style={{ fontSize:12, color:'#94A3B8' }}>Visa, Mastercard, CIB — Maroc</div>
                    </div>
                  </div>
                </button>

                <button onClick={() => setMethodePaiement('stripe')}
                  style={{ background:'#1E1B4B', border:'1px solid #4338CA', borderRadius:8, padding:'14px 16px', cursor:'pointer', textAlign:'left', color:'white' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ background:'#635BFF', borderRadius:4, padding:'4px 8px', fontWeight:700, fontSize:13 }}>S</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>Carte bancaire internationale</div>
                      <div style={{ fontSize:12, color:'#94A3B8' }}>Visa, Mastercard — Stripe International</div>
                    </div>
                  </div>
                </button>

                <button onClick={() => setMethodePaiement('virement')}
                  style={{ background:'#1A2E1A', border:'1px solid #166534', borderRadius:8, padding:'14px 16px', cursor:'pointer', textAlign:'left', color:'white' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ background:'#16A34A', borderRadius:4, padding:'4px 8px', fontWeight:700, fontSize:13 }}>🏦</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>Virement bancaire</div>
                      <div style={{ fontSize:12, color:'#94A3B8' }}>Attijariwafa Bank — Traitement sous 24h</div>
                    </div>
                  </div>
                </button>
              </div>

              <button className={styles.cancelBtn} onClick={() => navigate('/formations')}>
                Annuler et revenir
              </button>
            </>
          )}

          {/* CMI */}
          {methodePaiement === 'cmi' && (
            <>
              <div className={styles.cmiHeader}>
                <div className={styles.cmiLogo}>CMI</div>
                <div>
                  <div className={styles.cmiTitle}>Paiement sécurisé CMI</div>
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
                    Vous allez être redirigé vers CMI pour payer <strong>{montant} MAD</strong>.
                  </p>
                  <Button loading={initiating} onClick={initierPaiement}
                    style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:15, marginBottom:12 }}>
                    💳 Payer avec CMI
                  </Button>
                  <button className={styles.cancelBtn} onClick={() => setMethodePaiement(null)}>
                    ← Changer de méthode
                  </button>
                </>
              )}
            </>
          )}

          {/* Stripe */}
          {methodePaiement === 'stripe' && (
            <>
              <div className={styles.cmiHeader}>
                <div style={{ background:'#635BFF', borderRadius:6, padding:'6px 12px', fontWeight:700, color:'white', fontSize:16 }}>Stripe</div>
                <div>
                  <div className={styles.cmiTitle}>Paiement international</div>
                  <div className={styles.cmiSub}>Visa, Mastercard — Monde entier</div>
                </div>
              </div>
              <p className={styles.cmiInfo} style={{ marginTop:20 }}>
                Vous allez être redirigé vers Stripe pour payer <strong>{montant} MAD</strong>.
              </p>
              <Button loading={initiating} onClick={initierPaiementStripe}
                style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:15, background:'#635BFF', marginBottom:12 }}>
                🌍 Payer avec Stripe
              </Button>
              <button className={styles.cancelBtn} onClick={() => setMethodePaiement(null)}>
                ← Changer de méthode
              </button>
            </>
          )}

          {/* Virement bancaire */}
          {methodePaiement === 'virement' && (
            <>
              <div className={styles.cmiHeader}>
                <div style={{ fontSize:24 }}>🏦</div>
                <div>
                  <div className={styles.cmiTitle}>Virement bancaire</div>
                  <div className={styles.cmiSub}>Traitement sous 24h ouvrées</div>
                </div>
              </div>

              <div style={{ background:'#0F2A0F', border:'1px solid #166534', borderRadius:8, padding:16, margin:'16px 0' }}>
                <div style={{ color:'#86EFAC', fontWeight:700, marginBottom:12, fontSize:14 }}>📋 Coordonnées bancaires</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    ['Banque', 'Attijariwafa Bank'],
                    ['Titulaire', 'Energy Skills Academy'],
                    ['RIB', '007 170 0001075000 3016 1367'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #166534', paddingBottom:6 }}>
                      <span style={{ color:'#94A3B8', fontSize:13 }}>{label}</span>
                      <span style={{ color:'white', fontWeight:600, fontSize:13 }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'#94A3B8', fontSize:13 }}>Référence obligatoire</span>
                    <span style={{ color:'#FCD34D', fontWeight:700, fontSize:13 }}>{refCmd}</span>
                  </div>
                </div>
              </div>

              <div style={{ background:'#1A1A2E', border:'1px solid #3730A3', borderRadius:8, padding:12, marginBottom:16 }}>
                <p style={{ color:'#C7D2FE', fontSize:13, margin:0, lineHeight:1.6 }}>
                  ⚠️ <strong>Important :</strong> Mentionnez obligatoirement la référence{' '}
                  <strong style={{ color:'#FCD34D' }}>{refCmd}</strong> dans le libellé de votre virement.
                  Après paiement, envoyez le justificatif à{' '}
                  <strong>m.energy.skills@gmail.com</strong>.
                  L'accès sera activé sous 24h ouvrées.
                </p>
              </div>

              <Button
                onClick={() => { toast.success('RIB copié !'); navigator.clipboard.writeText('007170000107500030161367') }}
                style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:15, background:'#16A34A', marginBottom:12 }}>
                📋 Copier le RIB
              </Button>

              <button className={styles.cancelBtn} onClick={() => setMethodePaiement(null)}>
                ← Changer de méthode
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
