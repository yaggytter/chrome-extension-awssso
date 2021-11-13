window.addEventListener("load", function () {
  const { hostname, pathname } = window.location;
  if (hostname.endsWith(".awsapps.com") && pathname.startsWith("/start")) {
    // AWS SSO portal
    saveDataOnSSOAppExpansion();
  } else if (hostname.includes("console.aws.amazon.com")) {
    // AWS Console
    changeConsoleHeader();
  }
});

// Helper function for waiting until an element selection has been rendered.
function onElementReady(selectorFn, fn) {
  let timedOut = false;
  setTimeout(function () {
    timedOut = true;
  }, 30000);
  const waitForElement = function () {
    if (timedOut) {
      fn(new Error("Element selection timed out."));
    }
    const selection = selectorFn();
    const firstEl = Array.isArray(selection) ? selection[0] : selection;
    firstEl
      ? fn(undefined, selection)
      : window.requestAnimationFrame(waitForElement);
  };
  waitForElement();
}

function saveDataOnSSOAppExpansion() {
  // Finds the SSO portal app for AWS account selection and adds a click
  // handler that will save the account names and profiles to local storage.
  const awsAccountsAppSelector = () =>
    Array.from(document.querySelectorAll("portal-application")).find((el) => {
      return el.textContent.trim().startsWith("AWS Account");
    });
  onElementReady(awsAccountsAppSelector, function (err, awsAccountsApp) {
    if (err) {
      console.error(err);
      return;
    }
    function onClickHandler() {
      saveAccountNames();
      awsAccountsApp.removeEventListener("click", onClickHandler);
    }
    awsAccountsApp.addEventListener("click", onClickHandler);
  });
}

function saveAccountNames() {
  const accountsSelector = () =>
    Array.from(document.querySelectorAll("sso-expander .instance-block"));
  onElementReady(accountsSelector, function (err, accountElements) {
    if (err) {
      console.error(err);
      return;
    }
    const accountMap = accountElements.reduce((map, el) => {
      const name = el.querySelector(".name").textContent;
      const accountId = el
        .querySelector(".accountId")
        .textContent.replace("#", "");
      map[accountId] = name;
      return map;
    }, {});

    chrome.runtime.sendMessage(
      { method: "saveSSOData", data: accountMap },
      function (response) {
        console.log("Saved SSO data to LocalStorage for Console augmentation.");
      }
    );
  });
}

function isProductionAccount(accountId, accountName) {
  return accountName && accountName.toLowerCase().includes("production");
}

function changeConsoleHeader() {
  const consoleFederatedLoginPattern = /AWSReservedSSO_(.+)_(.+)/;
  // show AWS SSO data to AWS console header
  chrome.runtime.sendMessage({ method: "getSSOData" }, function (response) {
    if (!(response && response.data)) {
      return;
    }
    const accountMap = response.data;
    const labelSelector = () =>
      document.querySelector("span[title*='AWSReservedSSO']");
    onElementReady(labelSelector, function (err, label) {
      if (err) {
        console.warn("Ending SSO title update attempts.");
        return;
      }
      const title = label.getAttribute("title");
      const accountId = document
        .querySelector("span[data-testid='aws-my-account-details']")
        .textContent.trim();
      const accountName = accountMap[accountId];
      const roleName = title
        .split("/")[0]
        .match(consoleFederatedLoginPattern)[1];
      const text = `SSO: ${roleName} @ ${accountName} (${accountId})`;
      label.textContent = text;

      if (isProductionAccount(accountId, accountName)) {
        const headerSelector = () => document.querySelector("header");
        onElementReady(headerSelector, function (err, header) {
          if (err) {
            console.warn(err);
            return;
          }
          header.style.backgroundColor = "maroon";
        });
      }
    });
  });
}
