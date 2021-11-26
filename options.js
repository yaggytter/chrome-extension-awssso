var defaultcolorjson = {
  ".*production.*": "maroon",
  ".*Production.*": "maroon",
  "^SomeStrings.*": "darkblue",
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
}

document.addEventListener("DOMContentLoaded", load);

document.getElementById("savebutton").addEventListener("click", save);
