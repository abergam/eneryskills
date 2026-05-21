import { useState } from 'react'
import { authAPI } from '../../api/client'
import { useAuthStore } from '../../context/authStore'
import { Card, CardHead, CardBody, Button, Input, PageHeader } from '../../components/ui/UI'
import toast from 'react-hot-toast'
import styles from './Stagiaire.module.css'

export default function ProfilPage() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    prenom:    user?.prenom    || '',
    nom:       user?.nom       || '',
    telephone: user?.telephone || '',
    entreprise:user?.entreprise|| '',
    poste:     user?.poste     || '',
    ville:     user?.ville     || '',
  })
  const [mdpForm, setMdpForm] = useState({ ancien_mot_de_passe:'', nouveau_mot_de_passe:'', confirmer_mot_de_passe:'' })
  const [loadingProfil, setLoadingProfil] = useState(false)
  const [loadingMdp, setLoadingMdp] = useState(false)

  const set  = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setM = (k) => (e) => setMdpForm(f => ({ ...f, [k]: e.target.value }))

  const saveProfil = async (e) => {
    e.preventDefault(); setLoadingProfil(true)
    try {
      const { data } = await authAPI.updateProfil(form)
      updateUser(data)
      toast.success('Profil mis à jour !')
    } catch { toast.error('Erreur lors de la mise à jour.') }
    finally { setLoadingProfil(false) }
  }

  const saveMdp = async (e) => {
    e.preventDefault()
    if (mdpForm.nouveau_mot_de_passe !== mdpForm.confirmer_mot_de_passe) { toast.error('Les mots de passe ne correspondent pas.'); return }
    setLoadingMdp(true)
    try {
      await authAPI.changerMDP(mdpForm)
      toast.success('Mot de passe changé !')
      setMdpForm({ ancien_mot_de_passe:'', nouveau_mot_de_passe:'', confirmer_mot_de_passe:'' })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Mot de passe actuel incorrect.'
      toast.error(msg)
    } finally { setLoadingMdp(false) }
  }

  const initials = ((user?.prenom?.[0] || '') + (user?.nom?.[0] || '')).toUpperCase()

  return (
    <div className={styles.page}>
      <PageHeader title="Mon profil" subtitle="Gérez vos informations personnelles" />

      {/* Avatar + info résumée */}
      <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:28, background:'var(--surface)', borderRadius:'var(--radius)', padding:'20px 24px', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ width:64, height:64, borderRadius:16, background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800, fontSize:22, flexShrink:0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontSize:20, fontWeight:800, color:'var(--text)' }}>{user?.prenom} {user?.nom}</div>
          <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>{user?.email}</div>
          <div style={{ marginTop:6 }}>
            <span style={{ background:'var(--primary-pale)', color:'var(--primary)', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
              {user?.role === 'admin' ? '⚙️ Administrateur' : '🎓 Stagiaire'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.profilGrid}>
        {/* Informations personnelles */}
        <Card>
          <CardHead><div style={{ fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:15 }}>Informations personnelles</div></CardHead>
          <CardBody>
            <form onSubmit={saveProfil}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Input label="Prénom" value={form.prenom}    onChange={set('prenom')}    required />
                <Input label="Nom"    value={form.nom}       onChange={set('nom')}       required />
              </div>
              <Input label="Téléphone"  value={form.telephone}  onChange={set('telephone')}  placeholder="+212 6XX XXX XXX" />
              <Input label="Entreprise" value={form.entreprise} onChange={set('entreprise')} placeholder="Nom de votre entreprise" />
              <Input label="Poste"      value={form.poste}      onChange={set('poste')}      placeholder="Technicien, Ingénieur..." />
              <Input label="Ville"      value={form.ville}      onChange={set('ville')}      placeholder="Casablanca, Rabat..." />
              <Button type="submit" loading={loadingProfil} style={{ marginTop:4 }}>Enregistrer</Button>
            </form>
          </CardBody>
        </Card>

        {/* Mot de passe */}
        <Card>
          <CardHead><div style={{ fontFamily:'Bricolage Grotesque', fontWeight:700, fontSize:15 }}>Changer le mot de passe</div></CardHead>
          <CardBody>
            <form onSubmit={saveMdp}>
              <Input label="Mot de passe actuel"    type="password" value={mdpForm.ancien_mot_de_passe}    onChange={setM('ancien_mot_de_passe')}    required />
              <Input label="Nouveau mot de passe"   type="password" value={mdpForm.nouveau_mot_de_passe}   onChange={setM('nouveau_mot_de_passe')}   required />
              <Input label="Confirmer le nouveau"   type="password" value={mdpForm.confirmer_mot_de_passe} onChange={setM('confirmer_mot_de_passe')} required />
              <Button type="submit" loading={loadingMdp} variant="outline" style={{ marginTop:4 }}>Changer le mot de passe</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
