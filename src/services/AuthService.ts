interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  roles: string[];
}

/**
 * Service d'authentification pour gérer la connexion, l'enregistrement et la déconnexion des utilisateurs.
 */
export class AuthService {
    private tokenKey = 'auth_token';
    private apiUrl: string;

    constructor() {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        this.apiUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
    }

    /**
     * Authentifie l'utilisateur avec les identifiants fournis.
     * @param credentials - Les identifiants de connexion de l'utilisateur.
     * @returns Une promesse qui résout à true si la connexion est réussie, sinon false.
     */
    async login(credentials: LoginCredentials): Promise<boolean> {
        // Requête POST à l'API pour authentifier l'utilisateur
        try {
            const response = await fetch(`${this.apiUrl}/security/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...credentials
                }),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            // Si la réponse est réussie, on récupère le token
            const data: AuthResponse = await response.json();
            this.setToken(data.token);
            this.setRoles(data.roles);
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            return false;
        }
    }

    async register(credentials: LoginCredentials): Promise<boolean> {
        // Requête POST à l'API pour enregistrer un nouvel utilisateur
        try {
            const response = await fetch(`${this.apiUrl}/security/register`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            // Si la réponse est réussie, on récupère le token
            const data: AuthResponse = await response.json();
            this.setToken(data.token);
            this.setRoles(data.roles);
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            return false;
        }
    }

    /**
     * Déconnecte l'utilisateur en supprimant le token d'authentification.
     */
    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('auth_roles');
    }

    /**
     * Récupère le token d'authentification stocké dans le localStorage.
     * @returns Le token d'authentification ou null s'il n'existe pas.
     */
    getToken(): string | null {
        const token = localStorage.getItem(this.tokenKey);
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convertir les secondes en millisecondes
            if (Date.now() >= expiry) {
            this.logout();
            return null;
            }
            return token;
        } catch (e) {
            this.logout();
            return null;
        }
    }

    /**
     * Récupère les rôles de l'utilisateur stockés dans le localStorage.
     * @returns Un tableau de rôles ou un tableau vide s'il n'existe pas.
     */
    getRoles(): string[] {
        const roles = localStorage.getItem('auth_roles');
        return roles ? JSON.parse(roles) : [];
    }

    /**
     * Définit le token d'authentification dans le localStorage.
     * @param token - Le token d'authentification à stocker.
     */
    private setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    /**
     *  Définit les rôles de l'utilisateur dans le localStorage.
     * @param roles - Les rôles de l'utilisateur à stocker.
     */
    private setRoles(roles: string[]): void {
        localStorage.setItem('auth_roles', JSON.stringify(roles));
    }

    /**
     * Vérifie si l'utilisateur a un rôle spécifique.
     * @param role - Le rôle à vérifier.
     * @returns true si l'utilisateur a le rôle, sinon false.
     */
    hasRole(role: string): boolean {
        const userRoles = this.getRoles();
        return userRoles.includes(role);
    }

    /**
     * Vérifie si l'utilisateur est authentifié en vérifiant la présence et la validité du token.
     * @returns true si l'utilisateur est authentifié, sinon false.
     */
    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convertir les secondes en millisecondes
            return Date.now() < expiry;
        } catch (e) {
            return false;
        }
    }
}

export default new AuthService();
