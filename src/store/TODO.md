# Client State and Data Lifecycle - Decisions and Checklist

## Implemented front-end state

- [x] Model and pose domain types have constrained gender/style/pose values; result fields capture image, model, style, pose, date, and editable listing text.
- [x] Model profiles, compressed reference image data, result history, and listing edits use versioned browser local-storage keys and are rehydrated after the client mounts to avoid server/client markup mismatch.
- [x] Model library state is separate from the in-memory garment session; result history remains separate from temporary generation activity.
- [x] Stable browser-generated IDs and storage key version suffixes are used for this prototype.
- [x] Object URLs are temporary preview handles and are revoked when replacing a garment image or clearing the session.
- [x] Starting another item clears only the temporary garment; saved results and models remain.
- [x] The UI explicitly states that the garment draft is session-only and model/result data remains in this browser.

## Online release requirements

- [ ] Move model photos and result images from browser local storage to authenticated, durable storage with backup and deletion rules.
- [ ] Add storage-quota detection and a user-facing export/recovery flow before relying on browser persistence for a large library.
- [ ] Decide and implement a schema migration strategy for model/result storage versions.
- [ ] Define a typed server request/response contract for a selected generation provider.
- [ ] Add real job states, cancellation, retry, timeout, provider/network failure, partial results, and stale-job recovery after a backend exists.
- [ ] Keep provider secrets on a trusted server; do not put private keys in the client.
- [ ] Choose authenticated private hosting and cross-device access policy before calling this app online-ready.
