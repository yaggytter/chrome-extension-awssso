var defaultcolorjson = {
  ".*production.*": "maroon",
  ".*Production.*": "maroon",
  "^SomeStrings.*": "darkblue",
};

var defaultfavsjson = {
  favorites: [
    "123456789012-sample",
    "111111111111-sample",
    "222222222222-sample",
  ],
};

function savecolors() {
  var inputjson = document.getElementById("inputjsoncolors").value;

  var colors;
  try {
    colors = JSON.parse(inputjson);
  } catch (e) {
    document.getElementById("mescolors").innerHTML = "invalid json.";
    return;
  }

  browser.storage.local.set({ ce_aws_sso_colors: colors }, function () {});
  document.getElementById("mescolors").innerHTML = "saved.";
}

function savefav() {
  var inputjson = document.getElementById("inputjsonfav").value;

  var favorites;
  try {
    favorites = JSON.parse(inputjson);
  } catch (e) {
    document.getElementById("mesfav").innerHTML = "invalid json.";
    return;
  }

  browser.storage.local.set({ ce_aws_sso_favorites: favorites }, function () {});
  document.getElementById("mesfav").innerHTML = "saved.";
}

function load() {
  browser.storage.local.get("ce_aws_sso_colors", function (items) {
    var value;
    if (!items.ce_aws_sso_colors) {
      value = JSON.stringify(defaultcolorjson, null, "\t");
    } else {
      value = JSON.stringify(items.ce_aws_sso_colors, null, "\t");
    }
    document.getElementById("inputjsoncolors").value = value;
  });
  browser.storage.local.get("ce_aws_sso_favorites", function (items) {
    var value;
    if (!items.ce_aws_sso_favorites) {
      value = JSON.stringify(defaultfavsjson, null, "\t");
    } else {
      value = JSON.stringify(items.ce_aws_sso_favorites, null, "\t");
    }
    document.getElementById("inputjsonfav").value = value;
  });
}

document.addEventListener("DOMContentLoaded", load);

document
  .getElementById("savebuttoncolors")
  .addEventListener("click", savecolors);
document.getElementById("savebuttonfav").addEventListener("click", savefav);
