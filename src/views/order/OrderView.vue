<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useRoute } from "vue-router";
import { OrderService } from "@/services/OrderService";
import Order from "@/models/Order";
import type Client from "@/models/Client";
import type Product from "@/models/Product";
import { useRouter } from "vue-router";

const toast = useToast();
const route = useRoute();
const router = useRouter();
const order = ref<Order | null>(null);
const client = ref<Client | null>(null);
const loading = ref(true);
const error = ref("");
const orderedProductsDetails = ref<{ product: Product; quantity: number }[]>([]);
const total = ref(0);

const showDeleteModal = ref(false);
const deleting = ref(false);

/**
 * Calculates the total price of the ordered products.
 */
function calculateTotal() {
  total.value = orderedProductsDetails.value.reduce(
    (acc, prod) => acc + prod.product.price * prod.quantity,
    0
  );
}

/**
 * Gérer la suppression de la commande.
 */
async function handleDelete() {
  if (!order.value) return;
  deleting.value = true;
  error.value = "";
  try {
    const service = new OrderService();
    const success = await service.deleteOrder(order.value.id);
    if (success) {
      toast.success("Commande supprimée avec succès.");
      router.push("/commandes");
    } else {
      error.value = "Erreur lors de la suppression de la commande.";
      toast.error("Erreur lors de la suppression de la commande.");
    }
  } catch (e: any) {
    error.value = e.message || "Erreur lors de la suppression de la commande.";
    toast.error(error.value);
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
}

/**
 * Fetches the order details by ID from the route parameters.
 */
async function fetchOrder() {
  loading.value = true;
  error.value = "";
  orderedProductsDetails.value = [];
  try {
    const id = Number(route.params.id);
    if (!id) throw new Error("ID invalide");
    const service = new OrderService();
    const details = await service.getOrderByIdWithDetails(id);
    if (!details) {
      error.value = "Commande non trouvée.";
      order.value = null;
      client.value = null;
      orderedProductsDetails.value = [];
      return;
    }
    order.value = details.order;
    client.value = details.client || null;
    orderedProductsDetails.value = details.orderedProducts || [];
    calculateTotal();
  } catch (e: any) {
    error.value = e.message || "Erreur lors du chargement de la commande.";
    order.value = null;
    client.value = null;
    orderedProductsDetails.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchOrder);
</script>

<template>
  <div class="p-6 flex flex-col items-center min-h-[60vh]">
    <router-link to="/commandes" class="btn btn-ghost btn-sm self-start text-xl mb-4"
      ><span class="mr-2">←</span> Retour à la liste</router-link
    >
    <div v-if="loading" class="mt-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="error" class="alert alert-error shadow-lg mt-8 w-full max-w-xl">
      <span>{{ error }}</span>
    </div>
    <div v-else-if="order" class="card w-full max-w-xl bg-base-100 shadow-xl mt-8">
      <div class="card-body">
        <h1 class="card-title text-2xl mb-4">Détail de la commande</h1>
        <ul class="space-y-2">
          <li class="flex justify-between">
            <span class="font-semibold">ID :</span> <span>{{ order.id }}</span>
          </li>
          <li class="flex justify-between">
            <span class="font-semibold">Date :</span>
            <span>{{ new Date(order.date).toLocaleDateString() }}</span>
          </li>
          <li class="flex justify-between">
            <span class="font-semibold">Statut :</span> <span>{{ order.state }}</span>
          </li>
          <li class="flex justify-between">
            <span class="font-semibold">Client :</span>
            <span>{{
              client ? client.firstname + " " + client.lastname : "Client inconnu"
            }}</span>
          </li>
          <li class="flex justify-between items-start">
            <span class="font-semibold">Adresse livraison :</span>
            <span
              class="ml-2 whitespace-pre-line break-words bg-base-200 rounded p-2 w-2/3 text-left"
              style="word-break: break-word"
            >
              {{
                order.deliveryAddress
                  ? order.deliveryAddress.street +
                    ", " +
                    order.deliveryAddress.city +
                    " " +
                    order.deliveryAddress.postalCode
                  : "Non renseignée"
              }}
            </span>
          </li>
          <li class="flex justify-between items-start">
            <span class="font-semibold">Adresse facturation :</span>
            <span
              class="ml-2 whitespace-pre-line break-words bg-base-200 rounded p-2 w-2/3 text-left"
              style="word-break: break-word"
            >
              {{
                order.billingAddress
                  ? order.billingAddress.street +
                    ", " +
                    order.billingAddress.city +
                    " " +
                    order.billingAddress.postalCode
                  : "Non renseignée"
              }}
            </span>
          </li>
          <li class="flex flex-col">
            <span class="font-semibold mb-1">Produits commandés :</span>
            <ul class="list-disc ml-6">
              <li v-for="prod in orderedProductsDetails" :key="prod.product.id">
                <div>
                  <span class="font-bold">{{ prod.product.name }}</span> (x{{
                    prod.quantity
                  }})<br />
                  <span>{{ prod.product.description }}</span
                  ><br />
                  <span>Prix : {{ prod.product.price }} €</span>
                </div>
              </li>
            </ul>
          </li>
          <li class="flex justify-between mt-4">
            <span class="font-semibold">Total de la commande :</span>
            <span class="text-lg font-bold">{{ total.toFixed(2) }} €</span>
          </li>
        </ul>
      </div>
      <div class="card-actions justify-center pb-4">
        <router-link :to="{ name: 'order-edit', params: { id: order.id } }" class="btn btn-primary">Modifier</router-link>
        <button class="btn btn-error ml-2" @click="showDeleteModal = true">Supprimer</button>
      </div>
    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h2 class="text-xl font-bold mb-4">Confirmer la suppression</h2>
        <p class="mb-6">Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.</p>
        <div class="flex justify-end space-x-2">
          <button class="btn btn-ghost" @click="showDeleteModal = false" :disabled="deleting">Annuler</button>
          <button class="btn btn-error" @click="handleDelete" :disabled="deleting">
            <span v-if="deleting" class="loading loading-spinner loading-xs"></span>
            <span v-else>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
