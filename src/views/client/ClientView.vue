<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ClientService } from '@/services/ClientService'
import { OrderService } from '@/services/OrderService'
import Client from '@/models/Client'
import type Order from '@/models/Order'

const route = useRoute()
const client = ref<Client | null>(null)
const loading = ref(true)
const error = ref('')

const showDeleteModal = ref(false)
const deleting = ref(false)

const orders = ref<Order[]>([])
const ordersLoading = ref(false)

async function fetchClient() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    if (!id) throw new Error('ID invalide')
    const service = new ClientService()
    const data = await service.getClientById(id)
    client.value = data || null
    if (!data) error.value = 'Client non trouvé.'
    if (data) {
      await fetchOrdersForClient(data.id)
    }
  } catch (e: any) {
    error.value = e.message || 'Erreur lors du chargement du client.'
  } finally {
    loading.value = false
  }
}

async function fetchOrdersForClient(clientId: number) {
  ordersLoading.value = true
  try {
    const orderService = new OrderService()
    const { data } = await orderService.getOrders({ 'client.id': clientId })
    orders.value = Array.isArray(data.member) ? data.member : []
  } catch (e) {
    orders.value = []
  } finally {
    ordersLoading.value = false
  }
}

async function handleDelete() {
  if (!client.value) return
  deleting.value = true
  error.value = ''
  try {
    const service = new ClientService()
    const success = await service.deleteClient(client.value.id)
    if (success) {
      window.location.href = '/clients'
    } else {
      error.value = 'Erreur lors de la suppression du client.'
    }
  } catch (e: any) {
    error.value = e.message || 'Erreur lors de la suppression du client.'
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

onMounted(fetchClient)
</script>

<template>
  <div class="p-6 flex flex-col items-center min-h-[60vh]">
    <router-link to="/clients" class="btn btn-ghost btn-sm self-start text-xl mb-4"><span class="mr-2">←</span> Retour à la liste</router-link>
    <div v-if="loading" class="mt-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="error" class="alert alert-error shadow-lg mt-8 w-full max-w-xl ">
      <span>{{ error }}</span>
    </div>
    <div v-else-if="client" class="card w-full max-w-xl  bg-base-100 shadow-xl mt-8">
      <div class="card-body">
        <h1 class="card-title text-2xl mb-4">Détail du client</h1>
        <ul class="space-y-2">
          <li class="flex justify-between"><span class="font-semibold">ID :</span> <span>{{ client.id }}</span></li>
          <li class="flex justify-between"><span class="font-semibold">Nom :</span> <span>{{ client.lastname }}</span></li>
          <li class="flex justify-between"><span class="font-semibold">Prénom :</span> <span>{{ client.firstname }}</span></li>
          <li class="flex justify-between"><span class="font-semibold">Entreprise :</span> <span>{{ client.company || '-' }}</span></li>
          <li class="flex justify-between"><span class="font-semibold">Téléphone :</span> <span>{{ client.phone }}</span></li>
          <li class="flex justify-between items-start">
            <span class="font-semibold">Note :</span>
            <span class="ml-2 max-h-32 overflow-auto whitespace-pre-line break-words bg-base-200 rounded p-2 w-2/3 text-left" style="word-break:break-word;">{{ client.note }}</span>
          </li>
          <li class="flex justify-between items-start">
            <span class="font-semibold">Adresse de livraison :</span>
            <span class="ml-2 w-2/3 text-left">{{ client.deliveryAddress ? `${client.deliveryAddress.street}, ${client.deliveryAddress.city} ${client.deliveryAddress.postalCode}` : '-' }}</span>
          </li>
          <li class="flex justify-between items-start">
            <span class="font-semibold">Adresse de facturation :</span>
            <span class="ml-2 w-2/3 text-left">{{ client.billingAddress ? `${client.billingAddress.street}, ${client.billingAddress.city} ${client.billingAddress.postalCode}` : '-' }}</span>
          </li>
        </ul>
      </div>
      <div class="card-actions justify-center pb-4">
        <router-link :to="{ name: 'client-edit', params: { id: client.id } }" class="btn btn-primary">Modifier</router-link>
        <button class="btn btn-error ml-2" @click="showDeleteModal = true">Supprimer</button>
      </div>
    </div>

    <!-- Section historique des commandes du client -->
    <div v-if="client" class="w-full max-w-xl mt-8">
      <h2 class="text-xl font-bold mb-4">Historique des commandes</h2>
      <div v-if="ordersLoading" class="flex justify-center py-4">
        <span class="loading loading-spinner loading-md text-primary"></span>
      </div>
      <div v-else>
        <div v-if="orders.length === 0" class="text-gray-500">Aucune commande trouvée pour ce client.</div>
        <table v-else class="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Montant</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.date ? new Date(order.date).toLocaleDateString() : '-' }}</td>
              <td>{{ order.state }}</td>
                <td>{{ order.orderedProducts && Array.isArray(order.orderedProducts) ? order.orderedProducts.length + ' produits' : '-' }}</td>
              <td>
                <router-link :to="{ name: 'order-detail', params: { id: order.id } }" class="btn btn-primary btn-md px-6">Voir</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h2 class="text-xl font-bold mb-4">Confirmer la suppression</h2>
        <p class="mb-6">Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.</p>
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
</template>
