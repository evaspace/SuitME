# Dress Me - Virtual Try-On Application

A mobile-first web application for virtual try-on of clothing using AI-generated images.

## Overview

Dress Me allows users to upload a clothing item, select a model and style, and generate realistic images of the clothing worn by the model. The application uses a three-step workflow:

1. **Upload** - Upload or capture an image of the clothing item
2. **Configure** - Select model, style, and accessories
3. **Result** - View generated images and share/list the item

## Architecture

The application follows a mobile-first design with a strict thumb zone for primary actions. It uses a linear workflow with three screens corresponding to the three steps.

### Key Technologies

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand
- **Image Processing**: Client-side resizing and compression
- **Mock AI Segmentation**: RMBG-2.0 (placeholder)
- **Mock Generation**: Simulated progress with random delay
- **Mock VLM**: Fast listing generation (placeholder)

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Redirect to /studio
│   ├── models/             # Models library
│   │   ├── page.tsx        # Models index
│   │   └── [id]/page.tsx   # Model detail
│   ├── studio/             # Studio (main workflow)
│   │   └── page.tsx        # Studio with three steps
│   └── results/            # Results placeholder
│       └── page.tsx
├── components/
│   └── mobile/             # Mobile-specific components
│       ├── UploadStep.tsx  # Step 1: Upload
│       ├── ConfigStep.tsx  # Step 2: Configure
│       └── ResultStep.tsx  # Step 3: Result
├── store/                  # Zustand stores
│   ├── useModelStore.ts    # Model data (persistent)
│   ├── useGarmentStore.ts  # Garment data (session)
│   ├── useGenerationStore.ts # Generation state
│   └── useUiStore.ts       # UI state (drawer, theme)
├── lib/                    # Utilities (if needed)
└── styles/                 # Global styles
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application can be easily deployed to various platforms:

### Vercel (Recommended)

1. Install the Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Follow the prompts to configure your project

### Netlify

1. Install the Netlify CLI: `npm i -g netlify-cli`
2. Deploy: `netlify deploy`
3. Follow the prompts to configure your project

### Other Platforms

The application is a standard Next.js app and can be deployed to any platform that supports Next.js, including:
- AWS Amplify
- Google Cloud Platform
- Azure Static Web Apps
- Docker (for custom deployments)

## Branches

- `master` - Stable production code
- `develop` - Integration branch for features
- `feature/upload-step` - Upload step implementation
- `feature/config-step` - Configuration step implementation
- `feature/result-step` - Result step implementation
- `feature/stores` - Zustand store implementation

## Design Notes

- Primary action buttons are fixed in the bottom thumb zone (minimum 56px height)
- Uses segmented controls and large selectable cards for mobile-friendly interaction
- Placeholder images and mock data are used for demonstration; replace with actual AI services in production

## Future Work

- Integrate actual RMBG-2.0 segmentation via WebGPU
- Connect to backend API for model data and generation
- Implement real VLM for fast listing generation
- Add image persistence and gallery saving
- Implement actual pose selection and model switching

## License

MIT
