<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ClientService } from '@/services/ClientService'
import ClientForm from '@/components/form/ClientForm.vue'
import { useToast, TYPE } from "vue-toastification"

const router = useRouter()
const toast = useToast()

async function handleSubmit(client: any) {
  const service = new ClientService()
  try {
    await service.createClient(client)
    toast.success('Client créé avec succès.')
    router.push('/clients')
  } catch (e) {
    toast.error('Erreur lors de la création du client : ' + e)
  }
}

function handleCancel() {
  router.push('/clients')
}
</script>

<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Créer un client</h1>
    <ClientForm :submitLabel="'Créer'" :showCancel="true" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>