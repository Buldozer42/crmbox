<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { OrderService } from '@/services/OrderService';
import { UserService } from '@/services/UserService';
Chart.register(...registerables);

const chartRef = ref<HTMLCanvasElement | null>(null);
const userPieRef = ref<HTMLCanvasElement | null>(null);
const clientSalesRef = ref<HTMLCanvasElement | null>(null);
const orderService = new OrderService();
const userService = new UserService();
const selectedYear = ref<number>(new Date().getFullYear());
const years = ref<number[]>([]);
let chartInstance: Chart | null = null;
let userPieInstance: Chart | null = null;
let clientSalesInstance: Chart | null = null;

async function getSalesByMonth() {
  // Récupère toutes les commandes
  const { data } = await orderService.getOrders();
  const orders = data["member"] || [];
  // Récupère toutes les années présentes dans les commandes
  const allYears = Array.from(new Set(orders.map((order: any) => Number(new Date(order.date).getFullYear())))).sort((a, b) => (a as number) - (b as number)).reverse();
  years.value = allYears as number[];
  // Filtre les commandes par année sélectionnée
  const filteredOrders = orders.filter((order: any) => {
    const date = new Date(order.date);
    return date.getFullYear() === selectedYear.value;
  });
  // Initialise les tableaux des ventes par mois pour chaque état
  const doneByMonth = Array(12).fill(0);
  const ongoingByMonth = Array(12).fill(0);
  const cancelByMonth = Array(12).fill(0);
  filteredOrders.forEach((order: any) => {
    const date = new Date(order.date);
    const monthIndex = date.getMonth();
    if (order.state === 'done') {
      doneByMonth[monthIndex]++;
    } else if (order.state === 'ongoing') {
      ongoingByMonth[monthIndex]++;
    } else if (order.state === 'cancel') {
      cancelByMonth[monthIndex]++;
    }
  });
  // Labels des mois en français
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return {
    labels: months,
    doneArr: doneByMonth,
    ongoingArr: ongoingByMonth,
    cancelArr: cancelByMonth
  };
}

// Récupère le nombre de ventes par client
async function getSalesByClient() {
  const ordersWithDetails = await orderService.getOrdersWithDetails();
  // Filtre par année sélectionnée
  const filteredOrders = ordersWithDetails.filter((item: any) => {
    const date = new Date(item.order.date);
    return date.getFullYear() === selectedYear.value;
  });
  // Compte le nombre de ventes par client
  // On stocke aussi le lastname pour le tooltip
  const salesByClient: Record<string, { count: number, lastname: string }> = {};
  filteredOrders.forEach((item: any) => {
    const clientKey = item.client?.name || item.client?.id || 'Inconnu';
    const lastname = item.client?.lastname || '';
    if (!salesByClient[clientKey]) salesByClient[clientKey] = { count: 0, lastname };
    salesByClient[clientKey].count++;
  });
  const labels = Object.keys(salesByClient);
  const dataArr = labels.map(key => salesByClient[key].count);
  const lastnames = labels.map(key => salesByClient[key].lastname);
  return { labels, dataArr, lastnames };
}
async function renderChart() {
  const { labels, doneArr, ongoingArr, cancelArr } = await getSalesByMonth();
  if (chartRef.value) {
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(chartRef.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Terminées',
            data: doneArr,
            backgroundColor: 'rgba(34,197,94,0.7)', // vert
            borderColor: 'rgba(34,197,94,1)',
            borderWidth: 1,
          },
          {
            label: 'En cours',
            data: ongoingArr,
            backgroundColor: 'rgba(59,130,246,0.7)', // bleu
            borderColor: 'rgba(59,130,246,1)',
            borderWidth: 1,
          },
          {
            label: 'Annulées',
            data: cancelArr,
            backgroundColor: 'rgba(239,68,68,0.7)', // rouge
            borderColor: 'rgba(239,68,68,1)',
            borderWidth: 1,
          }
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Ventes par mois' },
        },
      },
    });
  }
}

// Affiche le graphique du nombre de ventes par client
async function renderClientSalesChart() {
  const { labels, dataArr, lastnames } = await getSalesByClient();
  if (clientSalesRef.value) {
    if (clientSalesInstance) clientSalesInstance.destroy();
    clientSalesInstance = new Chart(clientSalesRef.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Nb ventes',
            data: dataArr,
            backgroundColor: 'rgba(59,130,246,0.7)',
            borderColor: 'rgba(59,130,246,1)',
            borderWidth: 1,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Ventes par client' },
          tooltip: {
            callbacks: {
              title: (tooltipItems: any) => {
                // Affiche le lastname dans le tooltip
                const idx = tooltipItems[0].dataIndex;
                return lastnames[idx] ? `${lastnames[idx]}` : tooltipItems[0].label;
              }
            }
          }
        },
        indexAxis: 'y',
      },
    });
  }
}
async function renderUserPieChart() {
  const usersRes: { data: any } = await userService.getUsers();
  const users = usersRes.data.member || usersRes.data || [];
  // Supposons que users est un tableau d'objets avec une propriété "confirmed" (boolean)
  const confirmed = users.filter((u: any) => u.confirmed).length;
  const notConfirmed = users.length - confirmed;
  if (userPieRef.value) {
    if (userPieInstance) userPieInstance.destroy();
    userPieInstance = new Chart(userPieRef.value, {
      type: 'pie',
      data: {
        labels: ['Confirmés', 'Non confirmés'],
        datasets: [
          {
            data: [confirmed, notConfirmed],
            backgroundColor: [
              'rgba(34,197,94,0.7)', // vert
              'rgba(239,68,68,0.7)'  // rouge
            ],
            borderColor: [
              'rgba(34,197,94,1)',
              'rgba(239,68,68,1)'
            ],
            borderWidth: 1,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Utilisateurs confirmés / non confirmés' },
        },
      },
    });
  }
}

onMounted(() => {
  renderChart();
  renderUserPieChart();
  renderClientSalesChart();
});
watch(selectedYear, renderChart);
watch(selectedYear, renderClientSalesChart);
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Statistiques des ventes</h2>
    <div class="mb-4">
      <label for="year-select" class="mr-2">Année :</label>
      <select id="year-select" v-model="selectedYear" class="border rounded px-2 py-4²">
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
    </div>
    <div class="h-64 bg-gray-100 rounded flex items-center justify-center">
      <canvas ref="chartRef" class="w-full h-full"></canvas>
    </div>
    <h2 class="text-xl font-semibold mb-4 mt-8">Ventes par client</h2>
    <div class="h-64 bg-gray-100 rounded flex items-center justify-center mb-4">
      <canvas ref="clientSalesRef" class="w-full h-full"></canvas>
    </div>
    <h2 class="text-xl font-semibold mb-4">Statistiques des utilisateurs</h2>
    <div class="h-64 bg-gray-100 rounded flex items-center justify-center mt-4 px-2 py-4">
      <canvas ref="userPieRef" class="w-full h-full"></canvas>
    </div>
  </div>
</template>