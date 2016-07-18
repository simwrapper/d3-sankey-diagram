module.exports = function() {
  if (process.browser) {
    return document.querySelector('body');
  } else {
    const jsdom = require("jsdom");
    return jsdom.jsdom().querySelector('body');
  }
};
