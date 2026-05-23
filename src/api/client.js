import axios from 'axios'
import { useAuthStore } from '../context/authStore'
 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://electroform-backend-production.up.railway.app/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})
 
// ── Request interceptor : injecter le token Bearer ──────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)
 
// ── Response interceptor : refresh automatique si 401 ──────
let isRefreshing = false
let failedQueue = []
 
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}
 
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
 
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch((err) => Promise.reject(err))
      }
 
      originalRequest._retry = true
      isRefreshing = true
 
      const refreshToken = useAuthStore.getState().refreshToken
 
      if (!refreshToken) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(error)
      }
 
      try {
        const { data } = await axios.post('/api/auth/token/refresh/', {
          refresh: refreshToken,
        })
        useAuthStore.getState().updateToken(data.access)
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        processQueue(null, data.access)
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
 
    return Promise.reject(error)
  }
)
 
export default api
 
// ── Services ────────────────────────────────────────────────
 
export const authAPI = {
  login:          (data)  => api.post('/auth/login/', data),
  logout:         (data)  => api.post('/auth/logout/', data),
  inscription:    (data)  => api.post('/auth/inscription/', data),
  profil:         ()      => api.get('/auth/profil/'),
  updateProfil:   (data)  => api.patch('/auth/profil/', data),
  changerMDP:     (data)  => api.post('/auth/changer-mot-de-passe/', data),
  resetMDP:       (data)  => api.post('/auth/reset-mot-de-passe/', data),
}
 
export const formationsAPI = {
  list:           (params) => api.get('/formations/', { params }),
  detail:         (id)     => api.get(`/formations/${id}/`),
  chapitres:      (id)     => api.get(`/formations/${id}/chapitres/`),
  quiz:           (id)     => api.get(`/quiz/${id}/`),
}
 
export const stagiaireAPI = {
  dashboard:      ()       => api.get('/admin/dashboard/'),
  mesInscriptions: ()      => api.get('/inscriptions/mes-inscriptions/'),
  sInscrire:      (data)   => api.post('/inscriptions/creer/', data),
  inscription:    (id)     => api.get(`/inscriptions/${id}/`),
  progression:    (id)     => api.get(`/inscriptions/${id}/progression/`),
  marquerContenu: (id, d)  => api.post(`/inscriptions/${id}/progression/marquer/`, d),
  demarrerQuiz:   (iId, qId) => api.post(`/inscriptions/${iId}/quiz/${qId}/demarrer/`),
  soumettre:      (tId, d) => api.post(`/tentatives/${tId}/soumettre/`, d),
}
 
export const certificatsAPI = {
  mesCertificats: ()       => api.get('/certificats/mes-certificats/'),
  verifier:       (token)  => api.get(`/certificats/verifier/${token}/`),
  generer:        (id)     => api.post(`/certificats/generer/${id}/`),
  telecharger:    (id)     => api.get(`/certificats/${id}/telecharger/`, { responseType: 'blob' }),
}
export const paiementsAPI = {
  initier:        (data)   => api.post('/paiements/initier/', data),
  mesPaiements:   ()       => api.get('/paiements/mes-paiements/'),
  dashboard:      ()       => api.get('/paiements/dashboard/'),
  list:           (params) => api.get('/paiements/', { params }),
  stripeCheckout: (data)   => api.post('/paiements/stripe/checkout/', data),
  virement:       (data)   => api.post('/paiements/virement/', data),
}
