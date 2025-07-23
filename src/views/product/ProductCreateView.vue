<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ProductService } from '@/services/ProductService'
import ProductForm from '@/components/form/ProductForm.vue'
import { useToast, TYPE } from "vue-toastification"

const toast = useToast()
const router = useRouter()
const loading = ref(false)
const error = ref('')

/**
 * Traite la soumission du formulaire de création de produit.
 */
async function handleSubmit(product: any) {
  loading.value = true
  error.value = ''
  try {
    const service = new ProductService()
    await service.createProduct(product)
    toast.success('Produit créé avec succès.')
    router.push({ name: 'product-list' })
  } catch (e: any) {
    error.value = e.message || 'Erreur lors de la création du produit.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 flex flex-col items-center min-h-[60vh]">
    <router-link to="/produits" class="btn btn-ghost btn-sm self-start text-xl mb-4"><span class="mr-2">←</span> Retour à la liste</router-link>
    <h1 class="text-2xl font-bold mb-6">Ajouter un produit</h1>
    <div v-if="error" class="alert alert-error shadow-lg mb-4 w-full max-w-xl ">
      <span>{{ error }}</span>
    </div>
    <ProductForm :loading="loading" @submit="handleSubmit" />
  </div>
</template>
