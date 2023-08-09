export default () => {
  /**
   * Get the mouse stats.
   *
   * @return {Object} The mouse stats.
   */
  const getMouseStats = async () => {
    const data = await doRequest(
      'managers/ajax/mice/mouse_list.php',
      {
        action: 'get_environment',
        category: user.environment_type, // eslint-disable-line no-undef
        user_id: user.user_id, // eslint-disable-line no-undef
        display_mode: 'stats',
        view: 'ViewMouseListEnvironments',
      }
    );

    // Grab the data from the response.
    const mouseData = data?.mouse_list_category?.subgroups[0]?.mice;

    // Reorder by the num_catches key.
    mouseData.sort((a, b) => {
      return b.num_catches - a.num_catches;
    });

    // Return the data.
    return mouseData ? mouseData : [];
  };

  /**
   * Build the markup for the stats.
   *
   * @param {Object} mouseData The mouse data.
   *
   * @return {Node} The node to append.
   */
  const buildMouseMarkup = (mouseData) => {
    // Fallbacks for mouse data.
    const mouse = Object.assign({}, {
      name: '',
      type: '',
      image: '',
      crown: 'none',
      num_catches: 0,
    }, mouseData);

    const mouseEl = document.createElement('a');
    mouseEl.classList.add('mh-catch-stats');

    mouseEl.title = mouse.name;
    mouseEl.addEventListener('click', () => {
      if ('undefined' !== hg?.views?.MouseView?.show) { // eslint-disable-line no-undef
        hg.views.MouseView.show(mouse.type); // eslint-disable-line no-undef
      }
    });

    // Create the image element.
    const image = document.createElement('div');
    image.classList.add('mh-catch-stats-image');
    image.style.backgroundImage = `url('${mouse.image}')`;

    // If the mouse has a crown, add it.
    if (mouse.crown && 'none' !== mouse.crown) {
      const crown = document.createElement('div');
      crown.classList.add('mh-catch-stats-crown');
      crown.style.backgroundImage = `url('https://www.mousehuntgame.com/images/ui/crowns/crown_${mouse.crown}.png')`;
      image.appendChild(crown);
    }

    // Create the name element.
    const name = document.createElement('div');
    name.classList.add('mh-catch-stats-name');
    name.innerText = mouse.name;

    // Create a wrapper for the name and image.
    const imageNameContainer = document.createElement('div');
    imageNameContainer.appendChild(image);
    imageNameContainer.appendChild(name);

    // Create the catches element.
    const catches = document.createElement('div');
    catches.classList.add('mh-catch-stats-catches');
    catches.innerText = mouse.num_catches;

    mouseEl.appendChild(imageNameContainer);
    mouseEl.appendChild(catches);

    return mouseEl;
  };

  /**
   * Show the stat modal.
   */
  const showModal = async () => {
    // Remove the existing modal.
    const existing = document.getElementById('mh-catch-stats');
    if (existing) {
      existing.remove();
    }

    // Create the modal.
    const modalWrapper = document.createElement('div');
    modalWrapper.id = 'mh-catch-stats';

    // Create the wrapper.
    const modal = document.createElement('div');
    modal.classList.add('mh-catch-stats-wrapper');

    // Create the header.
    const header = document.createElement('div');
    header.classList.add('mh-catch-stats-header');

    // Add the title;
    const title = document.createElement('h1');
    title.innerText = 'Mouse Catch Stats';
    header.appendChild(title);

    // Create a close button icon.
    const closeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    closeIcon.classList.add('mh-catch-stats-close');
    closeIcon.setAttribute('viewBox', '0 0 24 24');
    closeIcon.setAttribute('width', '18');
    closeIcon.setAttribute('height', '18');
    closeIcon.setAttribute('fill', 'none');
    closeIcon.setAttribute('stroke', 'currentColor');
    closeIcon.setAttribute('stroke-width', '1.5');

    // Create the path.
    const closePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    closePath.setAttribute('d', 'M18 6L6 18M6 6l12 12');
    closeIcon.appendChild(closePath);

    // Close the modal when the icon is clicked.
    closeIcon.addEventListener('click', () => {
      modalWrapper.remove();
    });

    // Append the button.
    header.appendChild(closeIcon);

    // Add the header to the modal.
    modal.appendChild(header);

    // Make the mouse stats table.
    const mouseBody = document.createElement('div');
    mouseBody.classList.add('mh-catch-stats-body');

    // Get the mouse stats.
    const mouseStats = await getMouseStats();

    // Loop through the stats and add them to the modal.
    mouseStats.forEach((mouseData) => {
      mouseBody.appendChild(buildMouseMarkup(mouseData, mouseBody));
    });

    // Add the mouse stats to the modal.
    modal.appendChild(mouseBody);

    // Add the modal to the wrapper.
    modalWrapper.appendChild(modal);

    // Add the wrapper to the body.
    document.body.appendChild(modalWrapper);

    // Make the modal draggable.
    makeElementDraggable('#mh-catch-stats', '.mh-catch-stats-header', 25, 25, 'mh-catch-stats-position');
  };

  addStyles(`#mh-catch-stats {
    position: absolute;
    top: 25px;
    left: 25px;
    z-index: 50;
  }

  @media screen and (prefers-reduced-motion: reduce) {
  .mh-catch-stats-wrapper {
    transition: none;
  }
  }

  .mh-catch-stats-wrapper {
    width: 275px;
    background: #f6f3eb;
    border: 1px solid #534022;
    box-shadow: 1px 1px 1px 0 #9d917f, 1px 3px 5px 0 #6c6c6c;
    transition: box-shadow .25s;
  }

  .mh-is-dragging .mh-catch-stats-wrapper {
    box-shadow: 1px 1px 1px 0 #9d917f, 0 7px 9px 2px #6c6c6c;
  }

  .mh-catch-stats-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    color: #f6f3eb;
    cursor: grab;
    background-color: #926944;
    border-bottom: 1px solid #ceb7a6;
  }

  .mh-catch-stats-header h1 {
    color: #f6f3eb;
  }

  .mh-catch-stats-close {
    cursor: pointer;
  }

  .mh-catch-stats-close:hover, .mh-catch-stats-close:focus {
    color: #926944;
    background-color: #eee;
    border-radius: 50%;
    outline: 1px solid #ccc;
  }

  .mh-catch-stats-body {
    max-height: 90vh;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  .mh-catch-stats-wrapper .mh-catch-stats:nth-child(odd) {
    background-color: #e8e3d7;
  }

  .mh-catch-stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    color: #000;
  }

  .mh-catch-stats:hover,
  .mh-catch-stats-wrapper .mh-catch-stats:nth-child(odd):hover, .mh-catch-stats:focus,
  .mh-catch-stats-wrapper .mh-catch-stats:nth-child(odd):focus {
    color: #665f5f;
    text-decoration: none;
    background-color: #eee;
    outline: 1px solid #ccc;
  }

  .mh-catch-stats-image {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 40px;
    vertical-align: middle;
    background-repeat: no-repeat;
    background-size: contain;
    border-radius: 2px;
    box-shadow: 1px 1px 1px #999;
  }

  .mh-catch-stats-crown {
    position: absolute;
    right: -5px;
    bottom: -5px;
    width: 20px;
    height: 20px;
    background-color: #fff;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 80%;
    border: 1px solid #333;
    border-radius: 50%;
  }

  .mh-catch-stats-name {
    display: inline-block;
    padding-left: 10px;
    vertical-align: middle;
  }

  .mh-catch-stats-catches {
    padding-right: 5px;
  }
  `);

  addSubmenuItem({
    menu: 'mice',
    label: 'Location Catch Stats',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/prize_shoppe.png?',
    callback: showModal
  });
};
