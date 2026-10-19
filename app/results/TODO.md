# Results - Interaction Specification and Checklist

## Product and retention decisions

- [x] Results is a dedicated route and is also the final Studio handoff destination.
- [x] History is stored in this browser and ordered newest-first by default; sort options are newest, oldest, model name, and style.
- [x] Search matches model, style, pose, and listing title. Empty, no-match, selected, and unavailable-preview states are represented.
- [x] A result is a sample preview plus editable title, description, and tags. No factual listing values are presented as verified.

## Review and edit actions

- [x] The list selects one result; selected state is visible and announced.
- [x] The selected preview includes model and pose description. Smaller screen sizes use a vertical list and detail panel.
- [x] Listing edits persist immediately in browser storage and are reviewable before copy.
- [x] Copy listing copies title, description, and tags together. Clipboard denial shows a selectable manual-copy fallback.
- [x] Download image downloads the selected preview with a model/pose filename. No ZIP or multi-image pack is offered yet.
- [x] New garment links to Studio without clearing saved result history.

## Online-generation work still required

- [ ] Replace sample images with provider output; add failed/partial job state and retry for real jobs.
- [ ] Add durable protected result storage, retention/deletion rules, backup/export, and storage-quota recovery.
- [ ] Decide whether ZIP export is needed after real output volume and target browser are known.
