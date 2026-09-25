/**
 * Utility for preprocessing images before OCR.
 * Converts colored images with noisy backgrounds (like KTPs) into high-contrast B&W images.
 */
export async function preprocessImageForOCR(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        // Resize image if it's too large to ensure base64 string is under 1MB (OCR.space free tier limit)
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          const ratio = MAX_WIDTH / width;
          width = MAX_WIDTH;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw original image (keep colors intact for OCR.space Engine 2)
        ctx.drawImage(img, 0, 0, width, height);

        // Return the Data URL (base64) of the compressed image
        // Use 0.7 quality to significantly reduce base64 size while preserving readability
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image for preprocessing"));
      };

      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}
