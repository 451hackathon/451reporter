document.addEventListener('DOMContentLoaded', function() {
    var targ = document.getElementById('reports');
    var bg = chrome.extension.getBackgroundPage();
    bg.getCurrentTabAsync()
        .then((currentTab) => {
            bg.listBlockedResources(targ, currentTab.url);
        })
        .catch((error) => console.error(error));
});
