<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AuthService from '@/services/AuthService'

// Permet de savoir si l'utilisateur est authentifié
const isAuthenticated = ref(false);


// Fonction pour vérifier l'authentification de l'utilisateur
const checkAuth = () => {
    isAuthenticated.value = AuthService.isAuthenticated();
};

// Vérifie l'authentification lors du montage du composant et écoute les changements
onMounted(() => {
  checkAuth();
  window.addEventListener('auth-changed', checkAuth);
});
onUnmounted(() => {
  window.removeEventListener('auth-changed', checkAuth);
});

</script>
<template>
    <div class="navbar bg-base-100 shadow-sm">
        <div class="navbar-start">
            <div class="dropdown">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                    <span class="material-symbols-outlined h-5 w-5">
                        menu
                    </span>
                </div>
                <ul
                    tabindex="0"
                    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                    <li>
                        <router-link class="text-xl" to="/">
                            <span>Accueil</span>
                        </router-link>
                    </li>
                    <li>
                        <router-link class="text-xl" to="/produits">
                            <span>Produits</span>
                        </router-link>
                    </li>
                    <li>
                        <router-link class="text-xl" to="/clients">
                            <span>Clients</span>
                        </router-link>
                    </li>
                    <li>
                        <router-link class="text-xl" to="/utilisateurs">
                            <span>Utilisateurs</span>
                        </router-link>
                    </li>
                    <li>
                        <router-link class="text-xl" to="/commandes">
                            <span>Commandes</span>
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
        <div class="navbar-center">
            <span class="material-symbols-outlined">
                deployed_code
            </span>
            <span class="ps-3 text-xl">CRMBox</span>
        </div>
        <div class="navbar-end">
            <router-link
                class="btn btn-ghost btn-circle"
                :to="isAuthenticated ? '/logout' : '/login'"
                :title="isAuthenticated ? 'Déconnexion' : 'Connexion'"
            >
                <span class="material-symbols-outlined">
                account_circle
                </span>
            </router-link>
        </div>
    </div>
</template>