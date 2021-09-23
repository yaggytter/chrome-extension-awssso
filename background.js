browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const key = "ssodata";
  if (request.method == "getData") {
    if (localStorage[key]) {
      sendResponse(JSON.parse(localStorage[key]));
    } else {
      sendResponse({});
    }
  } else if (request.method == "saveData") {
    localStorage[key] = JSON.stringify(request);
    sendResponse("OK");
  } else {
    sendResponse({});
  }
});
