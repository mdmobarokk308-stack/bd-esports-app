/**
 * Image compression utility to convert camera & gallery photos into lightweight,
 * high-resolution 640px JPEG data URLs (typically ~35KB - 60KB).
 * Prevents LocalStorage QuotaExceededError and HTTP 413 Payload Too Large errors.
 */

export function compressImageFile(
  file: File,
  maxWidth = 640,
  maxHeight = 640,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        resolve('');
        return;
      }
      // If SVG or very small, return as-is
      if (file.type.includes('svg') || file.size < 40 * 1024) {
        resolve(src);
        return;
      }
      compressImageSource(src, maxWidth, maxHeight, quality).then(resolve);
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export function compressImageSource(
  src: string,
  maxWidth = 640,
  maxHeight = 640,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    if (!src || !src.startsWith('data:image/')) {
      resolve(src);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.fillStyle = '#0a0e17';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}
