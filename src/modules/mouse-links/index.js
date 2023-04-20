import { addUIStyles } from '../utils';
import styles from './styles.css';

/**
 * Return an anchor element with the given text and href.
 *
 * @param {string}  text          Text to use for link.
 * @param {string}  href          URL to link to.
 * @param {boolean} encodeAsSpace Encode spaces as %20.
 *
 * @return {string} HTML for link.
 */
const makeLink = (text, href, encodeAsSpace) => {
  if (encodeAsSpace) {
    href = href.replace(/_/g, '%20');
  } else {
    href = href.replace(/\s/g, '_');
  }

  href = href.replace(/\$/g, '_');

  return `<a href="${href}" target="_mouse" class="mousehuntActionButton tiny"><span>${text}</span></a>`;
};

/**
 * Get the markup for the mouse links.
 *
 * @param {string} name The name of the mouse.
 *
 * @return {string} The markup for the mouse links.
 */
const getLinkMarkup = (name) => {
  return makeLink('MHCT AR', `https://www.mhct.win/attractions.php?mouse$name=${name}`, true) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${name}_Mouse`) +
    makeLink('mhdb', `https://dbgames.info/mousehunt/mice/${name}_Mouse`);
};

/**
 * Add links to the mouse overlay.
 */
const addLinks = () => {
  const title = document.querySelector('.mouseView-title');
  if (! title) {
    return;
  }

  const currentLinks = document.querySelector('.mh-mouse-links');
  if (currentLinks) {
    currentLinks.remove();
  }

  const div = document.createElement('div');
  div.classList.add('mh-mouse-links');
  div.innerHTML = getLinkMarkup(title.innerText);
  title.parentNode.insertBefore(div, title);

  // Move the values into the main text.
  const values = document.querySelector('.mouseView-values');
  const desc = document.querySelector('.mouseView-descriptionContainer');
  if (values && desc) {
    // insert as first child of desc
    desc.insertBefore(values, desc.firstChild);
  }
};

/**
 * Add links to the mouse details on the map.
 */
const addMapLinks = () => {
  const overlayClasses = document.getElementById('overlayPopup').classList;
  if (! overlayClasses.contains('treasureMapPopup')) {
    return;
  }

  const mouseIcon = document.querySelectorAll('.treasureMapView-goals-group-goal');
  if (! mouseIcon || mouseIcon.length === 0) {
    setTimeout(addMapLinks, 500);
    return;
  }

  const mapViewClasses = document.querySelector('.treasureMapView.treasure');
  if (! mapViewClasses) {
    return;
  }

  if (mapViewClasses.classList.value.indexOf('scavenger_hunt') !== -1) {
    return;
  }

  mouseIcon.forEach((mouse) => {
    const mouseType = mouse.classList.value
      .replace('treasureMapView-goals-group-goal ', '')
      .replace(' mouse', '')
      .trim();

    mouse.addEventListener('click', () => {
      const title = document.querySelector('.treasureMapView-highlight-name');
      if (! title) {
        return;
      }

      title.classList.add('mh-mouse-links-map-name');

      title.addEventListener('click', () => {
        hg.views.MouseView.show(mouseType);
      });

      title.setAttribute('data-mouse-id', mouseType);

      const div = document.createElement('div');
      div.classList.add('mh-mouse-links-map');
      div.innerHTML = getLinkMarkup(title.innerText);

      const envs = document.querySelector('.treasureMapView-highlight-environments');
      if (envs) {
        envs.parentNode.insertBefore(div, envs.nextSibling);
      }
    });
  });
};

const updateMouseView = async () => {
  const mouseView = document.querySelector('#overlayPopup .mouseView');
  if (! mouseView) {
    return;
  }

  const mouseId = mouseView.getAttribute('data-mouse-id');
  if (! mouseId) {
    return;
  }

  addLinks();
  let mhctjson = [];

  // check if the attraction rates are cached
  const cachedAr = sessionStorage.getItem(`mhct-ar-${mouseId}`);
  if (cachedAr) {
    mhctjson = JSON.parse(cachedAr);
    if (! mhctjson || mhctjson.length === 0) {
      return;
    }
  } else {
    const mhctdata = await fetch(`https://api.mouse.rip/mhct/${mouseId}`);
    mhctjson = await mhctdata.json();

    if (! mhctjson || mhctjson.length === 0) {
      return;
    }

    sessionStorage.setItem(`mhct-ar-${mouseId}`, JSON.stringify(mhctjson));
  }

  mouseView.classList.add('mouseview-has-mhct');

  const group = document.querySelector('.mouseView-group');
  if (group) {
    group.classList.add('mouseview-title-group');

    const descContainer = document.querySelector('.mouseView-descriptionContainer');
    if (descContainer) {
      if (descContainer.childNodes.length > 1) {
        descContainer.insertBefore(group, descContainer.childNodes[1]);
      } else {
        descContainer.appendChild(group);
      }
    }
  }

  const container = mouseView.querySelector('.mouseView-contentContainer');
  if (! container) {
    return;
  }

  const imageContainer = mouseView.querySelector('.mouseView-imageContainer');
  if (imageContainer) {
    const movedContainer = makeElement('div', 'mouseView-movedContainer');

    const statsContainer = mouseView.querySelector('.mouseView-statsContainer');
    if (statsContainer) {
      movedContainer.appendChild(statsContainer);
    }

    const weaknessContainer = mouseView.querySelector('.mouseView-weaknessContainer');
    if (weaknessContainer) {
      movedContainer.appendChild(weaknessContainer);
    }

    imageContainer.appendChild(movedContainer);
  }

  const arWrapper = makeElement('div', 'ar-wrapper');
  makeElement('div', 'ar-header', 'Attraction Rates', arWrapper);
  const miceArWrapper = makeElement('div', 'mice-ar-wrapper');

  mhctjson.forEach((mouseAr) => {
    const mouseArWrapper = makeElement('div', 'mouse-ar-wrapper');

    makeElement('div', 'location', mouseAr.location, mouseArWrapper);

    if (mouseAr.stage) {
      makeElement('div', 'stage', mouseAr.stage, mouseArWrapper);
    }

    makeElement('div', 'cheese', mouseAr.cheese, mouseArWrapper);
    makeElement('div', 'rate', `${(mouseAr.rate / 100).toFixed(2)}%`, mouseArWrapper);

    miceArWrapper.appendChild(mouseArWrapper);
  });

  arWrapper.appendChild(miceArWrapper);
  container.appendChild(arWrapper);
}

const main = () => {
  onOverlayChange({ mouse: { show: updateMouseView } });
  onOverlayChange({ show: addMapLinks });
};

export default function mouseLinks() {
  addUIStyles(styles);

  main();
}
