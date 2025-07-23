import User from '@/models/User';
import { AuthService } from './AuthService';

/**
 * Service pour interagir avec l'API des produits.
 */
export class UserService {
  private apiUrl: string
  private authService: AuthService;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || '';
    this.authService = new AuthService();
  }

  /**
   * Récupère la liste des produits.
   * @returns Une promesse qui résout à un tableau de produits.
   */
  /**
   * Récupère la liste des produits avec pagination et tri.
   * @param params - Paramètres de requête (page, itemsPerPage, order...)
   * @returns Une promesse qui résout à la structure hydra de l'API Platform.
   */
  public async getUsers(params: Record<string, any> = {}): Promise<{ data: any }> {
    try {
      const queryString = Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');
      const url = `${this.apiUrl}/api/users${queryString ? '?' + queryString : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits');
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }

  /**
   * Met à jour un produit existant.
   * @param user - Le produit à mettre à jour.
   * @returns Une promesse qui résout au produit mis à jour.
   */
  public async updateUser(user: User): Promise<User> {
    try {
      const { id, ...userData } = user;
      const response = await fetch(`${this.apiUrl}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Authorization': `Bearer ${this.authService.getToken()}`,
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du produit');
      }
      const data: User = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      throw error;
    }
  }

  /**
   * Supprime un produit par son ID.
   * @param id - L'ID du produit à supprimer.
   * @returns Une promesse qui résout à true si la suppression a réussi, sinon false.
   */
  public async deleteUser(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du produit');
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      return false;
    }
  }

  /**
   * Retourne le nombre total d'utilisateurs.
   */
  public async countUsers(): Promise<number> {
    const { data } = await this.getUsers();
    return data["totalItems"] || 0;
  }

  /**
   * Exporte tous les utilisateurs au format CSV.
   * @returns Un Blob CSV contenant tous les utilisateurs.
   */
  public async exportUsers(): Promise<Blob> {
    try {
      const { data } = await this.getUsers({ itemsPerPage: 10000 }); // récupère tous les utilisateurs
      const users = data["member"] || [];
      if (users.length === 0) {
        throw new Error("Aucun utilisateur à exporter.");
      }
      // Colonnes à exporter selon le modèle User
      const columns = [
        "id",
        "email",
        "confirmed"
      ];
      const header = columns.join(",");
      const rows = users.map((user: any) => {
        return columns.map(col => {
          let value = user[col];
          if (typeof value === "object" && value !== null) {
            value = JSON.stringify(value);
          }
          return `"${String(value ?? "").replace(/"/g, '""')}"`;
        }).join(",");
      });
      const csvContent = [header, ...rows].join("\r\n");
      return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    } catch (error) {
      console.error("Erreur lors de l'export CSV des utilisateurs:", error);
      throw error;
    }
  }
}