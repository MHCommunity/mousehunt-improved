# Bundled images

Images in this folder (SVG and PNG) are inlined into the build as data URIs, so they don't need to be uploaded to i.mouse.rip.

Reference them explicitly and the build will inline them (or fail loudly if the file is missing):

- In CSS, use a relative path: `background-image: url(../../images/settings/foo.svg);`
- In JS, import via the `@images` alias: `import fooIcon from '@images/foo.svg';` and use the imported string as a URL.

Keep it to small images — everything here ships inside the bundle and counts against the userscript's 2MB GreasyFork limit.
