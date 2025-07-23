<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue'
import type Order from '@/models/Order'
import type Client from '@/models/Client'
import type Product from '@/models/Product'

const props = defineProps<{
  order?: Order | null
  clients: Client[]
  products: Product[]
  loading?: boolean
}>()

type OrderFormPayload = {
  id?: number;
  client: string;
  orderedProducts: Array<{ product: string; quantity: number }>;
  date: string;
  state: string;
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: number;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    postalCode: number;
    country: string;
  };
};

const emit = defineEmits<{
  (e: 'submit', order: OrderFormPayload): void
}>()

const clientId = ref(props.order?.client ? (typeof props.order.client === 'string' ? Number(props.order.client.match(/\/(\d+)$/)?.[1]) : props.order.client) : '')
const orderedProducts = ref<Array<{ productId: number, quantity: number }>>(
  props.order?.orderedProducts?.map((item: any) => ({
    productId: typeof item.product === 'string' ? Number(item.product.match(/\/(\d+)$/)?.[1]) : item.product,
    quantity: item.quantity
  })) || []
)
const date = ref(props.order?.date || '')
const state = ref(props.order?.state || '')
const deliveryStreet = ref(props.order?.deliveryAddress?.street || '')
const deliveryCity = ref(props.order?.deliveryAddress?.city || '')
const deliveryPostalCode = ref(props.order?.deliveryAddress?.postalCode || '')
const deliveryCountry = ref(props.order?.deliveryAddress?.country || '')

const billingStreet = ref(props.order?.billingAddress?.street || '')
const billingCity = ref(props.order?.billingAddress?.city || '')
const billingPostalCode = ref(props.order?.billingAddress?.postalCode || '')
const billingCountry = ref(props.order?.billingAddress?.country || '')

watch(() => props.order, (newOrder) => {
  clientId.value = newOrder?.client ? (typeof newOrder.client === 'string' ? Number(newOrder.client.match(/\/(\d+)$/)?.[1]) : newOrder.client) : ''
  orderedProducts.value = newOrder?.orderedProducts?.map((item: any) => ({
    productId: typeof item.product === 'string' ? Number(item.product.match(/\/(\d+)$/)?.[1]) : item.product,
    quantity: item.quantity
  })) || []
  date.value = newOrder?.date || ''
  state.value = newOrder?.state || ''
  deliveryStreet.value = newOrder?.deliveryAddress?.street || ''
  deliveryCity.value = newOrder?.deliveryAddress?.city || ''
  deliveryPostalCode.value = newOrder?.deliveryAddress?.postalCode || ''
  deliveryCountry.value = newOrder?.deliveryAddress?.country || ''
  billingStreet.value = newOrder?.billingAddress?.street || ''
  billingCity.value = newOrder?.billingAddress?.city || ''
  billingPostalCode.value = newOrder?.billingAddress?.postalCode || ''
  billingCountry.value = newOrder?.billingAddress?.country || ''
})

function addProduct() {
  orderedProducts.value.push({ productId: props.products[0]?.id || 0, quantity: 1 })
}

function removeProduct(index: number) {
  orderedProducts.value.splice(index, 1)
}

function handleSubmit() {
  if (!clientId.value || orderedProducts.value.length === 0) return
  if (!deliveryStreet.value.trim() || !billingStreet.value.trim()) return

  // On émet les données brutes pour que la vue parent gère la création des orderedProducts
  const orderData = {
    clientId: clientId.value,
    orderedProducts: orderedProducts.value.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })),
    date: date.value ? new Date(date.value).toISOString() : new Date().toISOString(),
    state: state.value,
    deliveryAddress: {
      street: deliveryStreet.value,
      city: deliveryCity.value,
      postalCode: Number(deliveryPostalCode.value),
      country: deliveryCountry.value
    },
    billingAddress: {
      street: billingStreet.value,
      city: billingCity.value,
      postalCode: Number(billingPostalCode.value),
      country: billingCountry.value
    }
  }
  if (props.order && props.order.id) {
    emit('submit', { ...orderData, id: props.order.id })
  } else {
    emit('submit', orderData)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 w-full max-w-xl ">
    <div>
      <label class="block font-semibold mb-1">Client</label>
      <select v-model="clientId" class="select select-bordered w-full" required>
        <option value="" disabled>Sélectionner un client</option>
        <option v-for="client in props.clients" :key="client.id" :value="client.id">
          {{ client.firstname }} {{ client.lastname }}
        </option>
      </select>
    </div>
    <div>
      <label class="block font-semibold mb-1">Produits commandés</label>
      <div v-for="(item, index) in orderedProducts" :key="index" class="flex gap-2 mb-2">
        <select v-model="item.productId" class="select select-bordered">
          <option v-for="product in props.products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
        <input v-model.number="item.quantity" type="number" min="1" class="input input-bordered w-24" required />
        <button type="button" class="btn btn-error btn-sm" @click="removeProduct(index)">Supprimer</button>
      </div>
      <button type="button" class="btn btn-secondary btn-sm mt-2" @click="addProduct">Ajouter un produit</button>
    </div>
    <div>
      <label class="block font-semibold mb-1">Date</label>
      <input v-model="date" type="date" class="input input-bordered w-full" required />
    </div>
    <div>
      <label class="block font-semibold mb-1">Statut</label>
      <select v-model="state" class="select select-bordered w-full" required>
        <option value="" disabled>Sélectionner un statut</option>
        <option value="ongoing">En cours</option>
        <option value="cancel">Annulée</option>
        <option value="done">Terminée</option>
      </select>
    </div>
    <div>
      <label class="block font-semibold mb-1">Adresse de livraison</label>
      <input v-model="deliveryStreet" class="input input-bordered w-full mb-1" placeholder="Rue" required />
      <input v-model="deliveryCity" class="input input-bordered w-full mb-1" placeholder="Ville" required />
      <input v-model="deliveryPostalCode" class="input input-bordered w-full mb-1" placeholder="Code postal" required />
      <input v-model="deliveryCountry" class="input input-bordered w-full" placeholder="Pays" required />
    </div>
    <div>
      <label class="block font-semibold mb-1">Adresse de facturation</label>
      <input v-model="billingStreet" class="input input-bordered w-full mb-1" placeholder="Rue" required />
      <input v-model="billingCity" class="input input-bordered w-full mb-1" placeholder="Ville" required />
      <input v-model="billingPostalCode" class="input input-bordered w-full mb-1" placeholder="Code postal" required />
      <input v-model="billingCountry" class="input input-bordered w-full" placeholder="Pays" required />
    </div>
    <button class="btn btn-primary w-full mt-4" :disabled="props.loading">
      {{ props.order ? 'Mettre à jour' : 'Créer' }} la commande
    </button>
  </form>
</template>
