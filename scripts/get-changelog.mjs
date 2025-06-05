const packageJson = await Bun.file('./package.json').json();
const changelog = await Bun.file('./CHANGELOG.md').text();

// Find the section for the current version.
const versionSection = changelog.match(new RegExp(`## Version ${packageJson.version}.*?(?=## Version|$)`, 's'));
if (versionSection) {
  // Clean up the section to remove the version header and any leading/trailing whitespace.
  const cleanedChangelog = versionSection[0].replace(`## Version ${packageJson.version}`, '').trim();
  console.log(cleanedChangelog); // eslint-disable-line no-console
}
