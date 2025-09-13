import type { Collections } from '@nuxt/content';
import { groupBy } from '../helpers/helpers';
import { isLineStringFeature, type LaneType, type LaneQuality, isDangerFeature } from '../types';

export const useStats = () => {
  function getAllUniqLineStrings(voies: Collections['voiesCyclablesGeojson'][]) {
    return voies
      .map(voie => voie.features)
      .flat()
      .filter(isLineStringFeature)
      .filter((feature, index, sections) => {
        if (feature.properties.id === undefined) {
          return true;
        }
        if (feature.properties.id === 'variante2') {
          return false;
        }

        return index === sections.findIndex(section => section.properties.id === feature.properties.id);
      });
  }

  function getAllUniqDangers(voies: Collections['voiesCyclablesGeojson'][]) {
    return voies
      .map(voie => voie.features)
      .flat()
      .filter(isDangerFeature)
      .filter((feature, index, sections) => {
        if (feature.properties.id === undefined) {
          return true;
        }

        return index === sections.findIndex(section => section.properties.id === feature.properties.id);
      });
  }

  /**
   * retourne la somme des distances de tous les tronçons passé en paramètre.
   * Attention : pas de notion de dédoublonnage ici.
   */
  function getDistance({ features }: { features: Collections['voiesCyclablesGeojson']['features'] }): number {
    return features.reduce((acc: number, feature: Collections['voiesCyclablesGeojson']['features'][0]) => {
      if (feature.properties.status !== 'expected') {
        return acc + getLineStringDistance(feature);
      } else {
        return acc;
      }
    }, 0);
  }

  function getDoneDistance({ features }: { features: Collections['voiesCyclablesGeojson']['features'] }): number {
    return features.reduce((acc: number, feature: Collections['voiesCyclablesGeojson']['features'][0]) => {
      if (feature.properties.status === 'done') {
        return acc + getLineStringDistance(feature);
      } else {
        return acc;
      }
    }, 0);
  }

  function getLineStringDistance(feature: Collections['voiesCyclablesGeojson']['features'][0]) {
    if (feature.geometry.type !== 'LineString') {
      throw new Error('[getLineStringDistance] Feature must be a LineString');
    }

    let distance = 0;
    const coordinates = feature.geometry.coordinates;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const coord1 = coordinates[i];
      const coord2 = coordinates[i + 1];
      if (!Array.isArray(coord1) || !Array.isArray(coord2)) {
        throw new Error('[getLineStringDistance] Invalid coordinate format');
      }
      const [lon1, lat1] = coord1;
      const [lon2, lat2] = coord2;
      distance += haversine(lat1, lon1, lat2, lon2);
    }

    return distance;
  }

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    // Convert latitude and longitude from degrees to radians
    const toRadians = (angle: number) => (angle * Math.PI) / 180;
    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);

    // Haversine formula
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a));

    // Radius of the Earth in meters
    const radius = 6371000;

    // Calculate the distance in meters
    return Math.round(radius * c);
  }

  function displayDistanceInKm(distance: number, precision = 0) {
    if (distance === 0) {
      return '0 km';
    }
    const distanceInKm = distance / 1000;
    return `${distanceInKm.toFixed(precision)} km`;
  }

  function displayPercent(percent: number) {
    return `${percent}%`;
  }

  /**
   * retourne la somme des distances de tous les tronçons passé en paramètre, aprèds avoir retiré les doublons.
   * un doublon est un tronçon commun entre 2 VLs
   */
  function getTotalDistance(voies: Collections['voiesCyclablesGeojson'][]) {
    const features = getAllUniqLineStrings(voies);
    return getDistance({ features });
  }

  function getStats(voies: Collections['voiesCyclablesGeojson'][]) {
    const features = getAllUniqLineStrings(voies);
    const doneFeatures = features.filter(feature => feature.properties.status === 'done');
    const wipFeatures = features.filter(feature => ['wip', 'tested'].includes(feature.properties.status ?? ''));
    const plannedFeatures = features.filter(feature =>
      ['planned', 'unknown', 'variante'].includes(feature.properties.status ?? '')
    );
    const postponedFeatures = features.filter(feature =>
      ['postponed', 'variante-postponed'].includes(feature.properties.status ?? '')
    );

    const totalDistance = getDistance({ features });
    const doneDistance = getDistance({ features: doneFeatures });
    const wipDistance = getDistance({ features: wipFeatures });
    const plannedDistance = getDistance({ features: plannedFeatures });
    const postponedDistance = getDistance({ features: postponedFeatures });

    function getPercent(distance: number) {
      return Math.round((distance / totalDistance) * 100);
    }

    return {
      done: {
        name: 'Réalisés',
        distance: doneDistance,
        percent: getPercent(doneDistance),
        class: 'text-ra-green-600 font-semibold'
      },
      wip: {
        name: 'En travaux',
        distance: wipDistance,
        percent: getPercent(wipDistance),
        class: 'text-ra-green-600 font-normal'
      },
      planned: {
        name: 'Prévus',
        distance: plannedDistance,
        percent: getPercent(plannedDistance),
        class: 'text-black font-semibold'
      },
      postponed: {
        name: 'Reportés',
        distance: postponedDistance,
        percent: getPercent(postponedDistance),
        class: 'text-ra-orange font-semibold'
      }
    };
  }

  function getStatsQuality(voies: Collections['voiesCyclablesGeojson'][]): { distance: number; postponed: boolean; percent: number; dangerCount: number } {
    const features = getAllUniqLineStrings(voies);
    const dangers = getAllUniqDangers(voies);
    const totalDistance = getDistance({ features });
    const unsatisfactoryFeatures = features.filter(feature => feature.properties.quality === 'unsatisfactory');
    const unsatisfactoryDistance = getDistance({ features: unsatisfactoryFeatures });
    const postponedFeatures = features.filter(feature => feature.properties.status === 'postponed');
    const postponedDistance = getDistance({ features: postponedFeatures });
    const doneFeatures = features.filter(feature => feature.properties.status === 'done');
    const doneDistance = getDistance({ features: doneFeatures });

    return {
      distance: unsatisfactoryDistance,
      postponed: unsatisfactoryDistance === postponedDistance,
      percent: Math.round((unsatisfactoryDistance / doneDistance) * 100),
      dangerCount: dangers.length
    };
  }

  const typologyNames: Record<LaneType, string> = {
    bidirectionnelle: 'Piste bidirectionnelle',
    bilaterale: 'Piste bilatérale',
    'voie-bus': 'Voie bus',
    'voie-bus-elargie': 'Voie bus élargie',
    velorue: 'Vélorue',
    'voie-verte': 'Voie verte',
    'bandes-cyclables': 'Bandes cyclables',
    'zone-de-rencontre': 'Zone de rencontre',
    aucun: 'Aucun',
    inconnu: 'Inconnu'
  };

  const qualityNames: Record<LaneQuality, string> = {
    unsatisfactory: 'Non satisfaisant',
    satisfactory: 'Satisfaisant'
  };

  function getStatsByTypology(voies: Collections['voiesCyclablesGeojson'][]) {
    const lineStringFeatures = getAllUniqLineStrings(voies);
    const totalDistance = getDoneDistance({ features: lineStringFeatures });

    function getPercent(distance: number) {
      return Math.round((distance / totalDistance) * 100);
    }

    const featuresByType = groupBy<Collections['voiesCyclablesGeojson']['features'][0], Collections['voiesCyclablesGeojson']['features'][0]['properties']['type']>(lineStringFeatures, feature => feature.properties.type);

    return Object.entries(featuresByType)
      .map(([type, features]) => {
        const distance = getDoneDistance({ features });
        const percent = getPercent(distance);
        return {
          name: typologyNames[type as LaneType],
          percent
        };
      })
      .filter(stat => stat.percent > 0) // on ne veut pas afficher les types à 0% (arrondis)
      .sort((a, b) => b.percent - a.percent); // plus grandes barres en haut, plus propre
  }

  return {
    getAllUniqLineStrings,
    getDistance,
    getTotalDistance,
    getStats,
    getStatsByTypology,
    displayDistanceInKm,
    displayPercent,
    typologyNames,
    qualityNames,
    getStatsQuality
  };
};
