import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../context/authStore'
import { authAPI } from '../../api/client'
import { Button, Input } from '../../components/ui/UI'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data)
      toast.success(`Bienvenue, ${data.user.prenom} !`)
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Identifiants incorrects.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authLogo}>
          <div className={styles.authLogoIcon}>⚡</div>
          <div className={styles.authLogoName}>ElectroForm</div>
          <div className={styles.authLogoSub}>Habilitation Électrique NF C18-510</div>
        </div>

        <h2 className={styles.authTitle}>Connexion</h2>
        <p className={styles.authSub}>Accédez à votre espace de formation</p>

        <form onSubmit={handleSubmit}>
          <Input
            label="Adresse email"
            type="email"
            placeholder="vous@exemple.ma"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />

          <div className={styles.forgotRow}>
            <Link to="/reset-mdp" className={styles.forgotLink}>Mot de passe oublié ?</Link>
          </div>

          {error && <div className={styles.authError}>{error}</div>}

          <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
            Se connecter →
          </Button>
        </form>

        <p className={styles.authFooter}>
          Pas encore de compte ?{' '}
          <Link to="/inscription" className={styles.authLink}>Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}
