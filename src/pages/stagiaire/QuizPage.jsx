import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { formationsAPI, stagiaireAPI } from '../../api/client'
import { Button, Badge, Spinner } from '../../components/ui/UI'
import toast from 'react-hot-toast'
import styles from './Stagiaire.module.css'

// ── QCM Simple — une seule bonne réponse ─────────────────────────────────────
function QcmSimple({ question, reponses, answered, onChoisir }) {
  return (
    <div>
      {question.options?.map(opt => {
        let cls = styles.quizOption
        if (answered !== null) {
          if (opt.est_correcte)                                   cls += ' ' + styles.correct
          else if (opt.id === answered.optionIds?.[0] && !opt.est_correcte) cls += ' ' + styles.wrong
        } else if (reponses[question.id]?.includes(opt.id)) {
          cls += ' ' + styles.selected
        }
        return (
          <div key={opt.id} className={cls} onClick={() => onChoisir(opt.id)}>
            <span className={styles.optLetter}>{opt.lettre}</span>
            <span style={{ fontSize: 14 }}>{opt.texte}</span>
            {answered !== null && opt.est_correcte && (
              <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700 }}>✓</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── QCM Multiple — plusieurs bonnes réponses (cases à cocher) ─────────────────
function QcmMultiple({ question, reponses, answered, onToggle }) {
  const selected = reponses[question.id] || []

  return (
    <div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'var(--accent-pale)', color: 'var(--accent)',
        borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600,
        marginBottom: 16,
      }}>
        ☑ Plusieurs réponses possibles
      </div>

      {question.options?.map(opt => {
        const isSelected = selected.includes(opt.id)
        let cls = styles.quizOption
        if (answered !== null) {
          if (opt.est_correcte)                                  cls += ' ' + styles.correct
          else if (isSelected && !opt.est_correcte)              cls += ' ' + styles.wrong
        } else if (isSelected) {
          cls += ' ' + styles.selected
        }

        return (
          <div key={opt.id} className={cls} onClick={() => answered === null && onToggle(opt.id)}
            style={{ cursor: answered !== null ? 'default' : 'pointer' }}
          >
            {/* Checkbox visuelle */}
            <span style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              border: `2px solid ${isSelected && answered === null ? 'var(--primary)' : answered !== null && opt.est_correcte ? 'var(--primary)' : answered !== null && isSelected ? 'var(--danger)' : 'var(--border2)'}`,
              background: isSelected && answered === null ? 'var(--primary)' : answered !== null && opt.est_correcte ? 'var(--primary)' : answered !== null && isSelected ? 'var(--danger)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700, transition: '.15s',
            }}>
              {(isSelected || (answered !== null && opt.est_correcte)) ? '✓' : ''}
            </span>
            <span style={{ fontSize: 14 }}>{opt.texte}</span>
            {answered !== null && opt.est_correcte && !isSelected && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                Bonne réponse manquée
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Vrai / Faux ───────────────────────────────────────────────────────────────
function VraiFaux({ question, reponses, answered, onChoisir }) {
  const options = question.options || []
  const selected = reponses[question.id]?.[0]

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const isSelected = selected === opt.id
        const estVrai    = opt.texte?.toLowerCase().startsWith('vrai') || opt.est_correcte

        // Couleurs d'état
        let bg, border, color
        if (answered !== null) {
          if (opt.est_correcte)              { bg = 'var(--primary-pale)'; border = 'var(--primary)'; color = 'var(--primary)' }
          else if (isSelected)               { bg = 'var(--danger-pale)';  border = 'var(--danger)';  color = '#7f1d1d' }
          else                               { bg = 'var(--surface2)';     border = 'var(--border)';  color = 'var(--muted)' }
        } else if (isSelected) {
          bg = 'var(--primary-pale)'; border = 'var(--primary)'; color = 'var(--primary)'
        } else {
          bg = 'var(--surface2)'; border = 'var(--border)'; color = 'var(--text)'
        }

        return (
          <div
            key={opt.id}
            onClick={() => answered === null && onChoisir(opt.id)}
            style={{
              flex: 1, minWidth: 140, padding: '24px 20px',
              borderRadius: 14, border: `2px solid ${border}`,
              background: bg, color,
              cursor: answered !== null ? 'default' : 'pointer',
              textAlign: 'center', fontFamily: 'Bricolage Grotesque',
              fontWeight: 800, fontSize: 22,
              transition: '.18s', userSelect: 'none',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>
              {estVrai ? '✅' : '❌'}
            </div>
            {opt.texte || (estVrai ? 'Vrai' : 'Faux')}
            {answered !== null && opt.est_correcte && (
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, opacity: .8 }}>
                Bonne réponse
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Page Quiz ─────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { inscriptionId, quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz]             = useState(null)
  const [tentative, setTentative]   = useState(null)
  const [questions, setQuestions]   = useState([])
  const [current, setCurrent]       = useState(0)
  const [reponses, setReponses]     = useState({})  // { questionId: [optionId, ...] }
  const [answered, setAnswered]     = useState(null) // { optionIds, estCorrecte }
  const [resultat, setResultat]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [temps, setTemps]           = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const init = async () => {
      try {
        const qRes = await formationsAPI.quiz(quizId)
        const q = qRes.data
        setQuiz(q)
        let qs = q.questions || []
        if (q.melanger_questions) qs = [...qs].sort(() => Math.random() - .5)
        setQuestions(qs)
        setTemps(q.temps_limite_min ? q.temps_limite_min * 60 : 0)

        const tRes = await stagiaireAPI.demarrerQuiz(inscriptionId, quizId)
        setTentative(tRes.data)
      } catch (err) {
        const msg = err.response?.data?.detail || 'Impossible de démarrer le quiz.'
        toast.error(msg)
        navigate(`/cours/${inscriptionId}`)
      } finally { setLoading(false) }
    }
    init()
  }, [inscriptionId, quizId])

  // Timer dégressif
  useEffect(() => {
    if (!quiz?.temps_limite_min || resultat) return
    timerRef.current = setInterval(() => {
      setTemps(t => {
        if (t <= 1) { clearInterval(timerRef.current); soumettre(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [quiz, resultat])

  const question    = questions[current]
  const typeQ       = question?.type_question || 'qcm_simple'
  const nbCorrectes = question?.options?.filter(o => o.est_correcte).length || 1

  // ── QCM Simple : sélection unique ──
  const choisirSimple = (optionId) => {
    if (answered !== null) return
    const opt = question.options.find(o => o.id === optionId)
    setAnswered({ optionIds: [optionId], estCorrecte: opt?.est_correcte })
    setReponses(prev => ({ ...prev, [question.id]: [optionId] }))
  }

  // ── QCM Multiple : toggle ──
  const toggleMultiple = (optionId) => {
    if (answered !== null) return
    setReponses(prev => {
      const curr = prev[question.id] || []
      return {
        ...prev,
        [question.id]: curr.includes(optionId)
          ? curr.filter(id => id !== optionId)
          : [...curr, optionId],
      }
    })
  }

  // ── Valider QCM Multiple ──
  const validerMultiple = () => {
    if (answered !== null) return
    const selected  = reponses[question.id] || []
    const correctes = question.options.filter(o => o.est_correcte).map(o => o.id)
    const estOk     = correctes.length === selected.length
      && correctes.every(id => selected.includes(id))
    setAnswered({ optionIds: selected, estCorrecte: estOk })
  }

  // ── Vrai / Faux : traité comme QCM simple ──
  const choisirVraiFaux = (optionId) => {
    if (answered !== null) return
    const opt = question.options.find(o => o.id === optionId)
    setAnswered({ optionIds: [optionId], estCorrecte: opt?.est_correcte })
    setReponses(prev => ({ ...prev, [question.id]: [optionId] }))
  }

  const suivant = () => {
    setAnswered(null)
    if (current < questions.length - 1) { setCurrent(c => c + 1) }
    else { soumettre() }
  }

  const soumettre = async () => {
    if (submitting || !tentative) return
    setSubmitting(true)
    clearInterval(timerRef.current)
    try {
      // Aplatir les réponses : une ligne par option sélectionnée
      const payload = Object.entries(reponses).flatMap(([qId, optIds]) =>
        optIds.map(optId => ({ question_id: qId, option_id: optId }))
      )
      const { data } = await stagiaireAPI.soumettre(tentative.id, { reponses: payload })
      setResultat(data)
    } catch { toast.error('Erreur lors de la soumission.') }
    finally { setSubmitting(false) }
  }

  const formatTemps = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Spinner size={40} />
    </div>
  )

  // ── Résultat final ──────────────────────────────────────────────────────────
  if (resultat) {
    const reussi = resultat.resultat === 'reussi'
    return (
      <div className={styles.page}>
        <div className={styles.quizWrap}>
          <div className={styles.quizResult}>
            <div className={`${styles.resultScore} ${reussi ? styles.resultPass : styles.resultFail}`}>
              {Math.round(resultat.score)}%
            </div>
            <h2 style={{ fontFamily: 'Bricolage Grotesque', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              {reussi ? '🎉 Quiz réussi !' : '📚 Score insuffisant'}
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 8 }}>
              {resultat.nb_correctes} bonne{resultat.nb_correctes > 1 ? 's' : ''} réponse{resultat.nb_correctes > 1 ? 's' : ''} sur {resultat.nb_questions}
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 28 }}>
              Seuil de réussite : {resultat.seuil}%
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button onClick={() => navigate(`/cours/${inscriptionId}`)}>← Retour au cours</Button>
              {!reussi && <Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button>}
              {reussi && <Button variant="success" onClick={() => navigate('/certificats')}>🏆 Mes certificats</Button>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!question) return null

  // Badge du type de question
  const badgeType = {
    qcm_simple:   { label: 'QCM — 1 réponse',      color: 'var(--primary)' },
    qcm_multiple: { label: 'QCM — Plusieurs réponses', color: '#7c3aed' },
    vrai_faux:    { label: 'Vrai ou Faux',           color: '#0891b2' },
  }[typeQ] || { label: 'QCM', color: 'var(--primary)' }

  return (
    <div className={styles.page}>
      <div className={styles.quizWrap}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>
              {quiz?.titre}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Question {current + 1} / {questions.length}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {quiz?.temps_limite_min && (
              <span style={{
                fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 16,
                color: temps < 60 ? 'var(--danger)' : 'var(--text)',
              }}>
                ⏱ {formatTemps(temps)}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate(`/cours/${inscriptionId}`)}>
              Abandonner
            </Button>
          </div>
        </div>

        {/* ── Barre de progression ── */}
        <div className={styles.quizProgress}>
          <div className={styles.quizProgressFill}
            style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>

        {/* ── Badge type de question ── */}
        <div style={{ marginBottom: 16 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: badgeType.color + '18', color: badgeType.color,
            border: `1px solid ${badgeType.color}40`,
            borderRadius: 8, padding: '3px 10px', fontSize: 11.5, fontWeight: 700,
          }}>
            {badgeType.label}
            {question.points > 1 && (
              <span style={{ opacity: .7 }}>· {question.points} pts</span>
            )}
          </span>
        </div>

        {/* ── Énoncé ── */}
        <div className={styles.quizQ}>{question.enonce}</div>

        {/* ── Image de la question (si présente) ── */}
        {question.image_url && (
          <img
            src={question.image_url}
            alt="Illustration"
            style={{ maxWidth: '100%', borderRadius: 10, marginBottom: 20, border: '1px solid var(--border)' }}
          />
        )}

        {/* ── Rendu selon le type ── */}
        {typeQ === 'qcm_simple' && (
          <QcmSimple
            question={question}
            reponses={reponses}
            answered={answered}
            onChoisir={choisirSimple}
          />
        )}

        {typeQ === 'qcm_multiple' && (
          <>
            <QcmMultiple
              question={question}
              reponses={reponses}
              answered={answered}
              onToggle={toggleMultiple}
            />
            {/* Bouton "Valider" pour QCM multiple */}
            {answered === null && (reponses[question.id]?.length > 0) && (
              <div style={{ marginTop: 16 }}>
                <Button onClick={validerMultiple}>
                  Valider ma sélection
                </Button>
              </div>
            )}
          </>
        )}

        {typeQ === 'vrai_faux' && (
          <VraiFaux
            question={question}
            reponses={reponses}
            answered={answered}
            onChoisir={choisirVraiFaux}
          />
        )}

        {/* ── Feedback / Explication ── */}
        {answered !== null && question.explication && (
          <div className={`${styles.quizFeedback} ${answered.estCorrecte ? styles.feedOk : styles.feedKo}`}>
            {answered.estCorrecte ? '✅ Correct ! ' : '❌ Incorrect. '}
            {question.explication}
          </div>
        )}

        {/* ── Navigation ── */}
        {answered !== null && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <Button loading={submitting} onClick={suivant}>
              {current < questions.length - 1 ? 'Question suivante →' : 'Voir les résultats →'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
