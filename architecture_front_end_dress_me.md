# Spécifications Techniques et Architecture Front-End — Dress Me

Ce document définit la structure, l'architecture logicielle, les flux de données et l'ergonomie de l'interface utilisateur pour la plateforme web **Dress Me**.

---

## 1. Vue d'Ensemble & Principes Directeurs

**Dress Me** est une application web à haute efficacité conçue pour générer rapidement des visuels de vêtements portés par des mannequins réels via l'Intelligence Artificielle.

### Principes Clés d'Architecture
1. **Dichotomie Strict-Mémoire :**
   * **Données Permanentes :** Profils de mannequins, métadonnées anatomiques, photos de poses de référence (persistés en base de données / S3).
   * **Données Temporaires :** Fichiers vêtements importés, masques de segmentation, rendus générés et métadonnées d'annonces (stockés uniquement durant la session active et purgés post-export).00
2. **Latence Minime & Feedback Instantané :** Prétraitement côté client (compression, redimensionnement Canvas, preview WebGL) avant envoi des requêtes d'inférence heavy-GPU.
3. **Workflow Linear & Monopage :** Minimiser les clics pour passer de l'upload du vêtement brut à l'export du pack d'images final.

---

## 2. Stack Technique Front-End Recommandée

* **Framework React :** Next.js 14+ (App Router, TypeScript)
* **Gestionnaire d'État Global :** Zustand (léger, modulaire, adapté au suivi des Blobs et des sessions de travail)
* **Styling & UI Kit :** Tailwind CSS + Shadcn UI + Lucide React (composants accessibles et hautement personnalisables)
* **Communication Temps Réel :** Socket.io-client ou EventSource (Server-Sent Events / SSE) pour le suivi étape par étape de l'inférence IA (Segmentation $\rightarrow$ DensePose $\rightarrow$ Diffusion $\rightarrow$ Relighting).
* **Traitement d'Image Client :** `browser-image-compression`, Canvas API / OffscreenCanvas.

---

## 3. Arborescence du Projet (Front-End)

```text
src/
├── app/
│   ├── layout.tsx                  # Root Layout (Thème, Modals globaux, Providers)
│   ├── page.tsx                    # Redirection vers /studio
│   ├── models/                     # Page : Bibliothèque des Modèles
│   │   ├── page.tsx
│   │   └── [id]/page.tsx           # Édition d'un mannequin & ses poses
│   ├── studio/                     # Page : Studio Express (Workspace principal)
│   │   └── page.tsx
│   └── results/                    # Page / Drawer : Galerie de Résultats & Export
│       └── page.tsx
├── components/
│   ├── layout/                     # Header, Sidebar, Navigation
│   ├── models/                     # Cartes Modèles, Formulaire Pose, Tagging
│   ├── studio/                     # Dropzone, Segmentation Preview, Auto-Router, Style Matrix
│   ├── results/                    # Image Comparison, Inpainting Canvas, Fast-Listing Editor
│   └── ui/                         # Composants atomiques (Buttons, Modals, Sliders, Badges)
├── store/
│   ├── useModelStore.ts            # État permanent : Mannequins & Poses
│   ├── useGarmentStore.ts          # État temporaire : Vêtement uploadé & Masque
│   ├── useGenerationStore.ts       # État d'inférence : Jobs IA, Websocket status, Rendus
│   └── useUiStore.ts               # UX : Drawer status, Thème, Notifications
├── hooks/
│   ├── useGarmentProcessor.ts      # Pipeline local : Resize, Canvas Blob, SAM2 Trigger
│   ├── useSseJobTracker.ts         # Hook de suivi de progression IA
│   └── useMemoryCleaner.ts         # Purge automatique des URL.createObjectURL()
├── types/
│   ├── model.ts                    # Interfaces : Model, Pose, PoseCategory
│   ├── garment.ts                  # Interfaces : Garment, SegmentationMask, StyleConfig
│   └── generation.ts               # Interfaces : JobStatus, GenerationResult, VlmMetadata
└── lib/
    ├── api.ts                      # Client Axios/Fetch typé
    └── utils.ts                    # Helpers (Image processing, Blob cleanup)
```

---

## 4. Gestion de l'État Global (Stores Zustand)

### A. `useModelStore` (Données Permanentes)
```typescript
interface Pose {
  id: string;
  category: 'front_standing' | 'profile' | 'three_quarter' | 'sitting' | 'back';
  imageUrl: string;
  isDefault: boolean;
}

interface Model {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'unisex';
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  skinTone: string;
  defaultStyle: 'casual' | 'chic' | 'streetwear';
  poses: Pose[];
}

interface ModelStore {
  models: Model[];
  selectedModelId: string | null;
  activeModel: () => Model | undefined;
  fetchModels: () => Promise<void>;
  addModel: (model: Omit<Model, 'id'>) => Promise<void>;
  updatePoses: (modelId: string, poses: Pose[]) => void;
  selectModel: (id: string) => void;
}
```

### B. `useGarmentStore` (Données Temporaires Session)
```typescript
interface GarmentStore {
  rawFile: File | null;
  previewUrl: string | null;
  segmentedMaskUrl: string | null;
  isSegmenting: boolean;
  detectedCategory: string | null; // e.g., "blazer", "dress"
  styleConfig: {
    targetStyle: 'chic' | 'casual' | 'streetwear';
    autoSelectPoses: boolean;
    selectedPoseIds: string[];
    accessorize: boolean;
    accessoryDensity: number; // 0 à 100%
  };
  setGarmentFile: (file: File) => void;
  setSegmentedResult: (maskUrl: string, category: string) => void;
  updateStyleConfig: (config: Partial<GarmentStore['styleConfig']>) => void;
  clearGarmentSession: () => void; // Purge la mémoire temporaire
}
```

---

## 5. Description Détaillée des Écrans & Composants

### 5.1. Header & Navigation Globale
* **Position :** Fixe en haut de l'écran.
* **Éléments :**
  * **Logo & Titre :** *Dress Me*.
  * **Navigation principale :** 
    * `Studio Express` (Lien actif par défaut).
    * `Bibliothèque Modèles` (Badge indiquant le nombre de modèles actifs, ex. `3 Modèles prêts`).
  * **Indicateur de Session Temporaire :** Statut mémoire (`0 Vêtement en mémoire` / `1 Vêtement actif`).
  * **Bouton Purge Rapide :** Icône poubelle pour nettoyer la session en cours d'un clic.

---

### 5.2. Page 1 : Bibliothèque de Modèles (`/models`)

Cette vue gère le stock permanent de personnes réelles pouvant porter les vêtements.

```
+-------------------------------------------------------------------------------+
| BIBLIOTHÈQUE DES MODÈLES                        [ + Ajouter un Modèle ]       |
+-------------------------------------------------------------------------------+
| +----------------------------------+  +----------------------------------+ |
| |  [Avatar] Elena (Femme - S)     |  |  [Avatar] Marcus (Homme - L)     | |
| |  Style par défaut : Chic         |  |  Style par défaut : Casual       | |
| |  10/10 Poses enregistrées        |  |  8/10 Poses enregistrées         | |
| |  [ Édition Poses ] [ Supprimer ] |  |  [ Édition Poses ] [ Supprimer ] | |
| +----------------------------------+  +----------------------------------+ |
|                                                                               |
| DETAILED POSE GRID (Modèle sélectionné : Elena)                               |
| +-----------+  +-----------+  +-----------+  +-----------+  +-----------+     |
| | Pose #1   |  | Pose #2   |  | Pose #3   |  | Pose #4   |  | [ + Pose ]|     |
| | Face      |  | Profil    |  | 3/4 Droit |  | Assis     |  | Drop Zone |     |
| +-----------+  +-----------+  +-----------+  +-----------+  +-----------+     |
+-------------------------------------------------------------------------------+
```

#### Éléments et Composants :
1. **Cards Mannequins (`ModelCard.tsx`) :**
   * Présente le nom, genre, taille, et la photo miniature principale.
   * Switch pour activer/désactiver le modèle dans le studio.
2. **Grille de Poses Permanentes (`PoseGridManager.tsx`) :**
   * Emplacements dédiés pour chaque angle de vue (Face, Profil, 3/4, Assis, Dos).
   * **Boutons interactifs :** Remplacer l'image, recadrer, supprimer.
   * **Badge de statut :** Indique si la pose a déjà été pré-traitée par le pipeline DensePose backend.

---

### 5.3. Page 2 : Studio Express (`/studio`) — Workspace Principal

Il s'agit du cœur applicatif. Toute l'interaction se concentre sur un panneau central fluide.

```
+-------------------------------------------------------------------------------+
| STUDIO EXPRESS                                                                |
+-------------------------------------------------------------------------------+
| STEP 1: MANNEQUIN SELECTION                                                   |
| Mode: (X) Auto-Routing via VLM   ( ) Sélection Manuelle                      |
| Active Target: [ Détection automatique selon le vêtement... ]                 |
+-------------------------------------------------------------------------------+
| STEP 2: DROPZONE VÊTEMENTS (Fichier Temporaire)                               |
| +---------------------------------------------------------------------------+ |
| |                                                                           | |
| |        Glissez votre photo de vêtement ici (ou cliquez pour parcourir)    | |
| |        Formats acceptés: JPG, PNG, WEBP (Max 25 Mo)                       | |
| |                                                                           | |
| +---------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------+
| STEP 3: STYLE & RULES MATRIX                                                  |
| Code Style : [ Chic / Habillé  v ]                                           |
| Poses : [X] Auto (2-3 poses)  |  Accessoires : [X] Bagues/Montres [Slider: 50%] |
+-------------------------------------------------------------------------------+
|                                [ GENERER LES RENDUS (10s) ]                   |
+-------------------------------------------------------------------------------+
```

#### Composants Clés :
1. **Auto-Router Modèle (`ModelAutoRouter.tsx`) :**
   * Permet de forcer un modèle ou de laisser l'IA analyser le vêtement (ex : un vêtement homme sélectionnera automatiquement Marcus).
2. **Dropzone & Pre-Processing Zone (`GarmentDropzone.tsx`) :**
   * Zone de drag-and-drop HTML5.
   * Dès le dépôt du fichier, déclenchement du hook `useGarmentProcessor` :
     * Redimensionnement local max $2048 \times 2048 \text{ px}$.
     * Appel API léger vers le service de segmentation SAM 2.
     * Affichage immédiat du masque de détourage dynamique avec possibilité d'ajustement manuel.
3. **Matrice de Style & Accessoires (`StyleMatrixControls.tsx`) :**
   * **Sélecteur de style :** Casual, Chic, Streetwear, Business.
   * **Contrôle d'accessoirisation :** Toggle on/off + Slider d'intensité ($0\%$ à $100\%$) pour décider de l'ajout de bagues, montres, ceintures ou sacs assortis.
   * **Sélecteur de Poses Périphérique :** Permet de désactiver manuellement une pose spécifique pour ce vêtement.
4. **Bouton d'Inférence (`GenerationTrigger.tsx`) :**
   * Bouton d'action principal avec animation d'état (Idle, Processing avec ProgressBar SSE, Complete).

---

### 5.4. Page 3 : Résultats, Retouche & Fast-Listing (`/results`)

Dès la fin du traitement, un Drawer dynamique ou une vue dédiée s'ouvre.

```
+-------------------------------------------------------------------------------+
| RENDUS GENERES (3 Poses)                         [ Nettoyer & Suivant ]       |
+-------------------------------------------------------------------------------+
| +---------------------+ +---------------------+ +---------------------+     |
| | Pose 1: Face        | | Pose 2: 3/4         | | Pose 3: Assis       |     |
| | [ Rendu IA Final ]  | | [ Rendu IA Final ]  | | [ Rendu IA Final ]  |     |
| | [ Retoucher Bague ] | | [ Retoucher Bague ] | | [ Retoucher Bague ] |     |
| +---------------------+ +---------------------+ +---------------------+     |
+-------------------------------------------------------------------------------+
| FAST-LISTING AUTOMATIQUE (Généré par VLM)                                     |
| Titre : Veste Blazer Croisée en Laine Peignée - Style Chic                    |
| Description : Magnifique blazer habillé, coupe structurée, couleur bleu nuit. |
| Mots-clés : #blazer #chic #vinted #outfit #laine                              |
|                                                                               |
| [ TELECHARGER PACK IMAGES (ZIP) ]   [ COPIER ANNONCE ]                       |
+-------------------------------------------------------------------------------+
```

#### Composants Clés :
1. **Galerie Comparative de Rendu (`ResultGallery.tsx`) :**
   * Affichage côte à côte des 2-3 poses générées en haute résolution.
   * Modal de comparaison avant/après (Image vêtement brut vs. Image vêtement porté sur mannequin).
2. **Panneau de Retouche Éclair (`InpaintingTouchup.tsx`) :**
   * Permet de pointer une zone de l'image (ex. le poignet) et de cliquer sur "Enlever la montre" ou "Changer la bague" via micro-inpainting express.
3. **Bloc Fast-Listing Metadata (`FastListingCard.tsx`) :**
   * Champs de texte pré-remplis automatiquement par le VLM : Titre, Description, Marque estimée, Matière, État, Mots-clés.
   * Bouton *Copy-to-Clipboard* unifié pour coller directement dans l'interface Vinted, Shopify ou eBay.
4. **Action "Nettoyer et Suivant" (`SessionCleanerButton.tsx`) :**
   * Déclenche la purge complète du `useGarmentStore` et `useGenerationStore`.
   * Libère les URLs d'objets mémoire et ramène l'utilisateur directement à la Dropzone du Studio Express.

---

## 6. Flux de Données & Cycle de Vie des Fichiers

```
[Utilisateur] 
     │
     ▼ (1. Upload Photo Vêtement)
[GarmentDropzone] ──(Canvas Resize)──► [Memory Blob (Local)]
     │
     ▼ (2. Requête API background)
[SAM2 Segmentation API] ◄─────────────── Send Local File
     │
     ▼ (3. Masque Alpha prêt)
[Preview Segmentée]
     │
     ▼ (4. Clic "Générer")
[Pipeline VTO / DensePose / Relighting] ◄── Combine [Pose Permanente] + [Vêtement Masqué]
     │
     ▼ (5. SSE Stream Progression 0% -> 100%)
[Studio UI ProgressBar]
     │
     ▼ (6. Rendu Final & Fast-Listing)
[ResultGallery] ──(Téléchargement/Copy)──► [Export Utilisateur]
     │
     ▼ (7. Clic "Nettoyer")
[useMemoryCleaner Hook] ──(Revoke Object URLs & Reset Stores)──► [Mémoire Vierge]
```

---

## 7. Directives d'Optimisation Performance UX

1. **Gestion Mémoire Navigateur :**
   * Utiliser impérativement `URL.revokeObjectURL(url)` à chaque fois qu'un vêtement temporaire ou qu'un résultat intermédiaire est supprimé pour éviter les fuites mémoire dans le navigateur (Memory Leaks).
2. **Prétraitement d'Image Web Worker :**
   * Le redimensionnement et l'extraction de métadonnées EXIF des images uploadées doivent s'exécuter dans un Web Worker séparé pour ne pas bloquer le thread principal de l'UI.
3. **États Dégradés & Feedback Visuel :**
   * Pendant l'inférence IA ($\approx 8\text{ à }12\text{ secondes}$), afficher un squelette de chargement (*Skeleton Loader*) animé intégrant la silhouette exacte du mannequin sélectionné.


   ## 1. Mises à Jour de l'Architecture & Principes Directeurs

### A. Architecture Hybride Tri-Tiers (Client / VPS / Serverless GPU)
- **Client (WebGPU) :** Exécution locale des traitements légers et détourage instantané ($0\text{ ms}$ de latence réseau).
- **Backend VPS (Rust avec `axum` + `ort` ou Go avec `fiber`) :** Microservice ultra-léger (RAM $< 100\text{ Mo}$ au repos). Gestion des sessions, stockage temporaire et flux SSE sur HTTP/2. Zéro dépendance Python/PyTorch sur le VPS.
- **Serverless GPU (RunPod / Fal.ai) :** Inférence lourde de Virtual Try-On (CatVTON / IDM-VTON) déclenchée uniquement à l'acte ($\approx 0,005\text{ \$}$ / génération).

### B. Choix des Modèles IA
- **Détourage Vêtement :** `RMBG-2.0` (BRIA AI) en ONNX WebGPU exécuté directement dans le navigateur client (remplace SAM 2).
- **Auto-Routing / Classification :** `FastViT-T8` ou `MobileNetV4-Small` (ONNX, $< 12\text{ Mo}$, inférence $< 5\text{ ms}$).
- **Fast-Listing VLM :** `Florence-2-base` (230M params) exécuté en temps masqué (background pipeline) pendant le rendu de diffusion.

---

## 2. Optimisations Critiques Front-End & Mémoire

### A. Pattern IndexedDB Zero-State (Zustand)
- **Interdiction :** Stockage direct d'objets `File`, `Blob` ou `URL.createObjectURL()` dans le store Zustand (évite la saturation du V8 Heap).
- **Règle :** Zustand ne conserve que des identifiants texte (`garmentId`) et métadonnées sérialisables. Les données binaires transitent par `IndexedDB` (`idb-keyval`) et sont traitées via des `ImageBitmap` transférables (*zero-copy transfer*).

### B. Protocole Temps Réel
- Suppression de `Socket.io`.
- Utilisation exclusive de **Server-Sent Events (SSE)** sur **HTTP/2 Multiplexé** (`EventSource` client).

---

## 3. Arborescence Misa à Jour (`src/`)

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── models/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── studio/
│   │   └── page.tsx                # Page Client dynamique (ssr: false)
│   └── results/
│       └── page.tsx
├── workers/
│   ├── imageProcessor.worker.ts    # Redimensionnement Canvas (OffscreenCanvas)
│   └── rmbg2.worker.ts             # Inférence RMBG-2.0 WebGPU (ONNX Runtime Web)
├── lib/
│   ├── db.ts                       # Couche IndexedDB Zero-State (idb-keyval)
│   ├── sseClient.ts                # Client SSE natif
│   └── utils.ts
└── store/
    ├── useModelStore.ts
    ├── useGarmentStore.ts          # State léger (ID uniquement)
    ├── useGenerationStore.ts
    └── useUiStore.ts

    <ElicitationsGroup message="Que souhaites-tu ajouter ou préciser dans tes spécifications ?">
  <Elicitation label="Rédiger la section API endpoints pour le microservice Rust" query="Rédige la section des endpoints API du microservice Rust (Axum) pour la documentation README.md."/>
  <Elicitation label="Ajouter la configuration Docker du VPS" query="Fournis la configuration Docker / Docker Compose optimisée pour déployer le backend Rust et MinIO sur le VPS."/>
</ElicitationsGroup>


https://github.com/evaspace/SuitME.git


1. Principes Ergonomiques Mobile-First

    Zone de Pouce Strict (Thumb Zone) : Tous les boutons d'action principaux sont ancrés en bas d'écran (Sticky Bottom Bar) avec une hauteur minimale de 56 px (cible tactile recommandée par Apple Human Interface / Google Material 3).

    Plein Écran & Vue Unique : Suppression de la grille complexe et des panneaux latéraux. Un seul choix principal par écran.

    Capture Photo Directe : La zone de dépôt (Dropzone) déclenche directement l'appareil photo du smartphone via input capture="environment".

    Masquage du Bruit Technique : Les métriques de mémoire, les états de connexion WebSocket/SSE et les logs d'inférence sont totalement masqués pour l'utilisateur.

2. Dynamic Workflow Mobile (3 Écrans)
Plaintext

[ ÉCRAN 1 : VÊTEMENT ]          [ ÉCRAN 2 : STYLE & MANNEQUIN ]        [ ÉCRAN 3 : RÉSULTAT ]
+-----------------------+       +-----------------------+            +-----------------------+
|  Dress Me             |       |  Style & Mannequin    |            |  Rendu Généré         |
|                       |       |                       |            |                       |
| +-------------------+ |       | MANNEQUIN             |            | +-------------------+ |
| |                   | |       | [ Photo ]  [ Photo ]  |            | |                   | |
| |   [ Appareil ]    | |       | Elena      Marcus     |            | |  Image Portée     | |
| |   Prendre photo   | |       |                       |            | |  Haute Résolution | |
| |   ou importer     | |       | STYLE                 |            | |                   | |
| |                   | |       | ( Chic ) ( Street )   |            | +-------------------+ |
| +-------------------+ |       |                       |            |                       |
|                       |       | POSES                 |            |  Titre & Prix Vinted  |
| [ Aperçu détouré ]    |       | [X] Face  [X] 3/4     |            |  Blazer Laine Chic    |
|                       |       |                       |            |                       |
| +-------------------+ |       | +-------------------+ |            | +-------------------+ |
| | SUIVANT  (56px)   | |       | | GÉNERER (56px)    | |            | | COPIER ANNONCE    | |
| +-------------------+ |       | +-------------------+ |            | +-------------------+ |
+-----------------------+       +-----------------------+            +-----------------------+

3. Mise à Jour du README.md (Spécifications Front-End Mobile)

Voici le bloc de spécifications UI/UX mis à jour à remplacer dans ton README.md :
Markdown

## 4. Spécifications Ergonomiques & UX/UI Mobile-First

### A. Design System Mobile (Tailwind CSS + Shadcn UI)
- **Cibles tactiles :** Hauteur minimale de `h-14` (56 px) pour tous les boutons d'action.
- **Formulaires :** Utilisation exclusive de segmented controls (`Tabs` Shadcn) et de cartes sélectionnables géantes à la place des menus déroulants (`Select`).
- **Ancrage :** Barre d'action principale fixe en bas d'écran (`fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md`).

### B. Parcours Utilisateur Linéaire (3 Étapes)
1. **Étape 1 — Capture/Upload (`StudioUploadStep.tsx`) :**
   - Zone de drop géante ouvrant l'appareil photo mobile.
   - Détourage instantané local (RMBG-2.0 WebGPU) affiché en transparence Alpha dès la sélection.
2. **Étape 2 — Configuration Express (`StudioConfigStep.tsx`) :**
   - **Sélecteur Mannequin :** Scroll horizontal de cartes photo compactes ($120 \times 160\text{ px}$).
   - **Style & Poses :** Boutons-toggles larges pour le style (Chic, Casual, Streetwear). Poses sélectionnées automatiquement selon la catégorie détectée.
3. **Étape 3 — Export Éclair (`StudioResultStep.tsx`) :**
   - Carousel swipeable des 2 à 3 visuels générés.
   - Bouton primaire géant : **« Copier l'Annonce Vinted »** (Copie dans le presse-papier le titre, la description et les tags).
   - Bouton secondaire : **« Sauvegarder dans la Galerie »** / **« Réinitialiser »**.

---

## 5. Composants UI Clés (`src/components/mobile/`)

```text
src/components/mobile/
├── MobileLayout.tsx          # Wrapper viewport mobile (safe-area padding)
├── BottomBar.tsx             # Barre de boutons fixe (Thumb Zone)
├── StudioUploadStep.tsx      # Dropzone / Camera Trigger + Preview RMBG-2.0
├── StudioConfigStep.tsx      # Sélecteur Mannequin (Scroll X) & Style Toggles
├── StudioResultStep.tsx      # Galerie swipeable & Fast-Listing Copy
└── TouchButton.tsx           # Composant bouton 56px avec feedback haptique
