# Dress Me - Product and Delivery Checklist

This checklist records implemented front-end decisions and the remaining work needed before the personal prototype can become an online product.

## Product decisions - complete

- [x] **Problem:** prepare try-on previews and editable listing drafts from one garment photo.
- [x] **Primary task:** choose garment → choose a ready model and style → review previews → edit listing → download/copy.
- [x] **User:** one owner; there is no shared account or multi-user workspace.
- [x] **Models:** a model needs a name; profile fields are optional; at least one default reference pose is required to use it in Studio.
- [x] **Model status:** active profiles with a default photo are available in Studio; inactive or incomplete profiles remain manageable in the library.
- [x] **Session retention:** garment photo stays in memory for the current browser session and is cleared by “Start another item”; refresh can lose the garment draft.
- [x] **Saved data:** model profiles, compressed reference photos, results, and edited listing fields persist in this browser's local storage.
- [x] **Privacy:** selected garment and model photos are sent to Google Gemini only when Generate try-on is used. Local browser storage is not encrypted, backed up, or shared between devices.
- [x] **Result output:** result history is ordered and searchable; listing title, description, and tags are editable; one preview can be downloaded and a listing copied.
- [x] **Current boundary:** Gemini image generation is connected through a server route; segmentation, authentication, durable server storage, and deployment are not connected.

## Design direction - complete

- [x] Use the uploaded Dress Me logo.
- [x] Use a warm second-hand-fashion palette: forest green `#315D46`, soft pink `#D98699`, cream `#F5F0E7`, paper `#FFFDF8`, and warm ink `#2F3029`.
- [x] Use Fraunces editorial headings with Plus Jakarta Sans interface typography.
- [x] Use soft paper surfaces, warm borders, subtle shadows, and restrained pink details; keep green for primary actions and selected states.
- [x] Use large labeled controls, visible selection states, plain English, and a single dominant action at each workflow step.
- [x] Design mobile first and use wider screens for image grids and a two-column result review.

## Implemented destinations

- [x] Shared app frame, logo, route navigation, active route state, skip link, focus styling, responsive layout, loading/error/not-found surfaces.
- [x] Studio camera/gallery photo selection, validation, preview, model/style selection, Gemini generation, retry, and repeat-use flow.
- [x] Model library add and open flows, browser persistence, profile edit, active/inactive status, add/replace/default/remove pose, and confirmed delete.
- [x] Results empty/search/sorted states, selected preview, editable listing fields, clipboard feedback/fallback, and image download.
- [x] Docker commands: `make dev`, `make test`, `make test-lint`, and `make test-build`.

## Remaining work for an online release

- [ ] Select and implement an authenticated hosting and deployment path for a private personal app.
- [ ] Replace browser local storage with an encrypted or access-controlled database and durable image storage; define backup and deletion behavior.
- [x] Connect Gemini image generation through a server route with a private API key and clear photo-sharing disclosure.
- [ ] Add authentication and durable private image storage before exposing this app online.
- [ ] Review Gemini outputs and listing copy for accuracy; generated results need explicit user review.
- [ ] Add durable export of models and results and a recovery path for browser storage limits.
- [ ] Review the finished experience in real phone, tablet, and desktop browsers, including keyboard and screen reader use.
