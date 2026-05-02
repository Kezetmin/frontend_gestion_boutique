// Vérifie si l'utilisateur est connecté
export function isAuthenticated () {
  return !!localStorage.getItem('token')
}

// Récupère le token
export function getToken () {
  return localStorage.getItem('token')
}

// Sauvegarde le token
export function setToken (token) {
  localStorage.setItem('token', token)
}

// Déconnexion propre
export function logout () {
  localStorage.removeItem('token')
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}
