<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OrderService } from '@/services/OrderService'
import { ClientService } from '@/services/ClientService'
import { ProductService } from '@/services/ProductService'
import OrderForm from '@/components/form/OrderForm.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const order = ref(null)
const clients = ref([])
const products = ref([])

onMounted(async () => {
  loading.value = true
  try {
    const orderService = new OrderService()
    const clientService = new ClientService()
    const productService = new ProductService()
    const orderId = Number(route.params.id)
    // Récupère la commande à modifier avec les détails produits
    const orderDetails = await orderService.getOrderByIdWithDetails(orderId)
    // Récupère la liste des clients et produits
    clients.value = (await clientService.getClients()).data.member
    products.value = (await productService.getProducts()).data.member
    if (orderDetails) {
      // Prépare le format attendu par OrderForm
      order.value = {
        ...orderDetails.order,
        client: typeof orderDetails.order.client === 'string' ? Number(orderDetails.order.client.match(/\/(\d+)$/)?.[1]) : orderDetails.order.client,
        orderedProducts: orderDetails.orderedProducts.map(item => ({
          product: item.product.id,
          quantity: item.quantity
        })),
        date: orderDetails.order.date ? orderDetails.order.date.split('T')[0] : '' // format yyyy-mm-dd
      }
    }
  } catch (e: any) {
    error.value = e.message || 'Erreur lors du chargement des données.'
  } finally {
    loading.value = false
  }
})

async function handleSubmit(orderData: any) {
  loading.value = true
  error.value = ''
  try {
    const service = new OrderService()
    // Création des orderedProducts si modifiés
    let orderedProductUrls = orderData.orderedProducts
    // Si ce sont des objets avec productId, il faut les créer
    if (orderedProductUrls.length && typeof orderedProductUrls[0] === 'object' && orderedProductUrls[0].productId) {
      orderedProductUrls = []
      for (const item of orderData.orderedProducts) {
        const response = await fetch(`${service.apiUrl}/api/ordered_products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/ld+json',
            'Authorization': `Bearer ${service.authService.getToken()}`,
          },
          body: JSON.stringify({
            product: `/api/products/${item.productId}`,
            quantity: item.quantity
          })
        })
        if (!response.ok) {
          throw new Error('Erreur lors de la création d’un produit commandé')
        }
        const data = await response.json()
        orderedProductUrls.push(`/api/ordered_products/${data.id}`)
      }
    }
    // Prépare le payload pour la modification
    const orderPayload: any = {
      id: orderData.id,
      client: `/api/clients/${orderData.clientId}`,
      orderedProducts: orderedProductUrls,
      date: orderData.date,
      state: orderData.state,
      deliveryAddress: {
        street: orderData.deliveryAddress.street,
        city: orderData.deliveryAddress.city,
        postalCode: orderData.deliveryAddress.postalCode,
        country: orderData.deliveryAddress.country
      },
      billingAddress: {
        street: orderData.billingAddress.street,
        city: orderData.billingAddress.city,
        postalCode: orderData.billingAddress.postalCode,
        country: orderData.billingAddress.country
      }
    }
    await service.updateOrder(orderPayload)
    router.push({ name: 'order-list' })
  } catch (e: any) {
    error.value = e.message || 'Erreur lors de la modification de la commande.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 flex flex-col items-center min-h-[60vh]">
    <router-link to="/commandes" class="btn btn-ghost btn-sm self-start text-xl mb-4"><span class="mr-2">←</span> Retour à la liste</router-link>
    <h1 class="text-2xl font-bold mb-6">Modifier la commande</h1>
    <div v-if="error" class="alert alert-error shadow-lg mb-4 w-full max-w-xl ">
      <span>{{ error }}</span>
    </div>
    <OrderForm :order="order" :clients="clients" :products="products" :loading="loading" @submit="handleSubmit" />
  </div>
</template>
