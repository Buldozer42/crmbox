import Client from '@/models/Client';
import { AuthService } from './AuthService';

/**
 * Service pour interagir avec l'API des produits.
 */
export class ClientService {
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
  public async getClients(params: Record<string, any> = {}): Promise<{ data: any }> {
    try {
      const queryString = Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');
      const url = `${this.apiUrl}/api/clients${queryString ? '?' + queryString : ''}`;
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
   * Récupère un produit par son ID.
   * @param id - L'ID du produit à récupérer.
   * @return Une promesse qui résout au produit correspondant ou undefined si non trouvé.
   */
  public async getClientById(id: number): Promise<Client | undefined> {
    try {
      const response = await fetch(`${this.apiUrl}/api/clients/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du produit');
      }
      const data: Client = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau produit.
   * @param client - Le produit à créer.
   * @returns Une promesse qui résout au produit créé.
   */
  public async createClient(client: Client): Promise<Client> {
    try {
      const response = await fetch(`${this.apiUrl}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
          'Authorization': `Bearer ${this.authService.getToken()}`,
        },
        body: JSON.stringify(client),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la création du produit');
      }
      const data: Client = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      throw error;
    }
  }

  /**
   * Met à jour un produit existant.
   * @param client - Le produit à mettre à jour.
   * @returns Une promesse qui résout au produit mis à jour.
   */
  public async updateClient(client: Client): Promise<Client> {
    try {
      const { id, ...clientData } = client;
      const response = await fetch(`${this.apiUrl}/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Authorization': `Bearer ${this.authService.getToken()}`,
        },
        body: JSON.stringify(clientData),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du produit');
      }
      const data: Client = await response.json();
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
  public async deleteClient(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/clients/${id}`, {
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
   * Retourne le nombre total de clients.
   */
  public async countClients(): Promise<number> {
    const { data } = await this.getClients();
    return data["totalItems"] || 0;
  }

  /**
   * Exporte tous les clients au format CSV.
   * @returns Un Blob CSV contenant tous les clients.
   */
  public async exportClients(): Promise<Blob> {
    try {
      const { data } = await this.getClients({ itemsPerPage: 10000 }); // récupère tous les clients
      const clients = data["member"] || [];
      if (clients.length === 0) {
        throw new Error("Aucun client à exporter.");
      }
      // Colonnes à exporter selon le modèle Client
      const columns = [
        "id",
        "lastname",
        "firstname",
        "company",
        "phone",
        "note",
        "deliveryAddress",
        "billingAddress"
      ];
      const header = columns.join(",");
      const rows = clients.map((client: any) => {
        return columns.map(col => {
          let value = client[col];
          if (typeof value === "object" && value !== null) {
            // Pour les adresses, on exporte sous forme JSON ou on extrait les champs principaux
            if (col === "deliveryAddress" || col === "billingAddress") {
              value = value ? JSON.stringify(value) : "";
            } else {
              value = JSON.stringify(value);
            }
          }
          return `"${String(value ?? "").replace(/"/g, '""')}"`;
        }).join(",");
      });
      const csvContent = [header, ...rows].join("\r\n");
      return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    } catch (error) {
      console.error("Erreur lors de l'export CSV des clients:", error);
      throw error;
    }
  }
}