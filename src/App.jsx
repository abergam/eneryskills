import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'

// Auth
import LoginPage        from './pages/auth/LoginPage'
import InscriptionPage  from './pages/auth/InscriptionPage'
import ResetMDPPage     from './pages/auth/ResetMDPPage'

// Layout
import AppLayout        from './components/layout/AppLayout'

// Stagiaire
import DashboardPage    from './pages/stagiaire/DashboardPage'
import FormationsPage   from './pages/stagiaire/FormationsPage'
import CoursPage        from './pages/stagiaire/CoursPage'
import QuizPage         from './pages/stagiaire/QuizPage'
import PaiementPage     from './pages/stagiaire/PaiementPage'
import CertificatsPage  from './pages/stagiaire/CertificatsPage'
import ProfilPage       from './pages/stagiaire/ProfilPage'
import PaiementSucces   from './pages/stagiaire/PaiementSucces'
import PaiementEchec    from './pages/stagiaire/PaiementEchec'

// Admin
import AdminDashboard   from './pages/admin/AdminDashboard'

// Route gardée
function PrivateRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/inscription"  element={<InscriptionPage />} />
      <Route path="/reset-mdp"    element={<ResetMDPPage />} />
      <Route path="/verify/:token" element={<div style={{padding:40,textAlign:'center',fontSize:18}}>Vérification en cours...</div>} />

      {/* Paiement callbacks (publiques — CMI redirige ici) */}
      <Route path="/payment/success" element={<PaiementSucces />} />
      <Route path="/payment/fail"    element={<PaiementEchec />} />

      {/* App (authentifiée) */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"   element={<DashboardPage />} />
        <Route path="formations"  element={<FormationsPage />} />
        <Route path="cours/:inscriptionId" element={<CoursPage />} />
        <Route path="quiz/:inscriptionId/:quizId" element={<QuizPage />} />
        <Route path="paiement/:inscriptionId" element={<PaiementPage />} />
        <Route path="certificats" element={<CertificatsPage />} />
        <Route path="profil"      element={<ProfilPage />} />

        {/* Admin */}
        <Route path="admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
