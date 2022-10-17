var defaultcolorjson = {
  ".*production.*": "maroon",
  ".*Production.*": "maroon",
  "^SomeStrings.*": "darkblue",
};

var defaultfavsjson = {
	"favorites": [
		"123456789012-sample",
		"111111111111-sample",
		"222222222222-sample"
	]
};

function save() {
  var inputjson = document.getElementById("inputjson").value;

  var colors;
  try {
    colors = JSON.parse(inputjson);
  } catch (e) {
    document.getElementById("mes").innerHTML = "invalid json.";
    return;
  }

  chrome.storage.sync.set({ ce_aws_sso_colors: colors }, function () {});
  document.getElementById("mes").innerHTML = "saved.";
}

function savefav() {
  var inputjsonfav = document.getElementById("inputjsonfav").value;

  var favorites;
  try {
    favorites = JSON.parse(inputjsonfav);
  } catch (e) {
    document.getElementById("mesfav").innerHTML = "invalid json.";
    return;
  }

  chrome.storage.sync.set({ ce_aws_sso_favorites: favorites }, function () {});
  document.getElementById("mesfav").innerHTML = "saved.";
}

function load() {
  chrome.storage.sync.get("ce_aws_sso_colors", function (items) {
    var value;
    if (!items.ce_aws_sso_colors) {
      value = JSON.stringify(defaultcolorjson, null, "\t");
    } else {
      value = JSON.stringify(items.ce_aws_sso_colors, null, "\t");
    }
    document.getElementById("inputjson").value = value;
  });
  chrome.storage.sync.get("ce_aws_sso_favorites", function (items) {
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

document.getElementById("savebutton").addEventListener("click", save);
document.getElementById("savebuttonfav").addEventListener("click", savefav);
