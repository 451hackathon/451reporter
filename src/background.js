/* 
 * key: top level url, value: list of blocked resources
 */
let blockedResources = {};

const COLLECTOR_URL = "https://collector.wirecdn.com/report";

/* https://developer.chrome.com/extensions/webRequest#event-onCompleted */
chrome.webRequest.onCompleted.addListener(function(details) {
    if (details.statusCode == 451) {
        /* Fetch current tab, add a badge tied to current tabId, and
         * add to blockedResources
         */
        getCurrentTabAsync()
            .then((currentTab) => {
                /* NOTE: currentTab is an object of type:
                 * https://developer.chrome.com/extensions/tabs#type-Tab, 
                 * NOT a tabId or tabUrl */
                chrome.pageAction.show(currentTab.id);
                addToBlockedResources(currentTab.url, details);
            })
            .catch((error) => console.error(error));
        /* Create a notification */
//        notify(details);
    }
}, { urls: ["<all_urls>"] });

/* 
 * Get the current URL. Note that chrome.tabs.query is async, and 
 * is wrapped in a Promise so calling code can handle cleanly instead
 * of having to pass in a callback.
 * Citation: https://developer.chrome.com/extensions/getstarted
 */
function getCurrentTabAsync() {
    const queryInfo = {
        active: true,
        currentWindow: true
    };
    return new Promise(
        function(resolve, reject) {
            chrome.tabs.query(queryInfo, function(tabs) {
                const tab = tabs[0];
                if (tab) resolve(tab);
                else reject('Error getting current tab');
            });
        }
    );
};


function addToBlockedResources(currentUrl, details) {
    if (blockedResources[currentUrl]) {
        // note: this will overwrite any existing set of details.
        blockedResources[currentUrl][details.url] = details;
    } else {
        var url = details.url;
        blockedResources[currentUrl] = {url: details};
    }
}


function sendReportToCollector(details) {
    const report = {
        url: details.url,
        creator: '451reporter',
        version: '0.0.1',
        status: details.statusCode,
        statusText: 'Unavailable for legal reasons',
        blockedBy: details.ip,
        date: new Date(details.timeStamp).toISOString()
    };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", COLLECTOR_URL, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(report));
}

function notify(details) {
    const resourceUrl = details.url;
    const ipServer = details.ip;
    const timeStamp = details.timeStamp;

    const options = {
        body: 'Click to see details',
        requireInteraction: true
    };

    const titleOfNotification = 'Resource blocked for legal reasons';
    const alertMessage = "Blocked resource: " + resourceUrl +
        "\nBlocking server IP: " + ipServer +
        "\nTime: " + new Date(timeStamp).toString();

    /* Create notification */
    const notification = new Notification(titleOfNotification, options);
    /* When notification is clicked, create an alert */
    notification.onclick = function(event) {
        alert(alertMessage);
    };
}

function listBlockedResources(targ, url) {
    var l = blockedResources[url];
    if (!l) {
        console.error("no blocked resources for " + url);
        var err = document.createElement('div');
        err.innerText = "no blocked resources found! something is broken.";
        targ.appendChild(err);
    } else {
        var reportbutton;
        var base;
        var info;
        var subresources_blocked = false;
        var main_resource_blocked = false;
        var subresources = document.createElement('div');
        for (var subresource in l) {
            var blockedurl = l[subresource].url;
            reportbutton = document.createElement('button');
            reportbutton.innerText = 'Report';
            reportbutton.onclick = function() {
                sendReportToCollector(l[subresource]);
            };
            base = document.createElement('div');
            info = document.createElement('span');
            base.appendChild(reportbutton);
            base.appendChild(info);
            if (url == blockedurl) {
                if (!main_resource_blocked) { // Protect this from being mysteriously called twice :(
                    info.innerText = 'This webpage appears to have been censored!';
                    main_resource_blocked = true;
                    targ.appendChild(base);
                }
            } else {
                subresources_blocked = true;
                info.innerText = blockedurl;
                subresources.appendChild(base);
            }
        }
        if (subresources_blocked) {
            base = document.createElement('p');
            if (!main_resource_blocked)
                base.innerText = 'It looks like the following items on this page were censored:';
            else
                base.innerText = 'And also, the following items on this page were censored:';
            targ.appendChild(base);
            targ.appendChild(subresources);
        }
    }
};
