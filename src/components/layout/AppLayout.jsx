import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../context/authStore'
import { useThemeStore } from '../../context/themeStore'
import { useUIStore } from '../../context/uiStore'
import { authAPI } from '../../api/client'
import toast from 'react-hot-toast'
import styles from './AppLayout.module.css'
import ThemeToggle from '../ui/ThemeToggle'
import { useEffect } from 'react'

const NAV_STAGIAIRE = [
  { to: '/dashboard',   icon: '📊', label: 'Tableau de bord' },
  { to: '/formations',  icon: '📚', label: 'Mes formations'   },
  { to: '/certificats', icon: '🏆', label: 'Mes certificats'  },
  { to: '/profil',      icon: '👤', label: 'Mon profil'       },
]
const NAV_ADMIN = [
  { to: '/dashboard',   icon: '📊', label: 'Tableau de bord' },
  { to: '/admin',       icon: '⚙️', label: 'Administration'  },
  { to: '/formations',  icon: '📚', label: 'Formations'       },
  { to: '/certificats', icon: '🏆', label: 'Certificats'      },
  { to: '/profil',      icon: '👤', label: 'Mon profil'       },
]

export default function AppLayout() {
  const { user, refreshToken, logout, isAdmin } = useAuthStore()
  const { theme } = useThemeStore()
  const { focusMode } = useUIStore()
  const navigate = useNavigate()
  const nav = isAdmin() ? NAV_ADMIN : NAV_STAGIAIRE

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleLogout = async () => {
    try { await authAPI.logout({ refresh: refreshToken }) } catch {}
    logout()
    navigate('/login')
    toast.success('Déconnexion réussie')
  }

  const initials = user ? (user.prenom?.[0] || '') + (user.nom?.[0] || '') : 'U'

  return (
    <div className={styles.layout} style={focusMode ? { '--sidebar-w': '0px' } : undefined}>
      <aside className={styles.sidebar} style={focusMode ? { display: 'none' } : undefined}>
        <div className={styles.brand}>
          <span className={styles.brandPill}>⚡ {isAdmin() ? 'Admin' : 'Stagiaire'}</span>
          <div className={styles.brandName}>ElectroForm</div>
          <div className={styles.brandSub}>Habilitation NF C18-510</div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navLabel}>Navigation</div>
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <ThemeToggle />

        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            <div className={styles.userAv}>{initials.toUpperCase()}</div>
            <div>
              <div className={styles.userName}>{user?.prenom} {user?.nom}</div>
              <div className={styles.userRole}>{isAdmin() ? 'Administrateur' : 'Stagiaire'}</div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Déconnexion">⏏</button>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  )
}
