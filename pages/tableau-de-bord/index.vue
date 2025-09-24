<template>
  <div class="max-w-4xl mx-auto mt-14 px-4 sm:px-6 lg:px-8 lg:mt-24">
    <h1 class="text-center text-3xl text-ra-green-600 font-bold mb-8">
      Tableau de bord de suivi des {{ config.revName }}
    </h1>
    <div v-if="!geojsons">
      Chargement ...
    </div>
    <div v-else>
      <ProgressBar :voies="geojsons" />
      <Stats :voies="geojsons" :precision="1" class="mt-8 max-w-2xl mx-auto" />
      <StatsQuality v-if="displayQuality()" class="mt-8 max-w-2xl mx-auto" :voies="geojsons" :precision="1" />
      <Typology :voies="geojsons" class="mt-8 max-w-2xl mx-auto" />

      <div v-for="voie in geojsons" :key="getLine(voie)" class="py-2 my-8 flex">
        <div class="mr-4 w-2 lg:w-4 rounded-lg" :style="`background: ${getLineColor(getLine(voie))}`" />
        <div class="max-w-2xl mx-auto flex-grow">
          <h2 class="text-center text-2xl font-bold">
            <LineLink :line="String(getLine(voie))" />
          </h2>
          <h2  class="text-center text-xl text-gray-900">
            {{ getLineTitle(voie) }}
          </h2>
          <div class="text-center text-l text-gray-900">
            Distance totale prévue : <span class="font-bold" :style="`color: ${getLineColor(getLine(voie))}`">
              {{ displayDistanceInKm(getTotalDistance([voie]), 1) }}
            </span>
          </div>
          <div>
            <ProgressBar :voies="[voie]" />
            <Stats :voies="[voie]" :precision="1" class="mt-8" />
            <StatsQuality v-if="displayQuality()" :voies="[voie]" :precision="1" />
            <Typology :voies="[voie]" class="mt-8 max-w-2xl mx-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Collections } from '@nuxt/content';
import config from '../../config.json';
import { isLineStringFeature } from '~/types';


const { getLineColor } = useColors();
const { getTotalDistance, displayDistanceInKm } = useStats();
const { displayQuality } = useConfig();

const { data: geojsons } = await useAsyncData(async () => {
  const allFiles = await queryCollection('voiesCyclablesGeojson').all();
  return allFiles.sort((a, b) => {
    const numA = parseInt(a.title.replace('Ligne ', ''), 10);
    const numB = parseInt(b.title.replace('Ligne ', ''), 10);
    return numA - numB;
  });
});

const { data: mds } = await useAsyncData(() => {
  return queryCollection('voiesCyclablesPage').all();
});

function getLine(geojson: Collections['voiesCyclablesGeojson']): number {
  const lineStringFeature = geojson.features.find(isLineStringFeature);
  return lineStringFeature?.properties.line as number;
}

function getLineTitle(geojson: Collections['voiesCyclablesGeojson']): string {
  const line = getLine(geojson);
  const lineProp = mds.value?.find((md) => md.line === line)
  return lineProp?.from + " -> " + lineProp?.to as string;
}

function getTrafic(geojson: Collections['voiesCyclablesGeojson']): string {
  const line = getLine(geojson);
  const trafic = mds.value?.find((md) => md.line === line)?.trafic;
  return trafic || 'Inconnu';
}

const description = `Tableau de bord de suivi du ${config.revName} en temps réel.`;
useHead({
  title: `Tableau de bord de suivi du ${config.revName}`,
  meta: [
    { key: 'description', name: 'description', content: description },
    { key: 'og:description', property: 'og:description', content: description },
    { key: 'twitter:description', name: 'twitter:description', content: description }
  ]
});
</script>
