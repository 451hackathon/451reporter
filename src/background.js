/* 
 * key: top level url, value: list of blocked resources
 */
let blockedResources = {};

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
                setBrowserAction({
                    text: '451',
                    color: 'red',
                    tabId: currentTab.id
                });
                addToBlockedResources(currentTab.url, details);
            })
            .catch((error) => console.error(error));
        /* Create a notification */
        notify(details);
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

/* 
 * params -> [[clear (boolean) | text (string)] | color (string) |
 *  tabId (number) ]
 */
function setBrowserAction(params) {
    if (params['text']) {
        chrome.browserAction.setBadgeText({
            text: params['text'],
            tabId: params['tabId']
        });
    } else if (params['clear']) {
        chrome.browserAction.setBadgeText({ text: '' });
    }
    if (params['color']) {
        chrome.browserAction
            .setBadgeBackgroundColor({
                color: params['color'],
                tabId: params['tabId']
            });
    }
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
