# Dress Me

Dress Me is a personal, mobile-first web workspace for preparing virtual try-on images and listing content for clothing items.

The repository contains an interactive personal-use web app. Model profiles, reference photos, results, and edited listing fields are saved in this browser. Garment uploads remain temporary in memory. Try-on generation uses Google Gemini image generation through a server-side route.

## Product direction

- Optimize for one person's repeated use rather than a multi-user marketplace.
- Keep the main workflow linear: upload a garment, choose a model and style, review results.
- Use as few visible actions as possible on each screen.
- Make the primary action obvious, large, and comfortable to tap.
- Explain every action through its label and visible result.
- Keep all product UI and project documentation in English.
- The selected garment and model reference photos are sent to Google Gemini only when Generate try-on is used.

## Current web foundation

- Next.js App Router with TypeScript and React.
- Tailwind CSS 4 for utility styling, with a small global design foundation.
- Zustand stores for the current prototype state.
- Route destinations: `/studio`, `/models`, `/models/[id]`, and `/results`.
- Shared application frame and responsive navigation.

The current stack is intended for personal use. Authentication and protected durable storage remain future work; browser local storage is not encrypted, backed up, or shared between devices.

## Project map

```text
app/
├── layout.tsx                 # English document metadata and shared application frame
├── page.tsx                   # Redirects to the Studio
├── globals.css                # Tailwind import and shared visual foundations
├── loading.tsx                # Shared route loading state
├── error.tsx                  # Shared route recovery state
├── not-found.tsx              # Unknown route fallback
├── studio/                    # Main garment-to-result workflow
├── models/                    # Model library and model detail routes
└── results/                   # Generated result and export destination

src/
├── components/
│   ├── layout/                 # Shared application frame
│   └── mobile/                 # Current mobile workflow prototype
└── store/                     # Current client-side prototype state

README.md
TODO.md                         # Product decisions and remaining online-release work
architecture_front_end_dress_me.md
```

Each route folder records implemented interaction decisions and remaining online-release work.

## Run with Docker

```bash
make dev
```

Open [http://localhost:3000](http://localhost:3000). This starts the development server with live source updates. Stop it with `Ctrl+C`.

Set `GEMINI_API_KEY` in the ignored `.env.local` file to enable image generation. Keep the key server-side; do not use a `NEXT_PUBLIC_` prefix. Restart the app after changing the file.

Run the available project checks in a cached Docker build:

```bash
make test
```

`make test` runs ESLint and a production build; the repository does not yet have an automated unit-test suite. Use `make test-lint` or `make test-build` for one check at a time.

Available scripts:

- `npm run dev` - start the local development server.
- `npm run build` - create a production build.
- `npm run start` - serve a production build.
- `npm run lint` - run ESLint.

## Run on the local server

The production Compose file builds a minimal standalone Next.js image and publishes the app on the home LAN at `http://192.168.1.64:3000`:

```bash
docker compose -f compose.production.yaml up -d --build
```

The ignored `.env.local` file is supplied to the running container for `GEMINI_API_KEY` and is excluded from the image build. This is still a personal-use app without authentication; keep it on the private LAN until an access-control layer is added before public exposure.

## Planning files

- [Project TODO](TODO.md) - ordered foundation, product, design, and implementation work.
- [Architecture and UX specification](architecture_front_end_dress_me.md) - product decisions, visual direction, route behavior, and online-release requirements.
- [Studio TODO](app/studio/TODO.md)
- [Model library TODO](app/models/TODO.md)
- [Model detail TODO](<app/models/[id]/TODO.md>)
- [Results TODO](app/results/TODO.md)
- [Shared layout TODO](app/TODO.md)
- [Shared layout components TODO](src/components/layout/TODO.md)
- [Workflow components TODO](src/components/mobile/TODO.md)
- [State management TODO](src/store/TODO.md)

## Scope boundary

The app is browser-local and intended for personal use. User accounts, protected durable storage, backups, and production deployment are future work. The garment and model images are sent to Google Gemini only when the user chooses Generate try-on.
