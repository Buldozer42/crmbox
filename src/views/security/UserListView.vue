<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Table from '@/components/Table.vue'
import { UserService } from '@/services/UserService'
import User from '@/models/User'
import { useToast } from "vue-toastification"

const toast = useToast()

const users = ref<User[]>([])
const loading = ref(true)
const error = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const sortBy = ref('id')
const sortDesc = ref(false)
const search = ref('')

const userService = new UserService()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'email', label: 'Email' },
  { key: 'confirmed', label: 'Confirmé' },
  { key: 'actions', label: 'Actions' }
]

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    const params: Record<string, any> = {
      page: page.value,
      itemsPerPage: itemsPerPage.value,
      order: sortBy.value ? (sortDesc.value ? '-' + sortBy.value : sortBy.value) : undefined
    }
    if (search.value) {
      params['email'] = search.value
    }
    const { data } = await userService.getUsers(params)
    users.value = data['member'] || []
    totalItems.value = data['totalItems'] || 0
  } catch (e: any) {
    error.value = e.message || 'Erreur lors du chargement des utilisateurs.'
  } finally {
    loading.value = false
  }
}

async function confirmUser(user: User) {
  try {
    await userService.updateUser({ ...user, confirmed: true })
    fetchUsers()
    toast.success('Utilisateur confirmé avec succès.')
  } catch (e: any) {
    error.value = e.message || 'Erreur lors de la confirmation.'
    toast.error('Erreur lors de la confirmation : ' + e.message)
  }
}


const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)

function openDeleteModal(user: User) {
  userToDelete.value = user
  showDeleteModal.value = true
}

async function confirmDeleteUser() {
  if (!userToDelete.value) return
  loading.value = true
  error.value = ''
  try {
    await userService.deleteUser(userToDelete.value.id)
    fetchUsers()
    toast.success('Utilisateur supprimé avec succès.')
  } catch (e: any) {
    error.value = e.message || 'Erreur lors de la suppression.'
    toast.error('Erreur lors de la suppression : ' + e.message)
  } finally {
    showDeleteModal.value = false
    userToDelete.value = null
    loading.value = false
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchUsers()
}

function handleSortBy(newSortBy: string) {
  if (sortBy.value === newSortBy) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = newSortBy
    sortDesc.value = false
  }
  fetchUsers()
}

function handleSearch(newSearch: string) {
  search.value = newSearch
  page.value = 1
  fetchUsers()
}

import { watch } from 'vue'
onMounted(fetchUsers)
watch([page, itemsPerPage, sortBy, sortDesc, search], fetchUsers)

// Fonction d'export CSV
async function handleExport() {
  const service = new UserService();
  try {
    const blob = await service.exportUsers();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert('Erreur lors de l\'export CSV des utilisateurs.');
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Utilisateurs</h1>
      <button @click="handleExport" class="btn btn-outline btn-primary btn-md">Exporter CSV</button>
    </div>
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    <div v-else-if="error" class="alert alert-error shadow-lg mb-4">
      <span>{{ error }}</span>
    </div>
    <Table
      :columns="columns"
      :rows="users"
      :page="page"
      :itemsPerPage="itemsPerPage"
      :totalItems="totalItems"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
      :search="search"
      searchKey="email"
      searchKeyLabel="Email"
      @update:page="handlePageChange"
      @update:sortBy="handleSortBy"
      @update:sortDesc="(val: boolean) => { sortDesc = val; fetchUsers() }"
      @update:search="handleSearch"
    >
      <template #cell-confirmed="{ row }">
        <span :class="row.confirmed ? 'text-green-600' : 'text-red-600'">
          {{ row.confirmed ? 'Oui' : 'Non' }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <button
          v-if="!row.confirmed"
          class="btn btn-xs btn-success mr-2"
          @click="confirmUser(row)"
        >Confirmer</button>
        <button
          class="btn btn-xs btn-error"
          @click="openDeleteModal(row)"
        >Supprimer</button>
      </template>
    </Table>
    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h2 class="text-xl font-bold mb-4">Confirmer la suppression</h2>
        <p class="mb-6">Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
        <div class="flex justify-end space-x-2">
          <button class="btn btn-ghost" @click="showDeleteModal = false" :disabled="loading">Annuler</button>
          <button class="btn btn-error" @click="confirmDeleteUser" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            <span v-else>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-spinner {
  width: 2rem;
  height: 2rem;
}
</style>
