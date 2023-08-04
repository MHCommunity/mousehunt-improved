const updateHudImages = () => {
  const upscaleMapping = {
    '/crafting_items/thumbnails/1a7897042ba8f3fa31fa6805404456d6.gif': '/crafting_items/transparent_thumb/9197ccdec26278bfb07ab7846b1a2648.png', // damaged coral.
    '/crafting_items/thumbnails/4aaa6478c10308ac865507e4d7915b3c.gif': '/crafting_items/transparent_thumb/d7f3f77c87ea7849a2ec8bc3f7d05b74.png', // mouse scale.
    '/crafting_items/thumbnails/e12ed1306d81665278952d4b4349b495.gif': '/crafting_items/transparent_thumb/5057d634368131d5ab4ad62bf0963800.png', // barnacle.
    '/bait/1f6237cebe21954e53d6586b2cbdfe39.gif': '/bait/transparent_thumb/0d27e0c72c3cbdc8e9fe06fb7bdaa56d.png', // fishy fromage.
    '/trinkets/555bb67ba245aaf2b05db070d2b4cfcb.gif': '/trinkets/transparent_thumb/be6749a947b746fbece2754d9bd02f74.png', // anchor.
    '/trinkets/5f56cb017ff9414e584ced35b2491aef.gif': '/trinkets/transparent_thumb/2dc6b3e505fd1eaac8c6069937490386.png', // water jet.
  };

  const upscaleImage = (image) => {
    const normalizedImage = image.src.replace('https://www.mousehuntgame.com/images/items', '')
      .replace('?cv=1', '')
      .replace('?cv=2', '')
      .replace('?v=1', '')
      .replace('?v=2', '');

    if (upscaleMapping[normalizedImage]) {
      image.src = `https://www.mousehuntgame.com/images/items/${upscaleMapping[normalizedImage]}?cv=2`;
    }
  };

  const hudImages = document.querySelectorAll('.sunkenCityHud .leftSidebar .craftingItems a img');
  hudImages.forEach((image) => {
    upscaleImage(image);
  });

  const baitImage = document.querySelector('.sunkenCityHud .sunkenBait .itemImage img');
  if (baitImage) {
    upscaleImage(baitImage);
  }

  const charms = document.querySelectorAll('.sunkenCityHud .sunkenCharms a .itemImage img');
  charms.forEach((charm) => {
    upscaleImage(charm);
  });
};

const main = () => {
  updateHudImages();
};

export default main;
