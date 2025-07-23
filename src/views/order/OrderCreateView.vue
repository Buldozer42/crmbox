<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { OrderService } from '@/services/OrderService'
import { ClientService } from '@/services/ClientService'
import { ProductService } from '@/services/ProductService'
import OrderForm from '@/components/form/OrderForm.vue'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const clients = ref([])
const products = ref([])

onMounted(async () => {
  loading.value = true
  try {
    const clientService = new ClientService()
    const productService = new ProductService()
    clients.value = (await clientService.getClients()).data.member
    products.value = (await productService.getProducts()).data.member
  } catch (e: any) {
    error.value = e.message || 'Erreur lors du chargement des données.'
  } finally {
    loading.value = false
  }
})

async function handleSubmit(order: any) {
  loading.value = true
  error.value = ''
  try {
    const service = new OrderService()
    // Création des orderedProducts
    const orderedProductUrls: string[] = []
    for (const item of order.orderedProducts) {
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

    // Création de la commande avec les URLs des orderedProducts
    const orderPayload: any = {
      client: `/api/clients/${order.clientId}`,
      orderedProducts: orderedProductUrls,
      date: order.date,
      state: order.state,
      deliveryAddress: {
        street: order.deliveryAddress.street,
        city: order.deliveryAddress.city,
        postalCode: order.deliveryAddress.postalCode,
        country: order.deliveryAddress.country
      },
      billingAddress: {
        street: order.billingAddress.street,
        city: order.billingAddress.city,
        postalCode: order.billingAddress.postalCode,
        country: order.billingAddress.country
      }
    }
    if (order.id) orderPayload.id = order.id
    await service.createOrder(orderPayload)
    router.push({ name: 'order-list' })
  } catch (e: any) {
    error.value = e.message || 'Erreur lors de la création de la commande.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 flex flex-col items-center min-h-[60vh]">
    <router-link to="/commandes" class="btn btn-ghost btn-sm self-start text-xl mb-4"><span class="mr-2">←</span> Retour à la liste</router-link>
    <h1 class="text-2xl font-bold mb-6">Ajouter une commande</h1>
    <div v-if="error" class="alert alert-error shadow-lg mb-4 w-full max-w-xl ">
      <span>{{ error }}</span>
    </div>
    <OrderForm :clients="clients" :products="products" :loading="loading" @submit="handleSubmit" />
  </div>
</template>
