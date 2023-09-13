const addConsolationPrizes = () => {
  const consolationButton = document.querySelector('.treasureMapView-consolationPrize-message');
  if (! consolationButton ||
    ! window.mhmapper?.mapData?.has_consolation_prizes ||
    ! window.mhmapper?.mapData?.consolation_prizes
  ) {
    return;
  }

  const existing = document.querySelector('.mh-mapper-consolation-prizes');
  if (existing) {
    existing.remove();
  }

  const prizeWrapper = makeElement('div', 'mh-mapper-consolation-prizes');
  for (const prize of window.mhmapper.mapData.consolation_prizes) {
    const prizeDiv = makeElement('div', 'mh-mapper-consolation-prize');
    const prizeImg = makeElement('img', 'mh-mapper-consolation-prize');
    prizeImg.src = prize.thumb;
    prizeDiv.appendChild(prizeImg);
    makeElement('div', 'mh-mapper-consolation-prize-text', `${prize.quantity} ${prize.name}`, prizeDiv);

    prizeWrapper.appendChild(prizeDiv);
  }

  consolationButton.parentElement.appendChild(prizeWrapper);
};

export default addConsolationPrizes;
