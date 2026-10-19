# Model Detail - Interaction Specification and Checklist

## Profile

- [x] Detail shows name, profile attributes, size, and pose count; a missing ID has a direct return to the library.
- [x] Edit profile provides Save and Cancel; required name is validated and existing photos are preserved.
- [x] Active/inactive is editable. Inactive profiles remain in the library but are unavailable in Studio.
- [x] Use in Studio selects the model and opens the garment workflow.

## Pose collection

- [x] Each card has a large preview, human-readable angle, default status, and one Manage menu.
- [x] Add pose validates JPG/PNG/WEBP and 25 MB limit. Existing angle selection replaces that angle; a first pose becomes default.
- [x] Replace changes only the chosen angle after the new photo has been read successfully.
- [x] Set as default moves the default marker and makes the profile Studio-ready.
- [x] Remove requires confirmation. The default cannot be removed while other poses exist until another default is selected; removing the only pose leaves an incomplete profile that can be repaired.
- [x] Removing the profile is available only in the detail page.

## Online-release work

- [ ] Move pose files from browser local storage to protected durable storage and add a storage quota/backup recovery flow.
- [ ] Add image cropping only if the selected try-on provider requires manual framing.
