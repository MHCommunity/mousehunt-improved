/**
 * Find and replace strings in a template file.
 *
 * @param {string} templateId   ID of the template to replace in.
 * @param {Array}  replacements Array of replacements to make.
 */
const replaceInTemplate = (templateId, replacements) => {
  let templateContent = hg.utils.TemplateUtil.getTemplate(templateId);

  replacements.forEach(([find, replace]) => {
    templateContent = templateContent.replace(find, replace);
  });

  hg.utils.TemplateUtil.addTemplate(templateId, templateContent);
};

export {
  replaceInTemplate
};
