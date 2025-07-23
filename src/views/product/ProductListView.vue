<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Table from '@/components/Table.vue'
import { ProductService } from '@/services/ProductService'
import Product from '@/models/Product'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nom' },
  { key: 'description', label: 'Description' },
  { key: 'price', label: 'Prix' },
  { key: 'stock', label: 'Stock' },
  { key: 'actions', label: 'Actions' }
]



const products = ref<{ member: Product[]; totalItems: number }>({ member: [], totalItems: 0 })
const page = ref(1)
const itemsPerPage = ref(6)
const sortBy = ref('')
const sortDesc = ref(false)
const search = ref('')


async function fetchProducts() {
  const service = new ProductService()
  try {
    const params: Record<string, any> = {
      page: page.value,
      itemsPerPage: itemsPerPage.value
    }
    if (sortBy.value) {
      params[`order[${sortBy.value}]`] = sortDesc.value ? 'desc' : 'asc'
    }
    if (search.value) {
      params['name'] = search.value
    }
    const { data } = await service.getProducts(params)
    products.value = {
      member: data["member"] || [],
      totalItems: data["totalItems"] || 0
    }
  } catch (e) {
    products.value = { member: [], totalItems: 0 }
  }
}

onMounted(fetchProducts)

watch([page, itemsPerPage, sortBy, sortDesc, search], fetchProducts, { immediate: true })

/**
 * Traite l'export CSV des produits.
 */
async function handleExport() {
  const service = new ProductService();
  try {
    const blob = await service.exportProducts();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert('Erreur lors de l\'export CSV des produits.');
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Liste des produits</h1>
      <div class="flex gap-2 items-center">
        <button @click="handleExport" class="btn btn-outline btn-primary btn-md">Exporter CSV</button>
        <router-link to="/produits/creer" class="btn btn-success btn-md px-6">Ajouter un produit</router-link>
      </div>
    </div>
    <Table
      :columns="columns"
      :rows="products.member.map(p => ({ ...p, actions: p.id }))"
      :page="page"
      :itemsPerPage="itemsPerPage"
      :totalItems="products.totalItems"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
      :search="search"
      searchKey="name"
      searchKeyLabel="Nom"
      @update:page="page = $event"
      @update:sortBy="sortBy = $event"
      @update:sortDesc="sortDesc = $event"
      @update:search="search = $event"
    >
      <template #cell-actions="{ row }">
        <router-link :to="`/produits/${row.id}`" class="btn btn-primary btn-md px-6">Voir</router-link>
      </template>
    </Table>
  </div>
</template>