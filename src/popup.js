document.addEventListener('DOMContentLoaded', function() {
    var targ = document.getElementById('reports');
    getCurrentTabAsync()
        .then((currentTab) => {
            listBlockedResources(targ, currentTab.url);
        })
        .catch((error) => console.error(error));
});
