export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;

    const onLoaded = () => {
      resolve(image);
    };

    if (image.complete) {
      onLoaded();
    } else {
      image.onload = onLoaded;
      image.onerror = function () {
        console.error('Failed to load texture image:', url);
        reject();
      };
    }
  });
};
