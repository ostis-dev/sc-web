var intModeCheckbox;
var intModeSwitchingButtons;

var intButton;

$(document).ready(function () {
    SCWeb.core.IntModeEnabled = false;
    intModeCheckbox = document.querySelector('#int_mode-switching-checkbox');

    if (intModeCheckbox) {
      intModeCheckbox.checked = SCWeb.core.IntModeEnabled;
      if (!intModeCheckbox.checked) {
      }
      intModeCheckbox.onclick = function () {
         SCWeb.core.IntModeEnabled = intModeCheckbox.checked;
         SCWeb.core.EventManager.emit("int_mode_changed");
      };
   }
});
