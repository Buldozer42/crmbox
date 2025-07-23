<script setup>
import { ref, onMounted } from 'vue';
import Table from '@/components/Table.vue';
import { OrderService } from '@/services/OrderService';

const orderService = new OrderService();
const orders = ref([]);
const clients = ref({});
const page = ref(1);
const itemsPerPage = ref(6);
const totalItems = ref(0);
const sortBy = ref('id');
const sortDesc = ref(false);
const search = ref('');

const columns = [
  { key: 'id', label: 'ID'},
  { key: 'date', label: 'Date'},
  { key: 'state', label: 'Statut' },
  { key: 'client', label: 'Client', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false },
];

/**
 * Récupère la liste des commandes et les clients associés.
 */
async function fetchOrders() {
  try {
    const params = {
      page: page.value,
      itemsPerPage: itemsPerPage.value
    };
    if (sortBy.value && sortBy.value !== 'client') {
      params[`order[${sortBy.value}]`] = sortDesc.value ? 'desc' : 'asc';
    }
    if (search.value) {
      params['client'] = search.value;
    }
    const { data } = await orderService.getOrders(params);
    orders.value = data['member'] || [];
    totalItems.value = data['totalItems'] || 0;
    // Récupère les clients pour chaque commande
    clients.value = {};
    await Promise.all(
      orders.value.map(async (order) => {
        try {
          const client = await orderService.getClientFromOrder(order.id);
          if (client) {
            clients.value[order.id] = client.firstname + ' ' + client.lastname;
          } else {
            clients.value[order.id] = 'Client inconnu';
          }
        } catch {
          clients.value[order.id] = 'Client inconnu';
        }
      })
    );
  } catch (e) {
    orders.value = [];
    totalItems.value = 0;
  }
}

onMounted(fetchOrders);

/**
 * Gère le changement de page dans la liste des commandes.
 * @param newPage - Le numéro de la nouvelle page à afficher.
 */
function handlePageChange(newPage) {
  page.value = newPage;
  fetchOrders();
}

/**
 * Gère le changement de tri dans la liste des commandes.
 * @param newSortBy - La nouvelle clé de tri.
 */
function handleSortBy(newSortBy) {
  sortBy.value = newSortBy;
  fetchOrders();
}

/**
 * Gère le changement de direction de tri dans la liste des commandes.
 * @param newSortDesc - La nouvelle direction de tri (ascendant ou descendant).
 */
function handleSortDesc(newSortDesc) {
  sortDesc.value = newSortDesc;
  fetchOrders();
}

/**
 * Gère la recherche dans la liste des commandes.
 * @param newSearch - La nouvelle chaîne de recherche.
 */
function handleSearch(newSearch) {
  search.value = newSearch;
  page.value = 1;
  fetchOrders();
}

/**
 * Gère l'exportation des commandes au format CSV.
 */
async function handleExport() {
  const service = new OrderService();
  try {
    const blob = await service.exportOrders();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert('Erreur lors de l\'export CSV des commandes.');
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Liste des commandes</h1>
      <div class="flex gap-2 items-center">
        <button @click="handleExport" class="btn btn-outline btn-primary btn-md">Exporter CSV</button>
        <router-link to="/commandes/creer" class="btn btn-success btn-md px-6">Ajouter une commande</router-link>
      </div>
    </div>
    <Table
      :columns="columns"
      :rows="orders.map(o => ({ ...o, actions: o.id }))"
      :page="page"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      @update:page="handlePageChange"
      @update:sortBy="handleSortBy"
      @update:sortDesc="handleSortDesc"
      @update:search="handleSearch"
    >
      <template #cell-date="{ row }">
        {{ new Date(row.date).toLocaleDateString() }}
      </template>
      <template #cell-client="{ row }">
        {{ clients[row.id] || row.client }}
      </template>
      <template #cell-actions="{ row }">
        <router-link :to="`/commandes/${row.id}`" class="btn btn-primary btn-md px-6">Voir</router-link>
      </template>
    </Table>
  </div>
</template>
