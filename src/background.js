let blockedResources = {};

chrome.webRequest.onCompleted.addListener(function(details) {
    if (details.statusCode == 451) {
        getCurrentTabId(details, addToBlocked);
    }
}, { urls: ["<all_urls>"] });

function addToBlocked(tabId, url, details) {
    if (blockedResources[url]) {
        blockedResources[url].push(details.url);
    } else {
        blockedResources[url] = [details.url];
    }
    console.log(blockedResources);
    chrome.browserAction.setBadgeText({ text: '451', tabId: tabId });
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red', tabId: tabId });
    notify(details);
}

/* 
 * params -> [[clear (boolean) | text (string)] | color (string)]
 */
function setBrowserAction(params) {
    if (params['text']) {
        chrome.browserAction.setBadgeText({ text: params['text'], tabId: params['tabId'] });
    } else if (params['clear']) {
        chrome.browserAction.setBadgeText({ text: '' });
    }
    if (params['color']) {
        chrome.browserAction
            .setBadgeBackgroundColor({ color: params['color'], tabId: params['tabId']  });
    }
}

/**
 * Get the current URL. Citation: https://developer.chrome.com/extensions/getstarted
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabId(details, callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };
    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        var url = tab.url;
        var tabId = tab.id;
        console.log("tab id is " + tabId)
        callback(tabId, url, details);
    })
};

function notify(details) {
    const resourceUrl = details.url;
    const ipServer = details.ip;
    const timeStamp = details.timeStamp;
    
    const options = {
        body: 'Click to see details',
        requireInteraction: true,
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
