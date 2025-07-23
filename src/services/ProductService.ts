import Product from '@/models/Product';
import { AuthService } from './AuthService';

/**
 * Service pour interagir avec l'API des produits.
 */
export class ProductService {
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
  public async getProducts(params: Record<string, any> = {}): Promise<{ data: any }> {
    try {
      const queryString = Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');
      const url = `${this.apiUrl}/api/products${queryString ? '?' + queryString : ''}`;
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
  public async getProductById(id: number): Promise<Product | undefined> {
    try {
      const response = await fetch(`${this.apiUrl}/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du produit');
      }
      const data: Product = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau produit.
   * @param product - Le produit à créer.
   * @returns Une promesse qui résout au produit créé.
   */
  public async createProduct(product: Product): Promise<Product> {
    try {
      const response = await fetch(`${this.apiUrl}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
          'Authorization': `Bearer ${this.authService.getToken()}`,
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la création du produit');
      }
      const data: Product = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      throw error;
    }
  }

  /**
   * Met à jour un produit existant.
   * @param product - Le produit à mettre à jour.
   * @returns Une promesse qui résout au produit mis à jour.
   */
  public async updateProduct(product: Product): Promise<Product> {
    try {
      const { id, ...productData } = product;
      const response = await fetch(`${this.apiUrl}/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Authorization': `Bearer ${this.authService.getToken()}`,
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du produit');
      }
      const data: Product = await response.json();
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
  public async deleteProduct(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/products/${id}`, {
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
   * Récupère un produit commandé par son ID.
   * @param id - L'ID du produit commandé à récupérer.
   * @returns Une promesse qui résout à un tableau contenant le produit et la quantité, ou undefined si non trouvé.
   */
  public async getOrderedProductById(id: number): Promise<[Product, number] | undefined> {
    try {
      const response = await fetch(`${this.apiUrl}/api/ordered_products/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du produit commandé');
      }
      const data = await response.json();
      return [data.product, data.quantity];
    } catch (error) {
      console.error('Erreur lors de la récupération du produit commandé:', error);
      throw error;
    }
  }

  /**
   * Retourne le nombre total de produits.
   */
  public async countProducts(): Promise<number> {
    const { data } = await this.getProducts();
    return data["totalItems"] || 0;
  }
  /**
   * Exporte tous les produits au format CSV.
   * @returns Un Blob CSV contenant tous les produits.
   */
  public async exportProducts(): Promise<Blob> {
    try {
      const { data } = await this.getProducts({ itemsPerPage: 10000 }); // récupère tous les produits
      const products = data["member"] || [];
      if (products.length === 0) {
        throw new Error("Aucun produit à exporter.");
      }
      // Colonnes à exporter selon le modèle Product
      const columns = [
        "id",
        "name",
        "description",
        "price",
        "stock"
      ];
      const header = columns.join(",");
      const rows = products.map((product: any) => {
        return columns.map(col => {
          let value = product[col];
          if (typeof value === "object" && value !== null) {
            value = JSON.stringify(value);
          }
          return `"${String(value ?? "").replace(/"/g, '""')}"`;
        }).join(",");
      });
      const csvContent = [header, ...rows].join("\r\n");
      return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    } catch (error) {
      console.error("Erreur lors de l'export CSV des produits:", error);
      throw error;
    }
  }
}