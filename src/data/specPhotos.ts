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
  '653 Grand Canyon':                      '/media/quick-move-ins/653-grand-canyon.jpg',
  '2735 Granite Falls Drive (2026 Parade)': '/media/quick-move-ins/2735-granite-falls-drive.jpg',
  '2690 Granite Falls Drive':               '/media/quick-move-ins/2690-granite-falls-drive.jpg',
  '2784 Granite Falls Drive':               '/media/quick-move-ins/2784-granite-falls-drive.jpg',
  '5025 Eagle Creek Rd':                    '/media/quick-move-ins/5025-eagle-creek-rd.jpg',
  '5085 Eagle Creek Rd':                    '/media/quick-move-ins/5085-eagle-creek-rd.jpg',
  '5055 Eagle Creek Rd':                    '/media/quick-move-ins/5055-eagle-creek-rd.jpg',
  '209 N 4117 E':                           '/media/quick-move-ins/209-n-4117-e.jpg',
};
