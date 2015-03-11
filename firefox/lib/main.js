const self = require("sdk/self");
const tabs = require("sdk/tabs");
const events = require("sdk/system/events");
const chrome = require("chrome");

function listener(event) {
  var channel = event.subject.QueryInterface(chrome.Ci.nsIHttpChannel);

  if(!event.subject.URI.spec.match(/.*:\/\/www\.amazon\.com\/.*/) && !event.subject.URI.spec.match(/.*:\/\/amazon\.com\/.*/)) {
    // we don't want to check isPrivate() for non-amazon, so just exit here
    return;
  }
  if(isPrivate(getDispatchingWindow(event))) {
    return;
  }

  var ioService = chrome.Cc["@mozilla.org/network/io-service;1"].getService(chrome.Ci.nsIIOService);
  var newURL = event.subject.URI.spec.replace(/:\/\/.*\.amazon\.com\//, '://smile.amazon.com/');
  newURL = newURL.replace(/:\/\/amazon\.com\//, '://smile.amazon.com/');
  var newURI = ioService.newURI(newURL, event.subject.URI.originCharset, null);
  channel.redirectTo(newURI);
  
}

// https://developer.mozilla.org/EN/docs/Supporting_per-window_private_browsing
function isPrivate(window) {
  if(window==null) return;

  try {
    // Firefox 20+
    chrome.components.utils.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
    return PrivateBrowsingUtils.isWindowPrivate(window);
  } catch(e) {
    // pre Firefox 20
    try {
      return chrome.components.classes["@mozilla.org/privatebrowsing;1"].
             getService(chrome.components.interfaces.nsIPrivateBrowsingService).
             privateBrowsingEnabled;
    } catch(e) {
      chrome.components.utils.reportError(e);
      return false;
    }
  }
}

// https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Tabbed_browser#Getting_the_browser_that_fires_the_http-on-modify-request_notification_%28example_code_updated_for_loadContext%29
function getDispatchingWindow(event) {
  var oHttp = event.subject.QueryInterface(chrome.components.interfaces.nsIHttpChannel); //i used nsIHttpChannel but i guess you can use nsIChannel, im not sure why though
  var interfaceRequestor = oHttp.notificationCallbacks.QueryInterface(chrome.components.interfaces.nsIInterfaceRequestor);
  var loadContext;
  try {
    loadContext = interfaceRequestor.getInterface(chrome.components.interfaces.nsILoadContext);
  } catch (ex) {
    try {
      loadContext = event.subject.loadGroup.notificationCallbacks.getInterface(chrome.components.interfaces.nsILoadContext);
    } catch (ex2) {
      loadContext = null;
      //this is a problem i dont know why it would get here
    }
  }
  var url = oHttp.URI.spec; //can get url without needing loadContext
  if(loadContext) {
    var contentWindow = loadContext.associatedWindow; //this is the HTML window of the page that just loaded
    var aDOMWindow = contentWindow.top.QueryInterface(chrome.Ci.nsIInterfaceRequestor).
                     getInterface(chrome.Ci.nsIWebNavigation).
                     QueryInterface(chrome.Ci.nsIDocShellTreeItem).
                     rootTreeItem.QueryInterface(chrome.Ci.nsIInterfaceRequestor).
                     getInterface(chrome.Ci.nsIDOMWindow);
    
    return aDOMWindow;
  } else {
    chrome.components.utils.reportError('EXCEPTION: Load Context Not Found!!');
    //this is likely no big deal as the channel proably has no associated window, ie: the channel was loading some resource. but if its an ajax call you may end up here
  }
  
  return null;
}

events.on("http-on-modify-request", listener);

