import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stagiaireAPI } from '../../api/client'
import { Card, CardHead, CardBody, Button, Badge, ProgressBar, PageHeader, Spinner, EmptyState } from '../../components/ui/UI'
import { useAuthStore } from '../../context/authStore'
import toast from 'react-hot-toast'
import styles from './Stagiaire.module.css'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    stagiaireAPI.mesInscriptions()
      .then(r => setInscriptions(r.data.results || r.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  const heure = new Date().getHours()
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir'

  const completees = inscriptions.filter(i => i.statut === 'completee').length
  const actives    = inscriptions.filter(i => i.statut === 'active').length
  const certifs    = inscriptions.filter(i => i.statut === 'completee').length

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroPill}>⚡ Habilitation NF C18-510</div>
          <h1 className={styles.heroTitle}>{salut}, {user?.prenom} !</h1>
          <p className={styles.heroSub}>Continuez votre parcours de formation électrique.</p>
          <Button onClick={() => navigate('/formations')} style={{ marginTop: 16 }}>
            Voir mes formations →
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {[
          { label: 'Formations inscrites', value: inscriptions.length, icon: '📚', color: 'blue' },
          { label: 'En cours',             value: actives,             icon: '▶️', color: 'amber' },
          { label: 'Complétées',           value: completees,          icon: '✅', color: 'green' },
          { label: 'Certificats obtenus',  value: certifs,             icon: '🏆', color: 'purple' },
        ].map(k => (
          <div key={k.label} className={`${styles.kpiCard} ${styles[`kpi_${k.color}`]}`}>
            <div className={styles.kpiIcon}>{k.icon}</div>
            <div className={styles.kpiVal}>{k.value}</div>
            <div className={styles.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Formations en cours */}
      <Card>
        <CardHead>
          <div>
            <div className={styles.cardTitle}>Mes formations</div>
            <div className={styles.cardSub}>Votre progression en cours</div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/formations')}>
            Voir tout
          </Button>
        </CardHead>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spinner size={32} />
          </div>
        ) : inscriptions.length === 0 ? (
          <CardBody>
            <EmptyState icon="📚" title="Aucune formation" subtitle="Inscrivez-vous à une formation pour commencer.">
              <Button onClick={() => navigate('/formations')} style={{ marginTop: 12 }}>
                Parcourir les formations
              </Button>
            </EmptyState>
          </CardBody>
        ) : (
          <div className={styles.formationList}>
            {inscriptions.map(insc => (
              <div key={insc.id} className={styles.formationItem}>
                <div className={styles.formationInfo}>
                  <div className={styles.formationNiveau}>
                    <Badge variant={insc.statut === 'completee' ? 'success' : insc.statut === 'active' ? 'info' : 'warning'}>
                      {insc.statut === 'completee' ? '✓ Complétée' : insc.statut === 'active' ? '▶ En cours' : '⏳ En attente'}
                    </Badge>
                    <span className={styles.niveauTag}>{insc.formation_detail?.niveau}</span>
                  </div>
                  <div className={styles.formationTitle}>{insc.formation_detail?.titre}</div>
                  <div className={styles.formationMeta}>
                    <span>⏱ {insc.formation_detail?.duree_heures}h</span>
                    <span>📖 {insc.formation_detail?.nb_chapitres} chapitres</span>
                    <span>📅 {new Date(insc.date_inscription).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <ProgressBar value={parseFloat(insc.progression)} color={parseFloat(insc.progression) === 100 ? 'green' : 'blue'} />
                </div>
                <div className={styles.formationActions}>
                  {insc.statut === 'en_attente' && (
                    <Button variant="danger" size="sm" onClick={() => navigate(`/paiement/${insc.id}`)}>
                      💳 Payer
                    </Button>
                  )}
                  {insc.statut === 'active' && (
                    <Button size="sm" onClick={() => navigate(`/cours/${insc.id}`)}>
                      Continuer →
                    </Button>
                  )}
                  {insc.statut === 'completee' && (
                    <Button variant="success" size="sm" onClick={() => navigate('/certificats')}>
                      🏆 Certificat
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
