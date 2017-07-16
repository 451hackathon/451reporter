/* 
 * key: top level url, value: list of blocked resources
 */
let blockedResources = {};

const COLLECTOR_URL = "http://collector.wirecdn.com/report";

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
        blockedResources[currentUrl].push(details.url);
    } else {
        blockedResources[currentUrl] = [details.url];
    }
    console.log(blockedResources);
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
    console.log("in notify for " + details.url);
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
