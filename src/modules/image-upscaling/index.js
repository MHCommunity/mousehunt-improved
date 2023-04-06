import { addUIStyles } from '../../utils';
import styles from './styles.css';
import mapping from './mapping.json';

const getNewUrl = (src) => {
  if (! src) {
    return;
  }

  const searchUrl = src.replace('https://www.mousehuntgame.com/images/', '');

  const newUrl = mapping[ searchUrl ];
  if (! newUrl) {
    return;
  }

  if (newUrl.includes('https://')) {
    return newUrl;
  }

  return `https://www.mousehuntgame.com/images/${newUrl}`;
};

const upscaleImages = () => {
  const images = document.querySelectorAll('img');
  if (! images) {
    return;
  }

  images.forEach((image) => {
    const src = image.getAttribute('src');
    if (! src) {
      return;
    }

    const newSrc = getNewUrl(src);
    if (! newSrc) {
      return;
    }

    image.setAttribute('src', newSrc);
  });

  const backgrounds = document.querySelectorAll('[style*="background-image"]');
  if (! backgrounds) {
    return;
  }

  backgrounds.forEach((background) => {
    const style = background.getAttribute('style');
    if (! style) {
      return;
    }

    // Check if the style contains a background-image
    if (! style.includes('background-image')) {
      return;
    }

    // Get the URL of the background-image
    const urls = style.match(/url\((.*?)\)/);
    if (! urls || ! urls[ 1 ]) {
      return;
    }

    const url = urls[ 1 ].replace(/['"]+/g, '');
    const newUrl = getNewUrl(url);
    if (! newUrl || newUrl === url) {
      return;
    }

    background.setAttribute('style', style.replace(urls[ 1 ], newUrl));
  });
};

export default () => {
  addUIStyles(styles);

  upscaleImages();

  // Observe the document for changes and upscale images when they are added.
  new MutationObserver(upscaleImages).observe(document, { childList: true, subtree: true });
};
