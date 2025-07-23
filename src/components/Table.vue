<script setup>
import { defineProps, defineEmits, computed, ref, watch } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    // Exemple: [{ key: 'nom', label: 'Nom', sortable: true }, { key: 'email', label: 'Email', sortable: true }]
  },
  rows: {
    type: Array,
    required: true,
    // Exemple: [{ nom: 'Jean', email: 'jean@mail.com' }, ...]
  },
  page: {
    type: Number,
    default: 1
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  totalItems: {
    type: Number,
    default: 0
  },
  sortBy: {
    type: String,
    default: ''
  },
  sortDesc: {
    type: Boolean,
    default: false
  },
  search: {
    type: String,
    default: ''
  },
  searchKey: {
    type: String,
    default: ''
  },
  searchKeyLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:page', 'update:sortBy', 'update:sortDesc', 'update:search'])

const searchValueLocal = ref(props.search)

watch(() => props.search, (val) => {
  searchValueLocal.value = val
})

/**
 * Fonction pour mettre à jour la valeur de recherche
 */
function onSearchInput() {
  emit('update:search', searchValueLocal.value)
}

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

/**
 * Fonction pour changer de page
 * @param {number} newPage - La nouvelle page à afficher
 */
function changePage(newPage) {
  if (newPage >= 1 && newPage <= totalPages.value) {
    emit('update:page', newPage)
  }
}

/**
 * Fonction pour trier les colonnes
 * @param {string} key - La clé de la colonne à trier
 * @param {boolean} sortable - Indique si la colonne est triable
 */
function onSort(key, sortable) {
  if (!sortable) return;
  if (props.sortBy === key) {
    emit('update:sortDesc', !props.sortDesc)
  } else {
    emit('update:sortBy', key)
    emit('update:sortDesc', false)
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <div class="mb-4 ms-1 mt-1 flex justify-start">
      <input
        v-if="searchKey"
        type="text"
        class="input input-bordered w-full max-w-xs"
        :placeholder="`Rechercher par ${searchKeyLabel || searchKey}`"
        v-model="searchValueLocal"
        @input="onSearchInput"
      />
    </div>
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key"
              @click="onSort(col.key, col.sortable !== false)"
              :class="[col.sortable === false ? '' : 'cursor-pointer select-none']">
            {{ col.label }}
            <span v-if="col.sortable !== false && sortBy === col.key">
              <span v-if="sortDesc">▼</span>
              <span v-else>▲</span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="col in columns" :key="col.key">
            <slot :name="`cell-${col.key}`" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="rows.length === 0" class="text-center py-4 text-gray-400">
      Aucun résultat à afficher, essayez d'attendre un instant.
    </div>
    <div v-if="totalItems > itemsPerPage" class="flex justify-center items-center gap-2 mt-4">
      <button class="btn btn-sm" :disabled="page === 1" @click="changePage(page - 1)">Précédent</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button class="btn btn-sm" :disabled="page === totalPages" @click="changePage(page + 1)">Suivant</button>
    </div>
  </div>
</template>