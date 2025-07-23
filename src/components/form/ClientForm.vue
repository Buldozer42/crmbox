<script setup lang="ts">
import { reactive, watch, toRefs } from "vue";
import type Client from "@/models/Client";

// Définition des props
const props = defineProps<{
  modelValue?: Partial<Client>;
  submitLabel?: string;
  showCancel?: boolean;
}>();

// Définition des émetteurs pour les événements
const emit = defineEmits(["update:modelValue", "submit", "cancel"]);

// Formulaire réactif
const defaultAddress = () => ({ street: "", city: "", postalCode: "", country: "" });
const form = reactive({
  lastname: "",
  firstname: "",
  company: "",
  phone: "",
  note: "",
  deliveryAddress: defaultAddress(),
  billingAddress: defaultAddress(),
});

// Watcher pour mettre à jour le modèle de valeur
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      Object.assign(form, {
        lastname: val.lastname || "",
        firstname: val.firstname || "",
        company: val.company || "",
        phone: val.phone || "",
        note: val.note || "",
        deliveryAddress: val.deliveryAddress
          ? { ...val.deliveryAddress }
          : defaultAddress(),
        billingAddress: val.billingAddress ? { ...val.billingAddress } : defaultAddress(),
      });
    }
  },
  { immediate: true }
);

function onSubmit() {
  emit("submit", { ...form });
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <div class="flex gap-4">
      <div class="flex-1">
        <label class="block font-semibold">Nom *</label>
        <input
          v-model="form.lastname"
          type="text"
          class="input input-bordered w-full uppercase"
          required
        />
      </div>
      <div class="flex-1">
        <label class="block font-semibold">Prénom *</label>
        <input
          v-model="form.firstname"
          type="text"
          class="input input-bordered w-full"
          required
        />
      </div>
    </div>
    <div>
      <label class="block font-semibold">Entreprise</label>
      <input v-model="form.company" type="text" class="input input-bordered w-full" />
    </div>
    <div>
      <label class="block font-semibold">Téléphone *</label>
      <input
        v-model="form.phone"
        type="text"
        class="input input-bordered w-full"
        required
      />
    </div>
    <div>
      <label class="block font-semibold">Note</label>
      <textarea
        v-model="form.note"
        class="input input-bordered w-full"
        rows="2"
      ></textarea>
    </div>
    <div class="flex gap-4">
      <div class="flex-1">
        <label class="block font-semibold">Adresse de livraison *</label>
        <input
          v-model="form.deliveryAddress.street"
          type="text"
          class="input input-bordered w-full mb-2"
          placeholder="Rue"
          required
        />
        <input
          v-model="form.deliveryAddress.city"
          type="text"
          class="input input-bordered w-full mb-2"
          placeholder="Ville"
          required
        />
        <input
          v-model="form.deliveryAddress.postalCode"
          type="number"
          class="input input-bordered w-full mb-2"
          placeholder="Code postal"
          required
        />
        <input
          v-model="form.deliveryAddress.country"
          type="text"
          class="input input-bordered w-full"
          placeholder="Pays"
          required
        />
      </div>
      <div class="flex-1">
        <label class="block font-semibold">Adresse de facturation *</label>
        <input
          v-model="form.billingAddress.street"
          type="text"
          class="input input-bordered w-full mb-2"
          placeholder="Rue"
          required
        />
        <input
          v-model="form.billingAddress.city"
          type="text"
          class="input input-bordered w-full mb-2"
          placeholder="Ville"
          required
        />
        <input
          v-model="form.billingAddress.postalCode"
          type="number"
          class="input input-bordered w-full mb-2"
          placeholder="Code postal"
          required
        />
        <input
          v-model="form.billingAddress.country"
          type="text"
          class="input input-bordered w-full"
          placeholder="Pays"
          required
        />
      </div>
    </div>
    <div class="flex justify-end gap-2">
      <button type="submit" class="btn btn-primary">{{ submitLabel }}</button>
      <button
        v-if="showCancel"
        type="button"
        class="btn btn-secondary"
        @click="$emit('cancel')"
      >
        Annuler
      </button>
    </div>
  </form>
</template>
