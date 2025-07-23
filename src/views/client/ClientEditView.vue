<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ClientService } from '@/services/ClientService'
import ClientForm from '@/components/form/ClientForm.vue'

const route = useRoute()
const router = useRouter()
const client = ref<any>(null)

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) return router.push('/clients')
  const service = new ClientService()
  try {
    client.value = await service.getClientById(id)
  } catch (e) {
    alert('Erreur lors du chargement du client : ' + e)
    router.push('/clients')
  }
})

async function handleSubmit(updated: any) {
  const service = new ClientService()
  try {
    await service.updateClient({ ...client.value, ...updated })
    router.push('/clients')
  } catch (e) {
    alert('Erreur lors de la modification du client')
  }
}

function handleCancel() {
  router.push('/clients')
}
</script>


<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Modifier un client</h1>
    <ClientForm
      v-if="client"
      :modelValue="client"
      :submitLabel="'Enregistrer'"
      :showCancel="true"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
    <div v-else>Chargement...</div>
  </div>
</template>