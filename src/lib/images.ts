export function readImageForLocalUse(file: File): Promise<string> {
  console.debug('[DressMe images] reading image', { name: file.name, type: file.type, bytes: file.size });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      console.error('[DressMe images] FileReader failed', reader.error);
      reject(new Error('This image could not be read. Try another file.'));
    };
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('This image could not be opened. Try another file.'));
      image.onload = () => {
        const scale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) return reject(new Error('Your browser could not process this image.'));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        try {
          const output = canvas.toDataURL('image/jpeg', 0.72);
          console.debug('[DressMe images] image ready', { width: canvas.width, height: canvas.height, outputLength: output.length });
          resolve(output);
        } catch (cause) {
          console.error('[DressMe images] canvas export failed', cause);
          reject(new Error('Your browser could not save this image. Try a smaller photo.'));
        }
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function isSupportedImage(file: File): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 25 * 1024 * 1024;
}

export async function validateImageFile(file: File): Promise<void> {
  if (!isSupportedImage(file)) throw new Error('Choose a JPG, PNG, or WEBP image smaller than 25 MB.');
  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => image.naturalWidth > 0 && image.naturalHeight > 0
        ? resolve()
        : reject(new Error('This image has no readable dimensions. Choose another photo.'));
      image.onerror = () => reject(new Error('This image could not be opened. Choose another photo.'));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
