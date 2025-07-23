<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ProductService } from '@/services/ProductService'
import ProductForm from '@/components/form/ProductForm.vue'
import Product from '@/models/Product'
import { useToast, TYPE } from "vue-toastification"

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const product = ref<Product | null>(null)
const toast = useToast()

/**
 * Charge les détails du produit par ID depuis les paramètres de la route.
 */
async function fetchProduct() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    if (!id) throw new Error('ID invalide')
    const service = new ProductService()
    const data = await service.getProductById(id)
    if (!data) throw new Error('Produit non trouvé.')
    product.value = data
  } catch (e: any) {
    error.value = e.message || 'Erreur lors du chargement du produit.'
  } finally {
    loading.value = false
  }
}

/**
 * Traite la soumission du formulaire de modification de produit.
 * 
 * @param updatedProduct - Le produit mis à jour à soumettre.
 */
async function handleSubmit(updatedProduct: Product | Omit<Product, "id">) {
  loading.value = true
  error.value = ''
  try {
    const service = new ProductService()
    // Assure que l'id existe, sinon utilise celui du produit chargé
    const productId = (updatedProduct as Product).id ?? product.value?.id
    if (!productId) throw new Error('ID du produit manquant.')
    await service.updateProduct({ ...updatedProduct, id: productId } as Product)
    toast.success('Produit modifié avec succès.')
    router.push({ name: 'product-detail', params: { id: productId } })
  } catch (e: any) {
    error.value = e.message || 'Erreur lors de la modification du produit.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProduct)
</script>

<template>
  <div class="p-6 flex flex-col items-center min-h-[60vh]">
    <router-link to="/produits" class="btn btn-ghost btn-sm self-start text-xl mb-4"><span class="mr-2">←</span> Retour à la liste</router-link>
    <h1 class="text-2xl font-bold mb-6">Modifier le produit</h1>
    <div v-if="loading" class="mt-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="error" class="alert alert-error shadow-lg mb-4 w-full max-w-xl ">
      <span>{{ error }}</span>
    </div>
    <ProductForm v-else :product="product" :loading="loading" @submit="handleSubmit" />
  </div>
</template>
