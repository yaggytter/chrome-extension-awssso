var defaultcolorjson = {
  ".*production.*": "maroon",
  ".*Production.*": "maroon",
  "^SomeStrings.*": "darkblue",
};

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

function changeConsoleHeader() {
  const consoleFederatedLoginPattern = /AWSReservedSSO_(.+)_(.+)/;
  // show AWS SSO data to AWS console header
  chrome.runtime.sendMessage({ method: "getSSOData" }, function (response) {
    if (!(response && response.data)) {
      return;
    }
    const accountMap = response.data;
    const labelSelector = () =>
      document
        .querySelector("span[data-testid='awsc-nav-account-menu-button']")
        .querySelector("span");
    onElementReady(labelSelector, function (err, label) {
      if (err) {
        // console.warn("Ending SSO title update attempts.");
        return;
      }

      const accountIdDiv = document
        .querySelector("div[data-testid='account-detail-menu']")
        .querySelectorAll("span");

      var accountId = "";
      const isNumberRegexp = new RegExp(/^[0-9]+(\.[0-9]+)?$/);
      for (span of accountIdDiv) {
        const accountIdTmp = span.innerText.replaceAll("-", "");
        if (isNumberRegexp.test(accountIdTmp) && accountIdTmp.length == 12) {
          accountId = accountIdTmp;
          break;
        }
      }
      if (!accountId) {
        return;
      }

      var roleName = "";
      for (span of accountIdDiv) {
        const accountDetail = span.innerText
          .split("/")[0]
          .match(consoleFederatedLoginPattern);
        if (accountDetail && accountDetail.length > 1) {
          roleName = accountDetail[1];
          break;
        }
      }
      if (!roleName) {
        return;
      }

      const accountName = accountMap[accountId];
      const text = `SSO: ${roleName} @ ${accountName} (${accountId})`;
      label.innerText = text;

      const headerSelector = () =>
        document.querySelector("header").querySelector("nav");
      onElementReady(headerSelector, function (err, header) {
        if (err) {
          // console.warn(err);
          return;
        }

        chrome.storage.sync.get("ce_aws_sso_colors", function (items) {
          var colors = defaultcolorjson;
          if (items.ce_aws_sso_colors) {
            colors = items.ce_aws_sso_colors;
          }
          for (var regexp in colors) {
            re = new RegExp(regexp);
            if (re.test(accountName)) {
              header.style.backgroundColor = colors[regexp];
              return;
            }
          }
        });
      });
    });
  });
}
