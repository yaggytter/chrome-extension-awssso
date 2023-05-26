chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const key = "chrome-aws-sso-data";
  if (request.method == "getSSOData") {
    chrome.storage.local.get(key, function (data) {
      if (data[key]) {
        sendResponse({ data: JSON.parse(data[key]) });
      } else {
        sendResponse({});
      }
    });
  } else if (request.method == "saveSSOData") {
    const dataToStore = {};
    dataToStore[key] = JSON.stringify(request);
    chrome.storage.local.set(dataToStore, function () {
      sendResponse("OK");
    });
  } else {
    sendResponse({});
  }
  return true;
});
