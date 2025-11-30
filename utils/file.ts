/**
 * Reads a File object and returns a Promise that resolves with the Base64 Data URL.
 * Handles errors during file reading.
 */
export const readImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('The selected file is not a valid image.'));
      return;
    }

    const reader = new FileReader();
    
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file data.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error occurred while reading the file.'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Extracts the first image file from a DragEvent or ClipboardEvent.
 * Returns the File object or null if no image is found.
 */
export const extractImageFile = (items: DataTransferItemList | undefined): File | null => {
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) {
      return items[i].getAsFile();
    }
  }
  return null;
};
