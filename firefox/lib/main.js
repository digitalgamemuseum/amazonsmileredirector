var self = require("sdk/self");
var tabs = require("sdk/tabs");

tabs.on('ready', function(tab) {
  if(tab.url.match(/.*:\/\/.*\.amazon\.com\/.*/)) {
    if(!tab.url.match(/.*:\/\/smile\.amazon\.com\/.*/)) {
      tab.url = tab.url.replace(/:\/\/.*\.amazon/, '://smile.amazon');
    }
  }
});
