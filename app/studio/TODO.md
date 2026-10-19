# Studio - Interaction Specification and Checklist

## Flow decisions

- [x] One `/studio` route with three stages: garment photo, model and style, generated result handoff.
- [x] The first-time and repeat paths use the same clear three-step flow.
- [x] Model selection is manual; only active profiles with a default reference photo are offered.
- [x] Style choices are Casual, Chic, Streetwear, and Business. The chosen value is retained while moving between stages.
- [x] Results are stored in the Results destination. Starting another item clears the garment draft but preserves saved results and model profiles.
- [x] The primary action is one large bottom action per stage; Back is secondary. Generation uses the server-side Gemini route and explains that selected photos are sent to Google.

## Stage 1 - Garment photo

- [x] Separate camera capture and gallery selection actions accept JPG, PNG, and WEBP up to 25 MB.
- [x] The selected photo is previewed, can be replaced, and can be removed without a second confirmation.
- [x] Unsupported, oversized, and unreadable files receive an inline announced message; cancelling the picker leaves the current photo intact.
- [x] Continue is disabled without a selected photo. Object URLs are revoked on replacement and reset.
- [x] The garment photo remains in memory for the current session; refresh recovery is intentionally not promised.

## Stage 2 - Model and style

- [x] Large cards use a visible selected state. An incomplete/inactive library profile is not offered as ready.
- [x] An empty ready-model list links to model management.
- [x] Generate is disabled until a valid model is selected. Back preserves the photo and selected configuration.
- [x] Generation uses the selected model's default reference pose.

## Stage 3 - Processing and handoff

- [x] The screen shows real in-progress, retryable failure, and completed generation states.
- [x] The server calls Gemini 3.1 Flash Image with the garment photo and the selected model's default reference pose.
- [x] A generated result is appended to browser history and the primary action opens Results; Start another item clears only the temporary garment.

## Online-generation work still required

- [ ] Add provider consent, job state, cancellation, timeout, retry, network failure, partial completion, and provider failure states when a real service is selected.
- [ ] Add durable, private image storage and retention controls before exposing this app online.
- [ ] Decide whether the actual provider returns usable progress; never show made-up progress percentages.
