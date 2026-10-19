# Model Library - Interaction Specification and Checklist

## Product rules

- [x] A model is a reusable profile plus up to one reference photo per supported pose angle.
- [x] Name is required. Profile, size, skin tone, and default style are editable; size/tone may be left unset.
- [x] Pose angles are front standing, profile, three-quarter, sitting, and back. One pose is designated the default when photos exist.
- [x] Ready means active and has a default photo. Inactive and incomplete profiles remain visible and repairable. Search/filter is deferred because this single-owner library should stay small; the photo cards are scannable without another control.
- [x] Profiles and compressed photos persist in the current browser; no cross-device synchronization is claimed.

## Library actions

- [x] The populated library shows photo, name, readiness, size, pose count, and one Manage model link.
- [x] Empty state has a single dominant Add your first model action.
- [x] Add a model opens one focused form; create validates the name and optional photo, then opens the new detail page.
- [x] Duplicate names are allowed because profiles may represent the same person in different sets.
- [x] Selecting a card opens management; using a model in Studio is on its detail page.
- [x] Edit profile changes profile fields and active status without replacing poses.

## Delete behavior

- [x] Delete is located only in model detail, behind a confirmation that explains local profile/photo removal.
- [x] Cancel keeps the profile; confirm removes it and returns to the library. Saved result snapshots are not edited.

## Online-release work

- [ ] Replace local storage with protected, backed-up storage and define recovery for quota and device loss.
- [ ] Decide whether duplicate detection beyond names is useful for this personal library.
