<script setup lang="ts">
import StatsCard from '@/components/StatsCard.vue';
import DashboardChart from '@/components/DashboardChart.vue';

import { ref, onMounted } from 'vue';
import { ClientService } from '@/services/ClientService';
import { OrderService } from '@/services/OrderService';
import { ProductService } from '@/services/ProductService';
import { UserService } from '@/services/UserService';

const clientService = new ClientService();
const orderService = new OrderService();
const productService = new ProductService();
const userService = new UserService();

const clientCount = ref<number>(0);
const orderCount = ref<number>(0);
const productCount = ref<number>(0);
const userCount = ref<number>(0);

const globalRevenue = ref<number>(0);
const yearlyRevenue = ref<Record<string, number>>({});

/**
 * Récupère le chiffre d'affaires global et par année.
 */
async function fetchRevenue() {
  const ordersWithDetails = await orderService.getOrdersWithDetails();
  let total = 0;
  const byYear: Record<string, number> = {};
  for (const { order, orderedProducts } of ordersWithDetails) {
    let amount = 0;
    for (const item of orderedProducts) {
      if (item.product && typeof item.product.price === 'number' && typeof item.quantity === 'number') {
        amount += item.product.price * item.quantity;
      }
    }
    total += amount;
    const year = order.date ? new Date(order.date).getFullYear().toString() : 'N/A';
    if (!byYear[year]) byYear[year] = 0;
    byYear[year] += amount;
  }
  globalRevenue.value = total;
  yearlyRevenue.value = byYear;
}

onMounted(async () => {
  clientCount.value = await clientService.countClients();
  orderCount.value = await orderService.countOrders();
  productCount.value = await productService.countProducts();
  userCount.value = await userService.countUsers();
  await fetchRevenue();
});
</script>

<template>
  <main class="min-h-screen bg-gray-50 p-8">
    <h1 class="text-3xl font-bold mb-8 text-center">Dashboard</h1>
    <section class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <StatsCard title="Clients" icon="users" :value="clientCount" color="blue" />
      <StatsCard title="Commandes" icon="shopping-cart" :value="orderCount" color="green" />
      <StatsCard title="Produits" icon="box" :value="productCount" color="purple" />
      <StatsCard title="Utilisateurs" icon="user" :value="userCount" color="orange" />
    </section>
    <section class="bg-white rounded-lg shadow flex flex-row items-center justify-center p-6 mb-10 gap-8">
      <div class="flex flex-col items-center justify-center">
        <div class="text-lg font-semibold mb-2">Chiffre d'affaires global</div>
        <div class="text-2xl font-bold text-green-600 mb-2">{{ globalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</div>
      </div>
      <div class="flex flex-row items-center gap-6">
        <div v-for="(amount, year) in yearlyRevenue" :key="year" class="flex flex-col items-center justify-center text-sm">
          <span class="font-medium">{{ year }}</span>
          <span>{{ amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span>
        </div>
      </div>
    </section>
    <section class="bg-white rounded-lg shadow p-6">
      <DashboardChart />
    </section>
  </main>
</template>
