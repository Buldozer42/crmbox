<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-base-200">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <h1 class="text-5xl font-bold text-error mb-4">404</h1>
        <p class="mb-4">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <router-link to="/" class="btn btn-primary">Retour à l'accueil</router-link>
      </div>
    </div>
  </div>
</template>