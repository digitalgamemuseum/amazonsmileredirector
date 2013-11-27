const self = require("sdk/self");
const tabs = require("sdk/tabs");
const events = require("sdk/system/events");
const chrome = require("chrome");

function listener(event) {
  var channel = event.subject.QueryInterface(chrome.Ci.nsIHttpChannel);
  var replace = false;
  if(event.subject.URI.spec.match(/.*:\/\/www\.amazon\.com\/.*/)) {
    replace = true;
  }
  if(event.subject.URI.spec.match(/.*:\/\/amazon\.com\/.*/)) {
    replace = true;
  }
  if(replace == true) {
    var ioService = chrome.Cc["@mozilla.org/network/io-service;1"].getService(chrome.Ci.nsIIOService);
    var newURL = event.subject.URI.spec.replace(/:\/\/.*\.amazon\.com\//, '://smile.amazon.com/');
    newURL = newURL.replace(/:\/\/amazon\.com\//, '://smile.amazon.com/');
    var newURI = ioService.newURI(newURL, event.subject.URI.originCharset, null);
    channel.redirectTo(newURI);
  }
  return;
}

events.on("http-on-modify-request", listener);

// tabs.on('ready', function(tab) {
// if(tab.url.match(/.*:\/\/.*\.amazon\.com\/.*/)) {
// if(!tab.url.match(/.*:\/\/smile\.amazon\.com\/.*/)) {
// tab.url = tab.url.replace(/:\/\/.*\.amazon/, '://smile.amazon');
// }
// }
// });
