browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const key = "firefox-aws-sso-data";
  if (request.method == "getSSOData") {
    if (localStorage[key]) {
      sendResponse(JSON.parse(localStorage[key]));
    } else {
      sendResponse({});
    }
  } else if (request.method == "saveSSOData") {
    localStorage[key] = JSON.stringify(request);
    sendResponse("OK");
  } else {
    sendResponse({});
  }
});
