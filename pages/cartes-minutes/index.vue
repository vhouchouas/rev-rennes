<template>
  <div class="bg-white pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
    <div class="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
      <div>
        <h2 class="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
          Cartes Minutes
        </h2>
        <p class="mt-3 text-xl text-gray-500 sm:mt-4">
          💡📐 Conception et réalisation : Nouvelles Aires et Neonab
        </p>
      </div>
      <div class="mt-12 grid gap-16 pt-12 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-4">
        <div v-for="site in sites" :key="site.city" class="p-4 rounded-lg hover:bg-gray-50">
          <NuxtLink :to="site.link" target="_blank">
            <div>
              <img class="h-48 lg:h-56 object-cover w-full object-center relative block bg-white rounded-lg overflow-hidden" :src="site.imageUrl">
            </div>
            <p class="text-xl font-semibold text-gray-900 mt-4">
              {{ site.title }}
            </p>
            <h4 class="text-gray-500 text-base">
              {{ site.description }}
            </h4>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: cartes-minutes } = await useAsyncData(() => {
  return queryContent('cartes-minutes')
    .sort({ index: 1 })
    .find();
});
</script>
