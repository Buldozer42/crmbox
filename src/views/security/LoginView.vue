<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '@/services/AuthService'

const router = useRouter();

const loginForm = ref({
  email: '',
  password: ''
});
const registerForm = ref({
  email: '',
  password: ''
});

const loginError = ref('');
const registerError = ref('');
const registerSuccess = ref(false);
const isLoginLoading = ref(false);
const isRegisterLoading = ref(false);

const handleLogin = async () => {
  loginError.value = ''
  
  // Vérification des champs requis
  if (!loginForm.value.email || !loginForm.value.password) {
    // Afficher les messages de validation
    const loginInput = document.querySelector('input[placeholder="Login"]');
    const passwordInput = document.querySelector('input[placeholder="Mot de passe"]');
    
    if (!loginForm.value.email && loginInput) {
      const hint = loginInput.nextElementSibling;
      if (hint) hint.classList.remove('hidden');
    }
    
    if (!loginForm.value.password && passwordInput) {
      const hint = passwordInput.nextElementSibling;
      if (hint) hint.classList.remove('hidden');
    }
    
    return;
  }
  
  isLoginLoading.value = true

  try {
    const success = await AuthService.login({
        email: loginForm.value.email,
        password: loginForm.value.password
    })

    if (success) {
        router.push('/')
    } else {
      loginError.value = 'Identifiants incorrects. Veuillez réessayer.'
    }
  } catch (err) {
    loginError.value = 'Une erreur est survenue. Veuillez réessayer plus tard.'
    console.error('Erreur de connexion:', err)
  } finally {
    isLoginLoading.value = false
  }
}

const handleRegister = async () => {
  registerError.value = '';
  registerSuccess.value = false;

  // Vérification des champs requis
  if (!registerForm.value.email || !registerForm.value.password) {
    const emailInput = document.querySelector('input#register-email');
    const passwordInput = document.querySelector('input#register-password');

    if (!registerForm.value.email && emailInput) {
      const hint = emailInput.nextElementSibling;
      if (hint) hint.classList.remove('hidden');
    }
    if (!registerForm.value.password && passwordInput) {
      const hint = passwordInput.nextElementSibling;
      if (hint) hint.classList.remove('hidden');
    }
    return;
  }

  isRegisterLoading.value = true;
  try {
    const success = await AuthService.register({
      email: registerForm.value.email,
      password: registerForm.value.password
    });
    if (success) {
      registerSuccess.value = true;
      registerForm.value.email = '';
      registerForm.value.password = '';
    } else {
      registerError.value = "Erreur d'inscription. Veuillez réessayer.";
    }
  } catch (e) {
    registerError.value = 'Erreur réseau.';
  } finally {
    isRegisterLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="w-full max-w-xl  p-8 space-y-8 bg-base-100 rounded-xl shadow-xl">
      <h2 class="text-2xl font-bold text-center mb-6">Connexion</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="form-control">
          <label for="email" class="label">
            <span class="label-text">Email</span>
          </label>
          <input type="email" id="email" v-model="loginForm.email" required class="input input-bordered w-full" />
        </div>
        <div class="form-control">
          <label for="password" class="label">
            <span class="label-text">Mot de passe</span>
          </label>
          <input type="password" id="password" v-model="loginForm.password" required class="input input-bordered w-full" />
        </div>
        <button type="submit" class="btn btn-primary w-full">Se connecter</button>
        <div v-if="loginError" class="alert alert-error mt-2">{{ loginError }}</div>
      </form>
      <div v-if="isLoginLoading" class="loading-message text-center">Connexion en cours...</div>

      <div class="divider">OU</div>

      <h2 class="text-2xl font-bold text-center mb-6">Inscription</h2>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="form-control">
          <label for="register-email" class="label">
            <span class="label-text">Email</span>
          </label>
          <input type="email" id="register-email" v-model="registerForm.email" required class="input input-bordered w-full" />
        </div>
        <div class="form-control">
          <label for="register-password" class="label">
            <span class="label-text">Mot de passe</span>
          </label>
          <input type="password" id="register-password" v-model="registerForm.password" required class="input input-bordered w-full" />
        </div>
        <button type="submit" class="btn btn-secondary w-full">S'inscrire</button>
        <div v-if="registerError" class="alert alert-error mt-2">{{ registerError }}</div>
        <div v-if="registerSuccess" class="alert alert-success mt-2">Inscription réussie, veuillez attendre la confirmation de votre compte avant de vous connecter.</div>
      </form>
      <div v-if="isRegisterLoading" class="loading-message text-center">Inscription en cours...</div>
    </div>
  </div>
</template>