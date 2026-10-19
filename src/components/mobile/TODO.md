# Studio Workflow Components - Checklist

## Shared rules

- [x] Components have one stage responsibility and use semantic links/buttons with English labels.
- [x] Each step has one dominant action; secondary Back/Remove actions are visually quiet.
- [x] Controls meet the large touch-target baseline, safe-area spacing, focus, and reduced-motion rules.

## UploadStep

- [x] Camera/file picker supports JPG, PNG, WEBP up to 25 MB and has a visible preview.
- [x] Replace/remove, invalid input, unreadable photo, empty picker, and no-photo disabled state are defined.
- [x] Object URL cleanup occurs on replacement and session reset.
- [x] Garment data is session memory only and is not misrepresented as saved after refresh.

## ConfigStep

- [x] Ready models appear as large selectable cards; selected state is both visual and semantic.
- [x] Empty-ready-library state links to Models; generate requires a selected active model with a default pose.
- [x] Style values are editable and preserved when navigating Back.
- [x] Pose selection uses the default plus up to two additional references, avoiding a long toggle list.

## ResultStep

- [x] This is a sample-processing handoff, not the saved result editor; saved result edits and exports live on `/results`.
- [x] The loading state is indeterminate, labeled as sample output, and does not invent provider progress.
- [x] Review results and Start another item have separate outcomes; starting over does not delete previous results.

## Remaining after provider selection

- [ ] Connect real generation and add cancellation, retry, timeout, network, partial, and provider-failure states.
