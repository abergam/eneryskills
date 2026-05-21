import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formationsAPI, stagiaireAPI } from '../../api/client'
import { PageHeader, Button, Badge, Spinner, EmptyState } from '../../components/ui/UI'
import toast from 'react-hot-toast'
import styles from './Stagiaire.module.css'

const COULEURS_NIVEAU = {
  B2V: { bg: '#eef1fd', color: '#1a3faa' }, BR:  { bg: '#f0fdf6', color: '#0fa968' },
  BS:  { bg: '#fffbeb', color: '#d97706' }, BE:  { bg: '#fef2f2', color: '#e02c2c' },
  B1V: { bg: '#ecfeff', color: '#0891b2' }, B0:  { bg: '#f3f4f6', color: '#374151' },
}

export default function FormationsPage() {
  const navigate = useNavigate()
  const [formations, setFormations] = useState([])
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [inscribing, setInscribing] = useState(null)

  useEffect(() => {
    Promise.all([
      formationsAPI.list({ statut: 'publiee' }),
      stagiaireAPI.mesInscriptions(),
    ]).then(([fRes, iRes]) => {
      setFormations(fRes.data.results || fRes.data)
      setInscriptions(iRes.data.results || iRes.data)
    }).catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  const inscriptionPour = (fId) => inscriptions.find(i => i.formation_detail?.id === fId)

  const sInscrire = async (formationId) => {
    setInscribing(formationId)
    try {
      const { data } = await stagiaireAPI.sInscrire({ formation_id: formationId })
      setInscriptions(prev => [...prev, data])
      toast.success('Inscription réussie ! Procédez au paiement.')
      navigate(`/paiement/${data.id}`)
    } catch (err) {
      const msg = err.response?.data?.formation_id?.[0] || err.response?.data?.detail || 'Erreur lors de l\'inscription.'
      toast.error(msg)
    } finally { setInscribing(null) }
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><Spinner size={40} /></div>

  return (
    <div className={styles.page}>
      <PageHeader title="Formations disponibles" subtitle={`${formations.length} formations NF C18-510`}>
      </PageHeader>

      {formations.length === 0 ? (
        <EmptyState icon="📚" title="Aucune formation disponible" subtitle="Revenez bientôt pour de nouvelles formations." />
      ) : (
        <div className={styles.formationGrid}>
          {formations.map(f => {
            const insc = inscriptionPour(f.id)
            const couleur = COULEURS_NIVEAU[f.niveau] || { bg: '#f3f4f6', color: '#374151' }
            return (
              <div key={f.id} className={styles.formCard}>
                <span className={styles.formCardTag} style={{ background: couleur.bg, color: couleur.color }}>
                  ⚡ Niveau {f.niveau}
                </span>
                <div className={styles.formCardTitle}>{f.titre}</div>
                <div className={styles.formCardDesc}>{f.description?.slice(0, 120)}...</div>
                <div className={styles.formCardMeta}>
                  <span>📖 {f.nb_chapitres} chapitres</span>
                  <span>⏱ {f.duree_heures}h</span>
                  <span>👥 {f.nb_inscrits} inscrits</span>
                </div>
                <div className={styles.formCardPrice}>
                  {parseFloat(f.prix_actuel || f.prix_mad).toLocaleString('fr-MA')} MAD
                  <span className={styles.formCardPriceSub}> TTC</span>
                </div>
                {insc ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <Badge variant={insc.statut === 'completee' ? 'success' : insc.statut === 'active' ? 'info' : 'warning'}>
                      {insc.statut === 'completee' ? '✓ Complétée' : insc.statut === 'active' ? '▶ En cours' : '⏳ Paiement requis'}
                    </Badge>
                    {insc.statut === 'active' && (
                      <Button size="sm" onClick={() => navigate(`/cours/${insc.id}`)}>Continuer</Button>
                    )}
                    {insc.statut === 'en_attente' && (
                      <Button size="sm" variant="danger" onClick={() => navigate(`/paiement/${insc.id}`)}>Payer</Button>
                    )}
                  </div>
                ) : (
                  <Button
                    loading={inscribing === f.id}
                    onClick={() => sInscrire(f.id)}
                    style={{ width:'100%', justifyContent:'center' }}
                  >
                    S'inscrire →
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
