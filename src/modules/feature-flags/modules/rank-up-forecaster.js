import { addUIStyles, makeElement } from '@/utils';

const exportRankupForecasterData = () => {
  const allArea = localStorage.getItem('Chro-forecaster-all-area');
  const currentArea = localStorage.getItem('Chro-forecaster-current-area');
  const time = localStorage.getItem('Chro-forecaster-time');

  const data = {
    allArea,
    currentArea,
    time,
  };

  const dataStr = JSON.stringify(data);

  // encode the data to base64
  const base64 = btoa(dataStr);

  // create the link
  const link = document.createElement('a');
  const date = new Date();
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  link.download = `rank-up-forecaster-${dateString}.json`;
  link.href = `data:application/json;base64,${base64}`;
  link.click();
};

const importRankupForecassterData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (! file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (re) => {
      const contents = re.target.result;
      const data = JSON.parse(contents);

      localStorage.setItem('Chro-forecaster-all-area', data.allArea);
      localStorage.setItem('Chro-forecaster-current-area', data.currentArea);
      localStorage.setItem('Chro-forecaster-time', data.time);
    };

    reader.readAsText(file);
  });

  input.click();

  // re-click the points button to refresh the data
  const points = document.querySelector('.mousehuntHud-userStat-row.points');
  if (points) {
    points.click();
  }
};

const addRankupForecasterButtons = () => {
  const forecastOpen = document.querySelector('.mousehuntHud-userStat-row.points');
  if (! forecastOpen) {
    return;
  }

  forecastOpen.addEventListener('click', () => {
    setTimeout(() => {
      const rankup = document.querySelector('#forecaster-content-div');
      if (! rankup) {
        return;
      }

      const existing = document.querySelector('.mh-ui-forecaster-buttons');
      if (existing) {
        return;
      }

      const wrapper = makeElement('div', 'mh-ui-forecaster-buttons');

      const exportButton = makeElement('button', 'mh-ui-export-forecaster-data', 'Export Data');
      exportButton.addEventListener('click', exportRankupForecasterData);
      wrapper.appendChild(exportButton);

      const importButton = makeElement('button', 'mh-ui-import-forecaster-data', 'Import Data');
      importButton.addEventListener('click', importRankupForecassterData);
      wrapper.appendChild(importButton);

      rankup.appendChild(wrapper);
    }, 250);
  });
};

export default () => {
  addUIStyles(`.mh-ui-forecaster-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 5px;
  }`);

  addRankupForecasterButtons();
};
