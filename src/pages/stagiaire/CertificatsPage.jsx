import { useEffect, useState } from 'react'
import { certificatsAPI } from '../../api/client'
import { PageHeader, Button, Badge, Spinner, EmptyState } from '../../components/ui/UI'
import toast from 'react-hot-toast'
import styles from './Stagiaire.module.css'

export function CertificatsPage() {
  const [certificats, setCertificats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    certificatsAPI.mesCertificats()
      .then(r => setCertificats(r.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  const telecharger = async (cert) => {
    try {
      const res = await certificatsAPI.telecharger(cert.id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = `certificat-${cert.numero}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Impossible de télécharger le certificat.') }
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><Spinner size={40} /></div>

  return (
    <div className={styles.page}>
      <PageHeader title="Mes certificats" subtitle="Vos certificats d'habilitation NF C18-510" />

      {certificats.length === 0 ? (
        <EmptyState icon="🏆" title="Aucun certificat" subtitle="Complétez une formation pour obtenir votre certificat d'habilitation." />
      ) : (
        <div className={styles.certGrid}>
          {certificats.map(cert => (
            <div key={cert.id} className={styles.certCard}>
              <div className={styles.certNum}>N° {cert.numero}</div>
              <div className={styles.certTitle}>{cert.formation}</div>
              <div className={styles.certNom}>{cert.niveau}</div>
              <div className={styles.certRow}>
                <span>Délivré le</span>
                <span className={styles.certVal}>{new Date(cert.date_delivrance).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className={styles.certRow}>
                <span>Expire le</span>
                <span className={styles.certVal}>
                  {cert.date_expiration ? new Date(cert.date_expiration).toLocaleDateString('fr-FR') : '—'}
                </span>
              </div>
              <div className={styles.certStatus}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#0fa968', animation:'none' }} />
                {cert.statut === 'delivre' || cert.statut === 'genere' ? 'Certificat valide' : cert.statut}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:16 }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ flex:1, justifyContent:'center', color:'rgba(255,255,255,.8)', borderColor:'rgba(255,255,255,.2)', background:'transparent' }}
                  onClick={() => telecharger(cert)}
                >
                  ⬇ Télécharger PDF
                </Button>
                {cert.qr_code_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ borderColor:'rgba(255,255,255,.15)', color:'rgba(255,255,255,.5)', background:'transparent' }}
                    onClick={() => window.open(`/api/certificats/verifier/${cert.qr_code_url.split('/').pop()}/`)}
                  >
                    QR
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CertificatsPage
