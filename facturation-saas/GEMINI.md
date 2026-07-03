# Documentation du Projet : iziFacture (Facturation SaaS)

Ce fichier `GEMINI.md` sert de référence et de point d'entrée pour comprendre l'architecture, les fonctionnalités et les choix techniques du projet. Il est conçu pour donner tout le contexte nécessaire à un futur modèle d'IA (ou un développeur) qui reprendrait le projet.

## 1. Description de l'Application
**iziFacture** est une plateforme SaaS (Software as a Service) moderne, élégante et performante, destinée aux entrepreneurs africains pour faciliter la création, la gestion et le suivi de leurs factures. L'application met l'accent sur la simplicité (calcul automatique de la TVA à 18%), le professionnalisme (design premium) et l'expérience utilisateur.

## 2. Fonctionnalités Implémentées

### A. Vitrine / Landing Page (`/landing.html`)
- Présentation haut de gamme du produit.
- Animations fluides au défilement (GSAP & ScrollTrigger).
- Effets visuels premium : Glassmorphism, boutons magnétiques, texture de "bruit" visuel en arrière-plan.

### B. Espace Utilisateur (Dashboard)
- **Tableau de bord global** : Structure partagée avec une Sidebar (navigation latérale) et un Header (en-tête).
- **Gestion des Factures (`/invoices`)** : 
  - Liste des factures.
  - **Création de facture (`/invoices/new`)** : Générateur de facture interactif. Ajout/suppression dynamique des lignes de prestation, calcul automatique du Sous-total, de la TVA (18%) et du Grand Total. Fonction de partage (WhatsApp, Email) et d'impression.
- **Paramètres de l'entreprise (`/settings`)** :
  - Formulaire pour renseigner les informations légales de l'émetteur (Nom, Email, Téléphone, Adresse, NINEA/RCCM) et le logo.
  - Sauvegarde locale (`localStorage`) avec des retours visuels (animations GSAP).
  - **Synchronisation** : Les données renseignées dans les paramètres pré-remplissent automatiquement la section "Émetteur" lors de la création d'une nouvelle facture.
- **Clients (`/clients`)** : Interface de gestion du portefeuille client.
- **Aide / Support (`/help`)** : Page d'assistance et de documentation interne.

## 3. Structure des Fichiers Principaux

Le projet utilise **Next.js 14** (App Router) et s'organise ainsi :

```
facturation-saas/
├── public/
│   └── landing.html             # Page de présentation (Premier dashboard)
├── src/
│   ├── app/
│   │   ├── (dashboard)/         # Routes protégées du SaaS
│   │   │   ├── clients/         # Page clients
│   │   │   ├── help/            # Page d'aide
│   │   │   ├── invoices/        # Liste et création de factures (/new)
│   │   │   ├── settings/        # Paramètres de l'utilisateur
│   │   │   └── layout.tsx       # Layout principal (Sidebar + Header)
│   │   ├── globals.css          # Styles globaux et variables Tailwind
│   │   └── page.tsx             # Redirige vers /landing.html
│   ├── components/
│   │   └── layout/              # Composants d'interface (Sidebar.tsx, Header.tsx)
│   └── types/
│       └── index.ts             # Définitions des types TypeScript (Invoice, Client, etc.)
├── tailwind.config.ts           # Configuration du design system
└── package.json                 # Dépendances et scripts
```

## 4. Technologies Utilisées
- **Framework** : Next.js 14.2.35 (App Router, Server & Client Components).
- **Langage** : React 18 avec TypeScript.
- **Styling** : Tailwind CSS v3.4 (Utilitaires, variables de couleurs personnalisées).
- **Animations** : GSAP (GreenSock Animation Platform) pour les révélations, le stagger et les micro-interactions.
- **Icônes** : Lucide-React.
- **État & Persistance** : React `useState`, `useEffect` et API `localStorage` du navigateur (en attendant un backend).

## 5. Décisions de Design (Design System "Premium SaaS")

Toutes les interfaces doivent impérativement respecter le **Design System Premium** décrit dans le fichier `.agents/AGENTS.md` :

- **Couleur Primaire** : Vert (#22c55e / `primary-500`). Utilisé pour les appels à l'action.
- **Fonds & Textures** : Utilisation d'un overlay de bruit SVG (`.noise-bg`) à très faible opacité pour donner un côté "tangible" et premium (jamais de fonds plats et lisses).
- **Effets "Glassmorphism"** : Navigation et modales utilisant des arrière-plans semi-transparents avec `backdrop-blur`.
- **Typographie** : `Plus Jakarta Sans` pour les titres (impact, modernité) et `Inter` pour les données et le corps du texte.
- **Ombres** : Ombres très douces et colorées (`shadow-glow`) pour les éléments actifs.
- **Animations Obligatoires** : Aucun élément ne doit apparaître de manière statique. Chaque composant ou page doit utiliser GSAP pour entrer de manière fluide (`power3.out`, stagger).

## 6. Instructions pour un futur Modèle IA (Prompt Context)

Si tu es un agent IA reprenant ce projet, voici tes directives strictes :

1. **Ne casse pas l'esthétique "Premium"** : Chaque nouveau bouton, modale ou carte doit utiliser les classes Tailwind existantes (ex: `bg-white border border-slate-200 rounded-xl shadow-sm`, micro-animations au hover).
2. **Gestion de l'État** : Actuellement, le site fonctionne majoritairement côté client pour les données dynamiques (`localStorage`). Si tu dois implémenter une base de données (ex: Firebase, Supabase), tu devras migrer doucement la logique de `localStorage` vers le backend tout en gardant des chargements optimistes (optimistic UI).
3. **Erreurs de Compilation (OOM)** : Next.js peut être très gourmand en mémoire sur Windows. Assure-toi que les scripts de démarrage dans `package.json` utilisent `NODE_OPTIONS=--max_old_space_size=4096` si des erreurs "JavaScript heap out of memory" surviennent.
4. **Imports d'Icônes** : Prête attention à `lucide-react`. N'invente pas des noms d'icônes, utilise celles qui sont standard pour éviter de faire planter le processus de build (ex: l'icône `Instagram` a déjà causé un crash par le passé, vérifie toujours la compatibilité).
5. **Composants Client** : N'oublie pas la directive `"use client";` en haut des fichiers qui utilisent `useState`, `useEffect` ou des animations GSAP impliquant des `useRef`.
6. **ESLint** : Les règles strictes (`no-unescaped-entities`, `no-unused-vars`) ont été mises en avertissements/désactivées pour fluidifier le développement. Garde ton code propre, mais ne t'inquiète pas si tu as besoin de laisser un import non utilisé temporairement.
