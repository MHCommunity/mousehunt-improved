import { addModuleStyles, getSetting, onEvent, onRequest } from '@utils';

const run = async () => {
  const id = 'mh-improved-better-ui-skin-preview-base';
  const baseEl = document.querySelector('.trapImageView-layer.base');
  if (! baseEl || ! baseEl.style.backgroundImage) {
    return;
  }

  if (getSetting('experiments.trap-background', false)) {
    addModuleStyles(`.itembrowser-skin-image-wrapper {
      background-image: ${baseEl.style.backgroundImage}, linear-gradient(0deg, #eee2b4 0%, #b1e0d1 100%);
    }`, id, true);
  } else {
    addModuleStyles(`.itembrowser-skin-image-wrapper {
      background-image: ${baseEl.style.backgroundImage};
    }`, id, true);
  }
};

export default () => {
  onEvent('camp_page_toggle_blueprint', run);
  onRequest('users/changetrap.php', run);
};
