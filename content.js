function initAwsSsoExtension() {
  var url = location.href;
  if (url.indexOf("?") > 0) {
    url = url.substring(0, url.indexOf("?"));
  }

  if (
    url.endsWith(".awsapps.com/start#/") ||
    url.endsWith(".awsapps.com/start/#/") ||
    url.endsWith(".awsapps.com/start/")
  ) {
    // AWS SSO portal
    $(document).on("click", "div", function (obj) {
      if (obj.target.text == "Management console") {
        saveAccountNames(obj);
      }
    });
  } else if (url.indexOf("console.aws.amazon.com") > 0) {
    // AWS Console
    changeConsoleHeader();
  }
}

function saveAccountNames(obj) {
  // get some data for AWS SSO from SSO Portal
  var profiles = $(".portal-instance-section");

  $.each(profiles, function (index, value) {
    var name = $(value).find(".name").text();
    var id = $(value).find(".accountId").text();
    var portalprofiles = $(value).find("portal-profile");

    $.each(portalprofiles, function (index, value) {
      var profilename = $(value).find(".profile-name").text();
      var profilelink = $(value).find(".profile-link").attr("href");

      if (profilelink == obj.target.href) {
        // get clicked data and save to local storage
        browser.runtime.sendMessage(
          {
            method: "saveData",
            data: {
              name: name,
              id: id,
              profilename: profilename,
            },
          },
          function (response) {
            // console.log(response);
          }
        );
      }
    });
  });

  var datas;
}

function changeConsoleHeader() {
  // show AWS SSO data to AWS console header
  browser.runtime.sendMessage({ method: "getData" }, function (response) {
    if (response) {
      // console.log(response);
      var accountname = response.data.name;
      var text = "SSO: " + response.data.profilename + " @ " + accountname;

      tx = $("span[title*='AWSReservedSSO']").text(text);
      if (
        (accountname.indexOf("production") != -1 ||
          accountname.indexOf("Production") != -1) &&
        tx.length > 0
      ) {
        $("header").css("background-color", "maroon");
      }
    }
  });
}

initAwsSsoExtension();
