import Order from '@/models/Order';
import { AuthService } from './AuthService';
import { ClientService } from './ClientService';
import { ProductService } from './ProductService';
import type Client from '@/models/Client';
import type Product from '@/models/Product';

/**
 * Service pour interagir avec l'API des produits.
 */
export class OrderService {
  public apiUrl: string
  public authService: AuthService;
  private clientService: ClientService;
  private productService: ProductService;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || '';
    this.authService = new AuthService();
    this.clientService = new ClientService();
    this.productService = new ProductService();
  }

  /**
   * Récupère la liste des commandes.
   * @returns Une promesse qui résout à un tableau de commandes.
   */
  /**
   * Récupère la liste des commandes avec pagination et tri.
   * @param params - Paramètres de requête (page, itemsPerPage, order...)
   * @returns Une promesse qui résout à la structure hydra de l'API Platform.
   */
  public async getOrders(params: Record<string, any> = {}): Promise<{ data: any }> {
    try {
      const queryString = Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');
      const url = `${this.apiUrl}/api/orders${queryString ? '?' + queryString : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commmandes');
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      throw error;
    }
  }

  /**
   * Récupère une commande par son ID.
   * @param id - L'ID de la commande à récupérer.
   * @return Une promesse qui résout à la commande correspondante ou undefined si non trouvé.
   */
  public async getOrderById(id: number): Promise<Order | undefined> {
    try {
      const response = await fetch(`${this.apiUrl}/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du produit');
      }
      const data: Order = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau commande.
   * @param order - Le commande à créer.
   * @returns Une promesse qui résout au commande créé.
   */
  public async createOrder(order: Order): Promise<Order> {
    try {
      const payload: any = {
        date: order.date,
        state: order.state,
        client: typeof order.client === 'number' ? `/api/clients/${order.client}` : order.client,
        orderedProducts: Array.isArray(order.orderedProducts)
          ? order.orderedProducts.map((item: any) => {
              if (typeof item === 'string') return item;
              if (item.orderedProductId) return `/api/ordered_products/${item.orderedProductId}`;
              if (item.productId) return `/api/ordered_products/${item.productId}`;
              if (item.id) return `/api/ordered_products/${item.id}`;
              return '';
            })
          : [],
        deliveryAddress: order.deliveryAddress
          ? {
              street: order.deliveryAddress.street,
              city: order.deliveryAddress.city,
              postalCode: order.deliveryAddress.postalCode,
              country: order.deliveryAddress.country
            }
          : undefined,
        billingAddress: order.billingAddress
          ? {
              street: order.billingAddress.street,
              city: order.billingAddress.city,
              postalCode: order.billingAddress.postalCode,
              country: order.billingAddress.country
            }
          : undefined
      };

      const response = await fetch(`${this.apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
          'Authorization': `Bearer ${this.authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la création du produit');
      }
      const data: Order = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      throw error;
    }
  }

  /**
   * Met à jour un commmandes existant.
   * @param order - Le produit à mettre à jour.
   * @returns Une promesse qui résout au produit mis à jour.
   */
  public async updateOrder(order: Order): Promise<Order> {
    try {
      const { id, ...orderData } = order;
      const response = await fetch(`${this.apiUrl}/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Authorization': `Bearer ${this.authService.getToken()}`,
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du produit');
      }
      const data: Order = await response.json();
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
  public async deleteOrder(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/orders/${id}`, {
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
   * Récupère le client associé à une commande.
   * @param orderId - L'ID de la commande.
   * @returns Une promesse qui résout au client associé ou undefined si non trouvé.
   */
  public async getClientFromOrder(orderId: number): Promise<Client | undefined> {
    try {
      const response = await fetch(`${this.apiUrl}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du client de la commande');
      }
      const data = await response.json();
      const clientUrl = data.client;
      if (!clientUrl) return undefined;
      const match = clientUrl.match(/\/(\d+)$/);
      const clientId = match ? Number(match[1]) : undefined;
      if (!clientId) return undefined;
      return this.clientService.getClientById(clientId);
    } catch (error) {
      console.error('Erreur lors de la récupération du client de la commande:', error);
      throw error;
    }
  }
  /**
   * Récupère les produits commandés d'une commande.
   * @param orderId - L'ID de la commande.
   * @returns Une promesse qui résout à un tableau de produits commandés ou undefined si non trouvé.
   */
  public async getOrderedProductsFromOrder(orderId: number): Promise<Array<{ product: Product, quantity: number }> | undefined> {
    try {
      const response = await fetch(`${this.apiUrl}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits commandés');
      }
      const data = await response.json();
      if (!Array.isArray(data.orderedProducts)) return undefined;

      const results: Array<{ product: Product, quantity: number }> = [];
      for (const item of data.orderedProducts) {
        const match = item.match(/\/(\d+)$/);
        const productId = match ? Number(match[1]) : undefined;
        if (!productId) continue;
        const product = await this.productService.getProductById(productId);
        if (product) {
          results.push({ product, quantity: item.quantity });
        }
      }
      return results;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits commandés:', error);
      throw error;
    }
  }

  /**
   * Récupère les commandes avec les détails des clients et des produits commandés.
   * @returns Une promesse qui résout à un tableau d'objets contenant la commande, le client et les produits commandés.
   */
  public async getOrdersWithDetails(): Promise<Array<{ order: Order, client: Client | undefined, orderedProducts: Array<{ product: Product, quantity: number }> }>> {
    try {
      const { data } = await this.getOrders();
      const ordersWithDetails: Array<{ order: Order, client: Client | undefined, orderedProducts: Array<{ product: Product, quantity: number }> }> = [];

      for (const order of data["member"]) {
        let client: Client | undefined = undefined;
        if (order.client && typeof order.client === 'string') {
          const match = order.client.match(/\/(\d+)$/);
          const clientId = match ? Number(match[1]) : undefined;
          if (clientId) {
            client = await this.clientService.getClientById(clientId);
          }
        }

        const orderedProducts: Array<{ product: Product, quantity: number }> = [];
        if (Array.isArray(order.orderedProducts)) {
          for (const item of order.orderedProducts) {
            if (typeof item === 'string') {
              const match = item.match(/\/(\d+)$/);
              const productId = match ? Number(match[1]) : undefined;
              if (productId) {
                const productData = await this.productService.getOrderedProductById(productId);
                if (productData) {
                  orderedProducts.push({ product: productData[0], quantity: productData[1] });
                }
              }
            }
          }
        }

        ordersWithDetails.push({ order, client, orderedProducts });
      }

      return ordersWithDetails;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes avec détails:', error);
      throw error;
    }
  }

  /**
   * Récupère une commande avec les détails du client et des produits commandés.
   * @param id - L'ID de la commande.
   * @returns Une promesse qui résout à un objet contenant la commande, le client et les produits commandés.
   */
  public async getOrderByIdWithDetails(id: number): Promise<{ order: Order, client: Client | undefined, orderedProducts: Array<{ product: Product, quantity: number }> } | undefined> {
    try {
      const response = await fetch(`${this.apiUrl}/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`,
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la commande');
      }
      const order: Order = await response.json();

      let client: Client | undefined = undefined;
      if (order.client && typeof order.client === 'string') {
        const match = order.client.match(/\/(\d+)$/);
        const clientId = match ? Number(match[1]) : undefined;
        if (clientId) {
          client = await this.clientService.getClientById(clientId);
        }
      }

      const orderedProducts: Array<{ product: Product, quantity: number }> = [];
      if (Array.isArray(order.orderedProducts)) {
        for (const item of order.orderedProducts) {
          if (typeof item === 'string') {
            const match = item.match(/\/(\d+)$/);
            const productId = match ? Number(match[1]) : undefined;
            if (productId) {
              const productData = await this.productService.getOrderedProductById(productId);
              if (productData) {
                orderedProducts.push({ product: productData[0], quantity: productData[1]});
              }
            }
          }
        }
      }

      return {
        order,
        client,
        orderedProducts
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la commande:', error);
      throw error;
    }
  }

  /**
   * Retourne le nombre total de commandes.
   * @return Une promesse qui résout au nombre total de commandes.
   */
  public async countOrders(): Promise<number> {
    const { data } = await this.getOrders();
    return data["totalItems"] || 0;
  }

  /**
   * Exporte toutes les commandes au format CSV.
   * @returns Un Blob CSV contenant toutes les commandes.
   */
  public async exportOrders(): Promise<Blob> {
    try {
      const { data } = await this.getOrders({ itemsPerPage: 10000 });
      const orders = data["member"] || [];
      if (orders.length === 0) {
        throw new Error("Aucune commande à exporter.");
      }
      const columns = [
        "id",
        "date",
        "state",
        "client",
        "deliveryAddress",
        "billingAddress",
        "orderedProducts"
      ];
      const header = columns.join(",");
      const rows = await Promise.all(orders.map(async (order: any) => {
        let clientName = "";
        if (order.client && typeof order.client === 'string') {
          const match = order.client.match(/\/(\d+)$/);
          const clientId = match ? Number(match[1]) : undefined;
          if (clientId) {
            try {
              const client = await this.clientService.getClientById(clientId);
              if (client) clientName = `${client.firstname} ${client.lastname}`;
            } catch {}
          }
        }

        let deliveryAddress = "";
        if (order.deliveryAddress) {
          deliveryAddress = `${order.deliveryAddress.street ?? ''}, ${order.deliveryAddress.city ?? ''} ${order.deliveryAddress.postalCode ?? ''}`;
        }

        let billingAddress = "";
        if (order.billingAddress) {
          billingAddress = `${order.billingAddress.street ?? ''}, ${order.billingAddress.city ?? ''} ${order.billingAddress.postalCode ?? ''}`;
        }

        let orderedProductsStr = "";
        if (Array.isArray(order.orderedProducts)) {
          const productsArr: string[] = [];
          for (const item of order.orderedProducts) {
            if (typeof item === 'string') {
              const match = item.match(/\/(\d+)$/);
              const productId = match ? Number(match[1]) : undefined;
              if (productId) {
                try {
                  const productData = await this.productService.getOrderedProductById(productId);
                  if (productData) {
                    const [product, quantity] = productData;
                    productsArr.push(`${product.name} (x${quantity})`);
                  }
                } catch {}
              }
            }
          }
          orderedProductsStr = productsArr.join(' | ');
        }
        return columns.map(col => {
          let value = order[col];
          if (col === "client") value = clientName;
          if (col === "deliveryAddress") value = deliveryAddress;
          if (col === "billingAddress") value = billingAddress;
          if (col === "orderedProducts") value = orderedProductsStr;
          if (typeof value === "object" && value !== null) {
            value = JSON.stringify(value);
          }
          return `"${String(value ?? "").replace(/"/g, '""')}"`;
        }).join(",");
      }));
      const csvContent = [header, ...rows].join("\r\n");
      return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    } catch (error) {
      console.error("Erreur lors de l'export CSV des commandes:", error);
      throw error;
    }
  }
}