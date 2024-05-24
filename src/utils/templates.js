/**
 * Find and replace strings in a template file.
 *
 * @param {string} templateId   ID of the template to replace in.
 * @param {Array}  replacements Array of replacements to make.
 */
const replaceInTemplate = (templateId, replacements) => {
  let templateContent = hg.utils.TemplateUtil.getTemplate(templateId);

  const replacementsObject = Object.fromEntries(replacements);

  templateContent = templateContent.replaceAll(new RegExp(Object.keys(replacementsObject).join('|'), 'g'), (matched) => {
    return replacementsObject[matched];
  });

  hg.utils.TemplateUtil.addTemplate(templateId, templateContent);
};

export {
  replaceInTemplate
};
