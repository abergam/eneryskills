import { useThemeStore } from '../../context/themeStore'
import styles from './ThemeToggle.module.css'

const THEMES = [
  { id: 'light',  icon: '☀️', label: 'Clair'  },
  { id: 'medium', icon: '🌤', label: 'Neutre' },
  { id: 'dark',   icon: '🌙', label: 'Sombre' },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Affichage</span>
      <div className={styles.switcher}>
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={`${styles.btn} ${theme === t.id ? styles.active : ''}`}
            onClick={() => setTheme(t.id)}
            title={t.label}
            aria-label={t.label}
          >
            <span className={styles.icon}>{t.icon}</span>
            <span className={styles.name}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
