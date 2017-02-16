function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  if(chrome.runtime.openOptionsPage){
    chrome.runtime.openOptionsPage();
    renderStatus("Options Page Loaded");
  }
  else
    renderStatus("Error Loading Options!")
});
