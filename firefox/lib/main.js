var self = require("sdk/self");
var tabs = require("sdk/tabs");

tabs.on('load', function(tab) {
  if(tab.url.match(/.*:\/\/.*\.amazon\.co.*\/.*/)) {
    if(!tab.url.match(/.*:\/\/smile\.amazon\.co.*\/.*/)) {
      tab.url = tab.url.replace(/:\/\/.*\.amazon/, '://smile.amazon');
    }
  }
});
