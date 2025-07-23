import { createRouter, createWebHistory } from 'vue-router'
import AuthService from '@/services/AuthService'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/security/LoginView.vue'
import ProductListView from '@/views/product/ProductListView.vue'
import ProductView from '@/views/product/ProductView.vue'
import ProductCreateView from '@/views/product/ProductCreateView.vue'
import ProductEditView from '@/views/product/ProductEditView.vue'
import UserListView from '@/views/security/UserListView.vue'
import ClientListView from '@/views/client/ClientListView.vue'
import ClientView from '@/views/client/ClientView.vue'
import ClientCreateView from '@/views/client/ClientCreateView.vue'
import ClientEditView from '@/views/client/ClientEditView.vue'
import OrderListView from '@/views/order/OrderListView.vue'
import OrderView from '@/views/order/OrderView.vue'
import OrdeCreatelView from '@/views/order/OrderCreateView.vue'
import OrderEditView from '@/views/order/OrderEditView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/produits',
      name: 'product-list',
      component: ProductListView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/produits/:id',
      name: 'product-detail',
      component: ProductView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/produits/creer',
      name: 'product-create',
      component: ProductCreateView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/produits/:id/editer',
      name: 'product-edit',
      component: ProductEditView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/clients',
      name: 'client-list',
      component: ClientListView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/clients/creer',
      name: 'client-create',
      component: ClientCreateView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/clients/:id/editer',
      name: 'client-edit',
      component: ClientEditView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/clients/:id',
      name: 'client-detail',
      component: ClientView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/utilisateurs',
      name: 'user-list',
      component: UserListView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/commandes',
      name: 'order-list',
      component: OrderListView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/commandes/:id',
      name: 'order-detail',
      component: OrderView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/commandes/creer',
      name: 'order-create',
      component: OrdeCreatelView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path : '/commandes/:id/editer',
      name: 'order-edit',
      component: OrderEditView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path : '/logout',
      name: 'logout',
      component: LoginView,
      beforeEnter: (_to, _from, next) => {
        AuthService.logout();
        next({ name: 'login' });
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    }
  ],
})

// Navigation guard : contrôle l'accès aux routes
router.beforeEach((to, from, next) => {
  // Vérifie si la route nécessite une authentification
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Vérifie si l'utilisateur est authentifié
    if (!AuthService.isAuthenticated()) {
      // Si non authentifié, rediriger vers la page de connexion
      next({
        path: '/login',
        // Stocker la route voulue pour rediriger après connexion
        query: { redirect: to.fullPath }
      })
    }
  }
  if (to.matched.some(record => record.meta.requireRoles)) {
    // Vérifie si la route nécessite des rôles spécifiques
    const requiredRoles = to.meta.requireRoles as string[];
    const userRoles = AuthService.getRoles(); // Récupère les rôles de l'utilisateur

    // Rediriger si aucun rôle ou aucun rôle requis n'est présent dans ceux de l'utilisateur
    const hasRequiredRole = requiredRoles.some(role => userRoles?.includes(role));

    if (!hasRequiredRole) {
      // Si l'utilisateur n'a pas les rôles requis, rediriger vers la page d'accueil ou une page d'erreur
      return next({ name: 'home' });
    }
  }

  // Si aucune condition n'est requise, continuer vers la route demandée
  next();
})


export default router
