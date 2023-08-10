export default () => {
  const addStyles = document.createElement('style');
  addStyles.innerHTML = '.pageFrameView-footer, .mousehuntFooter { display: none; }';
  document.head.appendChild(addStyles);
};
