import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stagiaireAPI, paiementsAPI } from '../../api/client'
import { Card, CardHead, CardBody, Button, PageHeader, Badge, Spinner } from '../../components/ui/UI'
import toast from 'react-hot-toast'
import styles from './Admin.module.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [kpis, setKpis]           = useState(null)
  const [paiKpis, setPaiKpis]     = useState(null)
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      stagiaireAPI.dashboard(),
      paiementsAPI.dashboard(),
      stagiaireAPI.mesInscriptions().catch(() => ({ data: [] })),
    ]).then(([kRes, pRes, iRes]) => {
      setKpis(kRes.data)
      setPaiKpis(pRes.data)
      const list = pRes.data ? [] : []
      // On récupère les vraies inscriptions via endpoint admin
      fetch('/api/inscriptions/?page_size=8', { headers: { Authorization: `Bearer ${localStorage.getItem('electroform-auth') ? JSON.parse(localStorage.getItem('electroform-auth')).state?.accessToken : ''}` } })
        .then(r => r.json()).then(d => setInscriptions(d.results || d)).catch(() => {})
    }).catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={36} /></div>

  return (
    <div className={styles.page}>
      <PageHeader title="Administration" subtitle="Vue d'ensemble de la plateforme">
        <Button onClick={() => navigate('/formations')}>+ Nouvelle formation</Button>
      </PageHeader>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {[
          { label:'Stagiaires', value: kpis?.total_stagiaires    || 0, icon:'👥', c:'blue'   },
          { label:'Actifs',     value: kpis?.inscriptions_actives || 0, icon:'▶️', c:'amber'  },
          { label:'Certifiés',  value: kpis?.formations_completees|| 0, icon:'🏆', c:'green'  },
          { label:'MAD ce mois',value: Number(kpis?.revenus_mois_mad||0).toLocaleString('fr-MA'), icon:'💰', c:'purple' },
        ].map(k => (
          <div key={k.label} className={`${styles.kpiCard} ${styles[`kpi_${k.c}`]}`}>
            <div className={styles.kpiIcon}>{k.icon}</div>
            <div className={styles.kpiVal}>{k.value}</div>
            <div className={styles.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        {/* Paiements CMI */}
        <Card>
          <CardHead>
            <div>
              <div className={styles.cardTitle}>Paiements CMI</div>
              <div className={styles.cardSub}>Statistiques du mois</div>
            </div>
          </CardHead>
          <CardBody>
            <div className={styles.cmiStats}>
              {[
                { label:'Revenus du mois', val: `${Number(paiKpis?.revenus_mois_mad||0).toLocaleString('fr-MA')} MAD` },
                { label:'Transactions',    val: paiKpis?.transactions_mois || 0 },
                { label:'Taux de succès',  val: `${paiKpis?.taux_succes_pct || 0}%` },
                { label:'Montant moyen',   val: `${Number(paiKpis?.montant_moyen_mad||0).toFixed(0)} MAD` },
              ].map(s => (
                <div key={s.label} className={styles.cmiStat}>
                  <div className={styles.cmiStatLabel}>{s.label}</div>
                  <div className={styles.cmiStatVal}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className={styles.cmiOnline}>
              <span className={styles.cmiDot} />
              Passerelle CMI active
            </div>
          </CardBody>
        </Card>

        {/* Comptes en attente */}
        <Card>
          <CardHead>
            <div>
              <div className={styles.cardTitle}>Alertes</div>
              <div className={styles.cardSub}>Actions requises</div>
            </div>
          </CardHead>
          <CardBody>
            <div className={styles.alertList}>
              {kpis?.comptes_en_attente > 0 && (
                <div className={styles.alertItem}>
                  <span className={styles.alertDot} style={{ background:'var(--warning)' }} />
                  <div>
                    <div className={styles.alertTitle}>{kpis.comptes_en_attente} compte(s) en attente</div>
                    <div className={styles.alertSub}>Comptes non encore validés</div>
                  </div>
                  <Badge variant="warning">{kpis.comptes_en_attente}</Badge>
                </div>
              )}
              <div className={styles.alertItem}>
                <span className={styles.alertDot} style={{ background:'var(--success)' }} />
                <div>
                  <div className={styles.alertTitle}>Système opérationnel</div>
                  <div className={styles.alertSub}>API Django + PostgreSQL actifs</div>
                </div>
                <Badge variant="success">OK</Badge>
              </div>
              <div className={styles.alertItem}>
                <span className={styles.alertDot} style={{ background:'var(--primary)' }} />
                <div>
                  <div className={styles.alertTitle}>{kpis?.formations_publiees || 0} formation(s) publiée(s)</div>
                  <div className={styles.alertSub}>En ligne et accessibles</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tableau inscriptions récentes */}
      <Card>
        <CardHead>
          <div>
            <div className={styles.cardTitle}>Inscriptions récentes</div>
            <div className={styles.cardSub}>8 dernières inscriptions</div>
          </div>
          <Button variant="ghost" size="sm">Voir tout</Button>
        </CardHead>
        {inscriptions.length === 0 ? (
          <CardBody>
            <div style={{ textAlign:'center', padding:32, color:'var(--muted)', fontSize:13 }}>
              Aucune inscription récente — données chargées depuis l'API Django
            </div>
          </CardBody>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--surface2)', borderBottom:'1px solid var(--border)' }}>
                  {['Stagiaire','Formation','Statut','Progression','Date'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'11.5px', letterSpacing:'.8px', textTransform:'uppercase', fontWeight:700, color:'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inscriptions.map(i => (
                  <tr key={i.id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'12px 16px', fontSize:13.5 }}>{i.stagiaire_detail?.nom_complet || '—'}</td>
                    <td style={{ padding:'12px 16px', fontSize:13 }}>{i.formation_detail?.titre?.slice(0,40) || '—'}</td>
                    <td style={{ padding:'12px 16px' }}><Badge variant={i.statut==='completee'?'success':i.statut==='active'?'info':'warning'}>{i.statut}</Badge></td>
                    <td style={{ padding:'12px 16px', fontSize:13 }}>{parseFloat(i.progression||0).toFixed(0)}%</td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'var(--muted)' }}>{new Date(i.date_inscription).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
