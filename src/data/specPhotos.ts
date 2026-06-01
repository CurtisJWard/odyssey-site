// Spec home photos — manually maintained.
// Key: exact address string from _generatedSpecs.ts
// Value: path to image in /public/media/quick-move-ins/
//
// To add a photo:
//   1. Copy the image to public/media/quick-move-ins/<slug>.jpg
//   2. Add an entry below with the exact address from _generatedSpecs.ts
//   3. Commit and push — deploys automatically

export const specPhotos: Record<string, string> = {
  '661 Glacier Avenue': '/media/quick-move-ins/661-glacier-ave.jpg',
};
