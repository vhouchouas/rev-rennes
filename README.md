# Observatoire & Plaidoyer du Réseau Express Vélo Rennais

## De quoi s'agit-il ?
Il s'agit d'une plateforme web permettant la visualisation de l'état actuel du Réseau Express Vélo Rennais et de ses manques.

Ce projet est un fork de Cyclopolis, projet développé par des bénévoles de l'association lyonnaise "La Ville à Vélo", plateforme qui a pour objectif principal de suivre le développement du projet des "Voies Lyonnaises".

On y retrouve en particulier :
- une carte intéractive permettant de visualiser les tracés des voies cyclables.
- une page détaillée sur chacune des voies cyclables.

Plus d'informations sur Cyclopolis : https://github.com/lavilleavelo/cyclopolis

## Aide aux contributeurs/trices non développeurs/euses

le `status` de chaque tronçon peut prendre les valeurs définies [ici](types/index.ts#L13)

le `type` de chaque tronçon peut prendre les valeurs définies [ici](types/index.ts#L1)


## Quelques détails techniques
Look at the [nuxt 3 documentation](https://v3.nuxtjs.org) to learn more.

## Setup

Make sure to install the dependencies:

```bash
npm install
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run generate
```

Locally preview production build:

```bash
npm run preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.
