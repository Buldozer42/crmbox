
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Table from '@/components/Table.vue'
import { ClientService } from '@/services/ClientService'
import Client from '@/models/Client'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'lastname', label: 'Nom' },
  { key: 'firstname', label: 'Prénom' },
  { key: 'company', label: 'Entreprise' },
  { key: 'phone', label: 'Téléphone' },
  { key: 'actions', label: 'Actions' }
]


const clients = ref<{ member: Client[]; totalItems: number }>({ member: [], totalItems: 0 })
const page = ref(1)
const itemsPerPage = ref(6)
const sortBy = ref('')
const sortDesc = ref(false)
const searchLastname = ref('')


async function fetchClients() {
  const service = new ClientService()
  try {
    const params: Record<string, any> = {
      page: page.value,
      itemsPerPage: itemsPerPage.value
    }
    if (sortBy.value) {
      params[`order[${sortBy.value}]`] = sortDesc.value ? 'desc' : 'asc'
    }
    if (searchLastname.value) {
      params['lastname'] = searchLastname.value
    }
    const { data } = await service.getClients(params)
    clients.value = {
      member: data["member"] || [],
      totalItems: data["totalItems"] || 0
    }
  } catch (e) {
    clients.value = { member: [], totalItems: 0 }
  }
}

onMounted(fetchClients)

watch([page, itemsPerPage, sortBy, sortDesc, searchLastname], fetchClients, { immediate: true })

// Fonction d'export CSV
async function handleExport() {
  const service = new ClientService();
  try {
    const blob = await service.exportClients();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert('Erreur lors de l\'export CSV des clients.');
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Liste des clients</h1>
      <div class="flex gap-2 items-center">
        <button @click="handleExport" class="btn btn-outline btn-primary btn-md">Exporter CSV</button>
        <router-link to="/clients/creer" class="btn btn-success btn-md px-6">Ajouter un client</router-link>
      </div>
    </div>
    <Table
      :columns="columns"
      :rows="clients.member.map(c => ({ ...c, actions: c.id }))"
      :page="page"
      :itemsPerPage="itemsPerPage"
      :totalItems="clients.totalItems"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
      :search="searchLastname"
      searchKey="lastname"
      searchKeyLabel="Nom"
      @update:page="page = $event"
      @update:sortBy="sortBy = $event"
      @update:sortDesc="sortDesc = $event"
      @update:search="searchLastname = $event; page = 1"
    >
      <template #cell-actions="{ row }">
        <router-link :to="`/clients/${row.id}`" class="btn btn-primary btn-md px-6">Voir</router-link>
      </template>
    </Table>
  </div>
</template>
