<template>
  <div :class="`bg-${color}-100 rounded-lg shadow flex flex-col items-center p-4`">
    <div class="text-4xl mb-2">
      <i :class="`fas fa-${icon}`"></i>
    </div>
    <div class="text-2xl font-bold">{{ value }}</div>
    <div class="text-sm text-gray-600 mt-1">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; icon: string; value: number; color: string }>();
</script>

<style scoped>
</style>
