import { clsx } from 'clsx'
import styles from './UI.module.css'

export function Card({ children, className, ...props }) {
  return <div className={clsx(styles.card, className)} {...props}>{children}</div>
}

export function CardHead({ children, className }) {
  return <div className={clsx(styles.cardHead, className)}>{children}</div>
}

export function CardBody({ children, className }) {
  return <div className={clsx(styles.cardBody, className)}>{children}</div>
}

export function Button({ children, variant = 'primary', size = 'md', loading, className, ...props }) {
  return (
    <button
      className={clsx(styles.btn, styles[`btn_${variant}`], styles[`btn_${size}`], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : null}
      {children}
    </button>
  )
}

export function Badge({ children, variant = 'neutral' }) {
  return <span className={clsx(styles.badge, styles[`badge_${variant}`])}>{children}</span>
}

export function ProgressBar({ value = 0, color = 'blue', height = 6 }) {
  return (
    <div className={styles.progWrap}>
      <div className={styles.progBar} style={{ height }}>
        <div
          className={clsx(styles.progFill, styles[`prog_${color}`])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className={styles.progPct}>{Math.round(value)}%</span>
    </div>
  )
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSub}>{subtitle}</p>}
      </div>
      {children && <div className={styles.pageActions}>{children}</div>}
    </div>
  )
}

export function Spinner({ size = 24 }) {
  return (
    <div className={styles.spinnerWrap} style={{ width: size, height: size }}>
      <div className={styles.spinnerCircle} style={{ width: size, height: size }} />
    </div>
  )
}

export function EmptyState({ icon = '📭', title, subtitle, children }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{icon}</div>
      <div className={styles.emptyTitle}>{title}</div>
      {subtitle && <div className={styles.emptySub}>{subtitle}</div>}
      {children}
    </div>
  )
}

export function Input({ label, error, ...props }) {
  return (
    <div className={styles.formGroup}>
      {label && <label className={styles.formLabel}>{label}</label>}
      <input className={clsx(styles.formInput, error && styles.inputError)} {...props} />
      {error && <span className={styles.formError}>{error}</span>}
    </div>
  )
}

export function Select({ label, error, children, ...props }) {
  return (
    <div className={styles.formGroup}>
      {label && <label className={styles.formLabel}>{label}</label>}
      <select className={clsx(styles.formInput, styles.formSelect, error && styles.inputError)} {...props}>
        {children}
      </select>
      {error && <span className={styles.formError}>{error}</span>}
    </div>
  )
}
