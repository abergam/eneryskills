import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { stagiaireAPI, formationsAPI } from '../../api/client'
import { Button, Badge, ProgressBar, Spinner } from '../../components/ui/UI'
import toast from 'react-hot-toast'
import styles from './Stagiaire.module.css'

// ── Bloc de téléchargement / ouverture de fichier ─────────────────────────────
function BlocTelechargement({ contenu }) {
  const [downloading, setDownloading] = useState(false)

  if (!contenu.fichier_url) return null

  // Extraire le nom du fichier depuis l'URL
  const nomFichier = contenu.fichier_url.split('/').pop().split('?')[0]
    || contenu.titre + '.pdf'

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(contenu.fichier_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomFichier
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      // Fallback si fetch échoue (CORS, etc.)
      window.open(contenu.fichier_url, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  const isPdf = nomFichier.toLowerCase().endsWith('.pdf')
  const icone = isPdf ? '📄' : contenu.type === 'simulation' ? '🔬' : '📁'
  const libelle = isPdf ? 'Document PDF' : 'Fichier à télécharger'

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 24,
    }}>
      {/* En-tête du bloc */}
      <div style={{
        background: 'var(--surface2)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>{icone}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{libelle}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{nomFichier}</div>
        </div>
      </div>

      {/* Aperçu PDF intégré (si navigateur supporte) */}
      {isPdf && (
        <div style={{ background: '#1a1a2e', position: 'relative' }}>
          <iframe
            src={`${contenu.fichier_url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
            style={{
              width: '100%',
              height: 520,
              border: 'none',
              display: 'block',
            }}
            title={contenu.titre}
          />
          {/* Overlay informatif si l'iframe ne charge pas */}
          <noscript>
            <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
              Votre navigateur ne supporte pas l'aperçu PDF intégré.
            </div>
          </noscript>
        </div>
      )}

      {/* Barre d'actions */}
      <div style={{
        padding: '14px 20px',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
        background: 'var(--surface)',
      }}>
        {/* Bouton télécharger */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--primary)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13.5,
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? .7 : 1,
            transition: '.18s',
            fontFamily: 'inherit',
          }}
        >
          {downloading ? (
            <>⏳ Téléchargement…</>
          ) : (
            <>⬇ Télécharger le fichier</>
          )}
        </button>

        {/* Bouton ouvrir dans un nouvel onglet */}
        <a
          href={contenu.fichier_url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 8,
            border: '1.5px solid var(--border2)',
            background: 'var(--surface2)',
            color: 'var(--text)',
            fontWeight: 600,
            fontSize: 13.5,
            textDecoration: 'none',
            transition: '.18s',
          }}
        >
          ↗ Ouvrir dans un nouvel onglet
        </a>

        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
          {nomFichier}
        </span>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function CoursPage() {
  const { inscriptionId } = useParams()
  const navigate = useNavigate()

  const [inscription, setInscription]     = useState(null)
  const [chapitres, setChapitres]         = useState([])
  const [progression, setProgression]     = useState([])
  const [chapitreActif, setChapitreActif] = useState(0)
  const [contenuActif, setContenuActif]   = useState(null)
  const [loading, setLoading]             = useState(true)
  const [marking, setMarking]             = useState(false)

  useEffect(() => {
    const charger = async () => {
      try {
        const [iRes, pRes] = await Promise.all([
          stagiaireAPI.inscription(inscriptionId),
          stagiaireAPI.progression(inscriptionId),
        ])
        setInscription(iRes.data)
        setProgression(pRes.data.results || pRes.data)

        const chRes = await formationsAPI.chapitres(iRes.data.formation_detail.id)
        const chaps = chRes.data.results || chRes.data
        setChapitres(chaps)
        if (chaps.length > 0 && chaps[0].contenus?.length > 0) {
          setContenuActif(chaps[0].contenus[0])
        }
      } catch { toast.error('Impossible de charger le cours.') }
      finally { setLoading(false) }
    }
    charger()
  }, [inscriptionId])

  const estComplete = useCallback((contenuId) => {
    return progression.some(p => p.contenu_id === contenuId && p.est_complete)
  }, [progression])

  const marquerComplete = async (contenu) => {
    if (estComplete(contenu.id)) return
    setMarking(true)
    try {
      await stagiaireAPI.marquerContenu(inscriptionId, {
        contenu_id: contenu.id,
        est_complete: true,
        temps_passe_sec: 60,
      })
      setProgression(prev => [
        ...prev.filter(p => p.contenu_id !== contenu.id),
        { contenu_id: contenu.id, est_complete: true },
      ])
      toast.success('Contenu complété !')
      const iRes = await stagiaireAPI.inscription(inscriptionId)
      setInscription(iRes.data)
    } catch { toast.error('Erreur lors de la mise à jour.') }
    finally { setMarking(false) }
  }

  const allerSuivant = () => {
    const chap = chapitres[chapitreActif]
    if (!chap) return
    const idx = chap.contenus?.findIndex(c => c.id === contenuActif?.id) ?? -1
    if (idx < (chap.contenus?.length ?? 0) - 1) {
      setContenuActif(chap.contenus[idx + 1])
    } else if (chapitreActif < chapitres.length - 1) {
      const nextChap = chapitres[chapitreActif + 1]
      setChapitreActif(chapitreActif + 1)
      setContenuActif(nextChap.contenus?.[0] || null)
    }
  }

  const quizDuChapitre = () => {
    const chap = chapitres[chapitreActif]
    const quiz = chap?.quiz?.[0]
    if (quiz) navigate(`/quiz/${inscriptionId}/${quiz.id}`)
    else toast('Aucun quiz pour ce chapitre.')
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Spinner size={40} />
    </div>
  )
  if (!inscription) return <div className={styles.page}>Inscription introuvable.</div>

  const chapActif = chapitres[chapitreActif]
  const nbTotal   = chapitres.reduce((s, c) => s + (c.contenus?.length || 0), 0)
  const nbFaits   = progression.filter(p => p.est_complete).length

  return (
    <div className={styles.coursLayout}>
      {/* ── Sidebar chapitres ── */}
      <aside className={styles.coursSidebar}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>
            {inscription.formation_detail?.titre}
          </div>
          <ProgressBar value={parseFloat(inscription.progression)} />
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            {nbFaits}/{nbTotal} contenus terminés
          </div>
        </div>

        {chapitres.map((ch, idx) => (
          <div key={ch.id}>
            <div
              className={`${styles.chapitreItem} ${idx === chapitreActif ? styles.active : ''}`}
              onClick={() => { setChapitreActif(idx); setContenuActif(ch.contenus?.[0] || null) }}
            >
              <div className={styles.chapitreNum}>CH.{String(ch.numero).padStart(2, '0')}</div>
              <div className={styles.chapitreTitle}>{ch.titre}</div>
            </div>

            {idx === chapitreActif && ch.contenus?.map(cont => (
              <div
                key={cont.id}
                className={`${styles.contenuItem} ${estComplete(cont.id) ? styles.done : ''}`}
                onClick={() => setContenuActif(cont)}
                style={{
                  paddingLeft: 24,
                  background: contenuActif?.id === cont.id ? 'var(--primary-pale)' : undefined,
                }}
              >
                <div className={styles.contenuCheck}>{estComplete(cont.id) ? '✓' : ''}</div>
                <span style={{ fontSize: 12 }}>
                  {cont.type === 'video'      ? '▶' :
                   cont.type === 'pdf'        ? '📄' :
                   cont.type === 'quiz'       ? '📝' :
                   cont.type === 'simulation' ? '🔬' : '📖'}{' '}
                  {cont.titre}
                </span>
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* ── Contenu principal ── */}
      <main className={styles.coursMain}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/formations')}>← Retour</Button>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            Chapitre {chapActif?.numero} — {chapActif?.titre}
          </span>
        </div>

        {contenuActif ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <Badge variant={estComplete(contenuActif.id) ? 'success' : 'neutral'}>
                {estComplete(contenuActif.id) ? '✓ Complété' : '○ À faire'}
              </Badge>
              <Badge variant="info">{contenuActif.type}</Badge>
              {contenuActif.duree_minutes && (
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>⏱ {contenuActif.duree_minutes} min</span>
              )}
            </div>

            <h1 style={{
              fontFamily: 'Bricolage Grotesque', fontSize: 26, fontWeight: 800,
              color: 'var(--text)', marginBottom: 20, letterSpacing: '-.5px',
            }}>
              {contenuActif.titre}
            </h1>

            {/* ── Vidéo ── */}
            {contenuActif.type === 'video' && contenuActif.video_url && (
              <div style={{
                position: 'relative', paddingBottom: '56.25%', height: 0,
                borderRadius: 12, overflow: 'hidden', background: '#000', marginBottom: 20,
              }}>
                <iframe
                  src={contenuActif.video_url}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allowFullScreen
                />
              </div>
            )}

            {/* ── PDF / Fichier téléchargeable ── */}
            {(contenuActif.type === 'pdf' || contenuActif.fichier_url) && (
              <BlocTelechargement contenu={contenuActif} />
            )}

            {/* ── Texte HTML riche ── */}
            {(contenuActif.type === 'texte' || contenuActif.texte_html) && (
              <div style={{ maxWidth: 860, width: '100%' }}>
                <div
                  className="ef-content"
                  dangerouslySetInnerHTML={{ __html: contenuActif.texte_html || '<p>Contenu en cours de chargement...</p>' }}
                />
              </div>
            )}

            {/* ── Aucun contenu disponible ── */}
            {!contenuActif.texte_html && !contenuActif.video_url && !contenuActif.fichier_url && (
              <div style={{
                background: 'var(--surface2)', border: '1px dashed var(--border2)',
                borderRadius: 12, padding: 32, color: 'var(--muted)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Contenu non encore disponible</div>
                <div style={{ fontSize: 13 }}>Ce contenu sera ajouté par l'administrateur.</div>
              </div>
            )}

            {/* ── Actions ── */}
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              {!estComplete(contenuActif.id) ? (
                <Button loading={marking} onClick={() => marquerComplete(contenuActif)}>
                  ✓ Marquer comme terminé
                </Button>
              ) : (
                <Button variant="success" onClick={allerSuivant}>
                  Suivant →
                </Button>
              )}
              {chapActif?.quiz?.length > 0 && (
                <Button variant="outline" onClick={quizDuChapitre}>
                  📝 Quiz du chapitre
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Sélectionnez un contenu dans le menu</div>
          </div>
        )}
      </main>
    </div>
  )
}
