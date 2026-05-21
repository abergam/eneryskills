// InscriptionPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../api/client'
import { Button, Input } from '../../components/ui/UI'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export function InscriptionPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'', password_confirm:'', prenom:'', nom:'', telephone:'', entreprise:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setLoading(true); setError('')
    try {
      await authAPI.inscription(form)
      toast.success('Compte créé ! Vérifiez votre email.')
      navigate('/login')
    } catch (err) {
      const d = err.response?.data
      const msg = d?.email?.[0] || d?.password?.[0] || d?.detail || 'Erreur lors de l\'inscription.'
      setError(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authLogo}>
          <div className={styles.authLogoIcon}>⚡</div>
          <div className={styles.authLogoName}>ElectroForm</div>
        </div>
        <h2 className={styles.authTitle}>Créer un compte</h2>
        <p className={styles.authSub}>Rejoignez la plateforme de formation</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.twoCol}>
            <Input label="Prénom" placeholder="Ahmed" value={form.prenom} onChange={set('prenom')} required />
            <Input label="Nom" placeholder="Bouhali" value={form.nom} onChange={set('nom')} required />
          </div>
          <Input label="Email" type="email" placeholder="vous@exemple.ma" value={form.email} onChange={set('email')} required />
          <Input label="Téléphone" placeholder="+212 6XX XXX XXX" value={form.telephone} onChange={set('telephone')} />
          <Input label="Entreprise (optionnel)" placeholder="OCP, ONEE..." value={form.entreprise} onChange={set('entreprise')} />
          <div className={styles.twoCol}>
            <Input label="Mot de passe" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            <Input label="Confirmer" type="password" placeholder="••••••••" value={form.password_confirm} onChange={set('password_confirm')} required />
          </div>
          {error && <div className={styles.authError}>{error}</div>}
          <Button type="submit" loading={loading} style={{ width:'100%', justifyContent:'center', padding:'11px' }}>
            Créer mon compte →
          </Button>
        </form>
        <p className={styles.authFooter}>
          Déjà inscrit ? <Link to="/login" className={styles.authLink}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

export function ResetMDPPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.resetMDP({ email })
      setSent(true)
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authLogo}>
          <div className={styles.authLogoIcon}>⚡</div>
          <div className={styles.authLogoName}>ElectroForm</div>
        </div>
        {sent ? (
          <>
            <h2 className={styles.authTitle}>Email envoyé ✓</h2>
            <p className={styles.authSub}>Vérifiez votre boîte mail pour réinitialiser votre mot de passe.</p>
            <Link to="/login"><Button variant="outline" style={{ width:'100%', justifyContent:'center', marginTop:16 }}>Retour à la connexion</Button></Link>
          </>
        ) : (
          <>
            <h2 className={styles.authTitle}>Mot de passe oublié</h2>
            <p className={styles.authSub}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
            <form onSubmit={handleSubmit}>
              <Input label="Email" type="email" placeholder="vous@exemple.ma" value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" loading={loading} style={{ width:'100%', justifyContent:'center', padding:'11px', marginTop:8 }}>
                Envoyer le lien
              </Button>
            </form>
            <p className={styles.authFooter}><Link to="/login" className={styles.authLink}>← Retour</Link></p>
          </>
        )}
      </div>
    </div>
  )
}

export default InscriptionPage
