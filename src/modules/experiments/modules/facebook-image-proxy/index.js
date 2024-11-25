const init = async () => {
  // Replace the Facebook image URLs with 'fb-images.mouse.rip', which is a proxy server.
  document.addEventListener('image-upscaling-image', (e) => {
    if (e?.detail?.image && e?.detail?.originalUrl?.includes('graph.facebook.com')) {
      e.detail.image.src = e.detail.originalUrl.replace('graph.facebook.com', 'fb-images.mouse.rip');
    }
  });
};

export default {
  id: 'experiments.facebook-image-proxy',
  name: 'Proxy Facebook images through an external server to avoid tracking',
  load: init,
};
