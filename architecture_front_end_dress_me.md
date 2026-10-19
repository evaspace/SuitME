# Dress Me - Web Architecture and UX Specification

**Status:** working product and design brief. Items described as tentative still need review with the designer and developer. This document defines the foundation and future work; it does not claim that the listed product behavior is implemented.

## 1. Product goal

Dress Me is a personal web workspace for turning a clothing photo into a small pack of virtual try-on images and reusable listing text. The core value is a short, predictable workflow that can be repeated item after item.

### Design principles

1. **One clear next step:** each workflow screen should have one dominant action.
2. **Few, large controls:** keep the visible action count low; primary touch targets should be at least 56 px high, with a preferred 64 px target for the main action.
3. **Plain action labels:** name the result, such as “Choose a photo” or “Generate images,” instead of using vague labels such as “Continue” where possible.
4. **No duplicate actions:** do not show the same action in both the page body and a fixed bottom bar.
5. **Visible feedback:** every action must show its outcome, progress, failure, or disabled reason.
6. **Mobile first:** support a narrow viewport and safe areas first, then make use of wider screens without adding unnecessary controls.
7. **Private by default:** uploads and generated images are temporary until the user explicitly saves or exports them.
8. **English throughout:** interface copy, code comments intended for the team, README files, and planning documents use English.

## 2. Current foundation and boundaries

The current repository uses Next.js App Router, TypeScript, React, Tailwind CSS 4, and Zustand. The app has route folders for the Studio, model library, model detail, and results. Studio sends the selected garment and model reference images to Gemini 3.1 Flash Image through a server-side route; the API key is private server configuration.

The following decisions remain open and must not be silently assumed during feature work:

- Authentication and whether the first release is reachable only by its owner.
- Backend language and hosting model.
- Database, image storage, retention period, and backup policy.
- AI vendors or local models for segmentation and listing metadata. Gemini is currently used for image generation.
- Whether any data persists after a session and what the explicit save action means.
- Whether generated content is downloaded as individual images, a ZIP, or both.
- Target devices, minimum browser support, and accessibility acceptance criteria.

## 3. Route map

| Route | Purpose | Main user outcome |
| --- | --- | --- |
| `/studio` | Start and complete the garment workflow | Produce and review a try-on result |
| `/models` | Browse the personal model library | Choose or maintain a reusable model |
| `/models/[id]` | Inspect and maintain one model and its poses | Keep that model's inputs ready for the Studio |
| `/results` | Review the current or saved result set | Copy listing text or export images |

The root route redirects to `/studio`. The shared application frame owns the product name, route navigation, page width, and global accessibility landmarks. Route-specific actions stay inside their destination; the global frame should not become a second toolbar.

## 4. Proposed information architecture

### Shared application frame

- Use a semantic header, navigation landmark, main landmark, and page title hierarchy.
- Keep navigation to the four known destinations, with a clear current-route state.
- On small screens, navigation must remain reachable without competing with the workflow's primary bottom action.
- Do not display technical diagnostics, memory counts, model pipeline names, or transport status in normal product UI.
- Provide consistent focus, hover, pressed, disabled, and loading states.

### Studio (`/studio`)

The proposed flow has three stages. The exact screen composition remains a design task.

1. **Garment photo:** choose or capture one image, inspect the preview, replace or remove it, then continue.
2. **Model and style:** accept a recommended model or select one; choose a simple style and pose behavior; generate.
3. **Result:** review the generated images and listing text; export or start another item.

Initial action contracts to review:

| Action | Intended result | Rules to decide before implementation |
| --- | --- | --- |
| Choose a photo | Opens the file picker; mobile may offer camera capture | Supported formats, size limit, rejection feedback, camera behavior |
| Replace photo | Reopens photo selection and replaces the current temporary garment | Confirm whether the old preview is discarded immediately |
| Remove photo | Clears the current garment and its preview | Decide whether confirmation is needed; it should be reversible before generation if practical |
| Continue | Moves to configuration only when a valid preview is ready | Preserve the selected file when going back |
| Select a model | Makes that model the target for this generation | Show one unmistakable selected state; decide default recommendation rules |
| Choose a style | Saves one style choice | Decide allowed values and whether defaults come from the model |
| Generate images | Starts one generation job and shows progress | Prevent duplicate submissions; define cancel, retry, timeout, and failure behavior |
| Back | Returns to the previous stage | Preserve current choices unless the user explicitly resets |
| Copy listing | Copies the complete chosen listing text | Define behavior when clipboard access fails and show a clear confirmation |
| Download images | Saves the selected output or a pack locally | Decide format, file names, and partial-failure behavior |
| Start another item | Clears temporary garment and result state, then returns to photo selection | Explain what will be discarded; only confirm if recovery is not possible |

Every screen must be designed for first use, normal use, missing data, invalid input, processing, failure, retry, and return navigation. Detailed tasks are in [`app/studio/TODO.md`](app/studio/TODO.md).

### Model library (`/models`)

The library contains reusable model profiles and should make readiness obvious without overwhelming the user. The list, empty state, add flow, edit flow, activation rules, and deletion behavior all require design review.

Candidate actions are **Add model**, **Open model**, **Set active**, and **Delete model**. Do not render every action as a prominent button on each card. Decide which actions belong on the detail page or a contextual menu. The behavior and safety rules are tracked in [`app/models/TODO.md`](app/models/TODO.md).

### Model detail (`/models/[id]`)

The detail destination owns the model's identity, attributes, default pose, and pose library. Candidate actions include **Edit details**, **Add pose**, **Replace pose**, **Set as default**, and **Remove pose**. Make destructive actions distinct and recoverable where practical. See [`app/models/[id]/TODO.md`](app/models/[id]/TODO.md).

### Results (`/results`)

The result destination should show one result clearly, make additional results easy to inspect, and put the most common export action first. The designer must decide whether results are a dedicated route, a Studio stage, or both. Avoid repeating export controls in multiple places. See [`app/results/TODO.md`](app/results/TODO.md).

## 5. Button and action design contract

Before implementing any button, complete an action record with:

- Screen and user goal.
- Exact English label and control type.
- Preconditions and disabled explanation.
- Single action performed and data changed.
- Loading state and duplicate-submission behavior.
- Success feedback and resulting location.
- Failure feedback and recovery path.
- Whether data is discarded, persisted, copied, or downloaded.
- Keyboard, screen reader, focus, and touch behavior.

Use one primary action per workflow screen. Secondary actions should be less prominent and shown only where useful. The largest button must represent the most likely next step, not a destructive action. Do not use icon-only controls for important actions.

## 6. Front-end organization

```text
app/
├── layout.tsx                   # Root metadata, English document, shared frame
├── page.tsx                     # Redirect to /studio
├── globals.css                  # Tailwind import, tokens, base and frame styles
├── studio/
│   ├── page.tsx
│   └── TODO.md
├── models/
│   ├── page.tsx
│   ├── TODO.md
│   └── [id]/
│       ├── page.tsx
│       └── TODO.md
└── results/
    ├── page.tsx
    └── TODO.md

src/
├── components/
│   ├── layout/                  # Shared navigation and layout primitives
│   └── mobile/                  # Current workflow prototype, to be redesigned
├── store/                      # UI/session state only; review persistence boundaries
├── lib/                        # Future typed API, validation, and shared helpers
├── hooks/                      # Future client lifecycle and browser integration hooks
├── types/                      # Future domain and API types
└── workers/                    # Future isolated image processing, if justified
```

Keep route files focused on composition. Keep interactive state in small Client Components; prefer Server Components for static route shells and metadata. Do not create empty abstractions solely to match a planned diagram. Introduce each module when its associated TODO is ready to be implemented.

## 7. State and file lifecycle

The prototype currently places browser `File` objects and object URLs in a Zustand store. This must be reviewed before real uploads are implemented.

Required future rules:

- Define whether temporary image bytes live in memory, IndexedDB, or an upload service.
- Revoke every object URL when its preview is replaced, removed, or no longer needed.
- Prevent temporary image data from leaking into persistent stores or logs.
- Reset generation state and garment state together when starting a new item.
- Preserve the current draft when navigating backward within the workflow.
- Make cleanup behavior explicit on refresh, tab close, failed generation, and new item.
- Use typed job states such as `idle`, `queued`, `processing`, `succeeded`, `failed`, and `cancelled` once a real API exists.

See [`src/store/TODO.md`](src/store/TODO.md) before changing the stores.

## 8. Accessibility, responsive behavior, and copy

- Use real buttons for actions and links for navigation.
- Associate every input with a visible label and useful error message.
- Keep all actions keyboard-operable with visible focus.
- Announce generation progress and completion through an appropriate live region.
- Do not rely on color alone for selection or status.
- Respect reduced motion and device safe-area insets.
- Keep primary touch targets at least 56 px high; use 64 px for the main workflow action where layout permits.
- Use short, concrete English labels and avoid duplicate controls.

## 9. Delivery sequence

The project-wide plan in [`TODO.md`](TODO.md) is the source of sequencing. Work one unchecked subtask at a time with design review before feature implementation. A TODO is complete only when its acceptance notes are met; mock behavior must be labeled and must not be mistaken for a real service.

## 10. Current design and interaction decisions (supersedes tentative notes above)

### Visual direction: vintage resale, green and pink

Use the uploaded Dress Me logo as the brand anchor. The interface should feel like a carefully arranged vintage-resale wardrobe: warm and tactile, clear enough for repeated daily use, and not a replica of Vinted's logo or screens.

| Token | Value | Use |
| --- | --- | --- |
| Forest green | `#315D46` | Primary actions, links, active route, selected model |
| Deep green | `#244734` | Hover and pressed primary action |
| Dusty pink | `#D98699` | Small highlights, selection underline, gentle emphasis |
| Pale pink | `#F7E8EB` | Hover surfaces and subtle accent backgrounds |
| Warm cream | `#F5F0E7` | App canvas |
| Paper | `#FFFDF8` | Cards, fields, dialogs |
| Warm ink | `#2F3029` | Main text |
| Muted ink | `#737166` | Supporting text |

- Use an editorial serif for page titles and card names, with a clean sans-serif for forms, navigation, metadata, and buttons.
- Use warm paper surfaces, fine beige borders, restrained shadows, rounded but not pill-shaped cards, and large product/model photos.
- Green is the main action color; pink is an accent, not a second competing primary-action color.
- Keep buttons at least 56 px high and make the stage's primary action 64 px where the layout permits.
- Keep page copy in English. Use visible words with any icon; do not make important actions icon-only.
- Mobile is the design baseline. The model library becomes a photo grid on wide screens; Results uses a selectable list and a larger preview/editor panel.

### Action inventory and outcomes

| Destination | Control | Preconditions | Outcome and recovery |
| --- | --- | --- | --- |
| Studio photo | Choose/replace photo | JPG, PNG, or WEBP; <=25 MB | Preview replaces the old photo only after accepted selection; rejected/unreadable files show an inline error; cancel preserves current photo. |
| Studio photo | Remove photo | A photo is selected | Revokes its preview and clears the current garment draft; does not touch models or result history. |
| Studio photo | Choose a model | Valid preview exists | Advances to setup; otherwise disabled. |
| Studio setup | Choose model | Profile is active and has a default reference pose | Selects exactly one model; incomplete/inactive profiles are repaired from Models. |
| Studio setup | Choose style | Always available | Stores Casual, Chic, Streetwear, or Business and preserves it on Back. |
| Studio setup | Back | Setup stage | Returns to photo with the selected photo intact. |
| Studio setup | Continue | Ready model selected | Saves the selected setup and explains that try-on generation needs a connected provider. |
| Studio finish | Review results | Sample handoff complete | Opens Results without removing prior history. |
| Studio finish | Start another item | Sample handoff complete | Clears only the current garment and returns to photo selection. |
| Model library | Add a model | Always available | Opens a focused form; name required; photo optional; creates a profile and opens its detail page. Duplicate names are allowed. |
| Model card | Manage model | Profile exists | Opens detail. Ready status requires active + default pose; incomplete profiles remain editable. |
| Model detail | Edit profile | Detail exists | Save applies the form; Cancel discards unsaved form values. Profile edits preserve poses. |
| Model detail | Use in Studio | Model exists | Selects the model and opens Studio. Studio still requires a garment photo. |
| Model detail | Add pose | Profile exists | Accepts supported image; one photo per angle. First pose becomes default; choosing an existing angle replaces that angle. |
| Pose menu | Replace photo | A photo is selected and valid | Updates only that pose after decoding succeeds; failure leaves the old photo unchanged. |
| Pose menu | Set as default | Pose is not already default | Moves the single default marker. |
| Pose menu | Remove pose | Pose exists | Confirmation is shown. Default cannot be removed while another pose exists until a new default is chosen; removing the only pose makes the profile incomplete. |
| Model detail | Delete model | Profile exists | Confirmation explains profile/photo removal; cancel preserves it; confirm removes it and returns to the library. Result snapshots remain. |
| Results list | Search | Any saved results | Filters model, style, pose, and listing title; empty search result offers Clear search. |
| Results list | Sort | Any saved results | Sorts newest, oldest, model name, or style. Newest is default. |
| Results list | Select result | Any visible result | Shows one selected preview and its listing editor; selected state is visible and semantic. |
| Results editor | Edit title/description/tags | A result is selected | Each field saves to local browser storage as it changes. Copy always uses current field values. |
| Results editor | Copy listing | A result is selected | Copies title + description + tags; clipboard denial displays a read-only selectable fallback. |
| Results editor | Download image | A preview is available | Downloads only the selected preview with a model/pose filename; no pack/ZIP control is shown. |
| Results | New garment | Always available | Opens Studio while preserving results and model library. |

### Data and online boundary

The model and result stores use versioned local-storage keys; model reference images are resized/compressed before storage. These records are browser-local, are not encrypted or backed up, and do not follow the user to another device. Garment uploads and object URLs remain in memory and can be lost on refresh. The prototype must display these limits plainly.

Before an online deployment, implement owner authentication, protected durable file/database storage, backup and deletion policy, and storage-quota recovery. The current Gemini integration is synchronous and supports a retryable error state; cancellation and durable job recovery remain future work. Selected images are sent to Google only when the user starts generation.
