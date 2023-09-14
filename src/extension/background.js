const getFilteredPage = (text) => {
  const pages = [
    {
      name: 'Go to Camp page',
      url: 'camp.php'
    },
    {
      name: 'Go to Travel page',
      url: 'travel.php'
    },
    {
      name: 'Go to Inventory page',
      url: 'inventory.php'
    },
    {
      name: 'Go to Shops page',
      url: 'shops.php'
    },
    {
      name: 'Go to Marketplace',
      url: 'marketplace.php'
    },
    {
      name: 'Go to Mice page',
      url: 'mice.php'
    },
    {
      name: 'Go to Profile page',
      url: 'profile.php'
    },
    {
      name: 'View your Map',
      url: 'map.php'
    },
    {
      name: 'Go to Friends page',
      url: 'friends.php'
    },
    {
      name: 'Go to Team page',
      url: 'team.php'
    },
    {
      name: 'Search for friend via ID',
      url: 'friendsearch.php'
    },
  ];

  // filter the pages by the input
  const filteredPages = pages.filter((page) => page.name.toLowerCase().includes(text.toLowerCase()));

  return filteredPages;
};

chrome.omnibox.setDefaultSuggestion({
  description: 'Go to Mousehunt'
});

// Listen for typed input in the omnibox.
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  suggest(getFilteredPage(text).map((page) => ({
    content: page.name,
    description: `MouseHunt: ${page.name}`
  })));
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener((text) => {
  const pages = getFilteredPage(text);
  chrome.tabs.create({ url: `https://www.mousehuntgame.com/${pages[0].url}` });
});
