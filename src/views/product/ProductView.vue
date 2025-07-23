<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ProductService } from '@/services/ProductService'
import Product from '@/models/Product'

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(true)
const error = ref('')

const showDeleteModal = ref(false)
const deleting = ref(false)

async function fetchProduct() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    if (!id) throw new Error('ID invalide')
    const service = new ProductService()
    const data = await service.getProductById(id)
    product.value = data || null
    if (!data) error.value = 'Produit non trouvé.'
  } catch (e: any) {
    error.value = e.message || 'Erreur lors du chargement du produit.'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!product.value) return
  deleting.value = true
  error.value = ''
  try {
    const service = new ProductService()
    const success = await service.deleteProduct(product.value.id)
    if (success) {
      window.location.href = '/produits'
    } else {
      error.value = 'Erreur lors de la suppression du produit.'
    }
  } catch (e: any) {
    error.value = e.message || 'Erreur lors de la suppression du produit.'
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

onMounted(fetchProduct)
</script>

<template>
  <div class="p-6 flex flex-col items-center min-h-[60vh]">
    <router-link to="/produits" class="btn btn-ghost btn-sm self-start text-xl mb-4"><span class="mr-2">←</span> Retour à la liste</router-link>
    <div v-if="loading" class="mt-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="error" class="alert alert-error shadow-lg mt-8 w-full max-w-xl ">
      <span>{{ error }}</span>
    </div>
    <div v-else-if="product" class="card w-full max-w-xl  bg-base-100 shadow-xl mt-8">
      <div class="card-body">
        <h1 class="card-title text-2xl mb-4">Détail du produit</h1>
        <ul class="space-y-2">
          <li class="flex justify-between"><span class="font-semibold">ID :</span> <span>{{ product.id }}</span></li>
          <li class="flex justify-between"><span class="font-semibold">Nom :</span> <span>{{ product.name }}</span></li>
          <li class="flex justify-between items-start">
            <span class="font-semibold">Description :</span>
            <span class="ml-2 max-h-32 overflow-auto whitespace-pre-line break-words bg-base-200 rounded p-2 w-2/3 text-left" style="word-break:break-word;">{{ product.description }}</span>
          </li>
          <li class="flex justify-between"><span class="font-semibold">Prix :</span> <span>{{ product.price }} €</span></li>
          <li class="flex justify-between"><span class="font-semibold">Stock :</span> <span>{{ product.stock }}</span></li>
        </ul>
      </div>
      <div class="card-actions justify-center pb-4">
        <router-link :to="{ name: 'product-edit', params: { id: product.id } }" class="btn btn-primary">Modifier</router-link>
        <button class="btn btn-error ml-2" @click="showDeleteModal = true">Supprimer</button>
      </div>
    </div>
    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h2 class="text-xl font-bold mb-4">Confirmer la suppression</h2>
        <p class="mb-6">Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</p>
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
