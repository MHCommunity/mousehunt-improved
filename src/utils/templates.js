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

let _templateRenderFromFile;
let hasExtendedRenderFromFile = false;
const onRenderCallbacks = {};

/**
 * Watch for a template to be rendered and run a callback before or after.
 *
 * @param {Object}   options          The options for the template and callback.
 * @param {string}   options.group    The group of the template to watch.
 * @param {string}   options.layout   The layout of the template to watch.
 * @param {Function} options.callback The callback to run.
 * @param {boolean}  options.before   Whether to run the callback before the template is rendered.
 * @param {boolean}  options.after    Whether to run the callback after the template is rendered.
 */
const onRender = ({ group, layout = 'layout', callback, before = false, after = false }) => {
  if (! hasExtendedRenderFromFile) {
    extenderRenderFromFile();
    hasExtendedRenderFromFile = true;
  }

  if (! onRenderCallbacks[group]) {
    onRenderCallbacks[group] = {};
  }

  if (! onRenderCallbacks[group][layout]) {
    onRenderCallbacks[group][layout] = {
      before: [],
      after: []
    };
  }

  if (before) {
    onRenderCallbacks[group][layout].before.push(callback);
  }

  if (after) {
    onRenderCallbacks[group][layout].after.push(callback);
  }
};

const extenderRenderFromFile = () => {
  if (_templateRenderFromFile) {
    return;
  }

  _templateRenderFromFile = hg.utils.TemplateUtil.renderFromFile;
  hg.utils.TemplateUtil.renderFromFile = (group, type, data) => {
    // Call the before callbacks if they exist
    if (onRenderCallbacks[group] && onRenderCallbacks[group][type] && onRenderCallbacks[group][type].before) {
      onRenderCallbacks[group][type].before.forEach((callback) => {
        callback(data);
      });
    }

    let results = _templateRenderFromFile(group, type, data);

    // Call the after callbacks if they exist
    if (onRenderCallbacks[group] && onRenderCallbacks[group][type] && onRenderCallbacks[group][type].after) {
      onRenderCallbacks[group][type].after.forEach((callback) => {
        results = callback(data, results);
      });
    }

    return results;
  };
};

export {
  replaceInTemplate,
  onRender
};
