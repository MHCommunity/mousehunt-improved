// ==UserScript==
// @name        🐭️ MouseHunt Improved
// @description Improve your MouseHunt experience. Please only use this when the extension is not available.
// @version     0.99.4
// @license     MIT
// @author      bradp
// @namespace   bradp
// @match       https://www.mousehuntgame.com/*
// @icon        https://i.mouse.rip/mh-improved/icon-64.png
// @run-at      document-end
// @grant       none
// @require     https://unpkg.com/mousehunt-improved@0.99.4/dist/mousehunt-improved.min.js
// ==/UserScript==
//
if ('undefined' === typeof mhui) {
  console.error('MouseHunt Improved failed to load. Check that unpkg.com is not being blocked, or reinstall from https://greasyfork.org/en/scripts/465139-mousehunt-improved');
}
