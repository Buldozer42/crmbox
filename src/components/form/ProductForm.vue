<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue'
import Product from '@/models/Product'

const props = defineProps<{
  product?: Product | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', product: Omit<Product, 'id'> | Product): void
}>()

const name = ref(props.product?.name || '')
const description = ref(props.product?.description || '')
const price = ref(props.product?.price || 0)
const stock = ref(props.product?.stock || 0)

watch(() => props.product, (newProduct) => {
  name.value = newProduct?.name || ''
  description.value = newProduct?.description || ''
  price.value = newProduct?.price || 0
  stock.value = newProduct?.stock || 0
})

function handleSubmit() {
  if (!name.value.trim() || price.value < 0 || stock.value < 0) return
  const productData = {
    name: name.value,
    description: description.value,
    price: price.value,
    stock: stock.value
  }
  if (props.product && props.product.id) {
    emit('submit', { ...productData, id: props.product.id })
  } else {
    emit('submit', productData)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 w-full max-w-xl ">
    <div>
      <label class="block font-semibold mb-1">Nom</label>
      <input v-model="name" class="input input-bordered w-full" required />
    </div>
    <div>
      <label class="block font-semibold mb-1">Description</label>
      <textarea v-model="description" class="textarea textarea-bordered w-full" required />
    </div>
    <div>
      <label class="block font-semibold mb-1">Prix (€)</label>
      <input v-model.number="price" type="number" min="0" class="input input-bordered w-full" required />
    </div>
    <div>
      <label class="block font-semibold mb-1">Stock</label>
      <input v-model.number="stock" type="number" min="0" class="input input-bordered w-full" required />
    </div>
    <button class="btn btn-primary w-full mt-4" :disabled="props.loading">
      {{ props.product ? 'Mettre à jour' : 'Créer' }} le produit
    </button>
  </form>
</template>
