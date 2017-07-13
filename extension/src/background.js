chrome.webRequest.onCompleted.addListener(function(details) {
    if (details.statusCode == 451) {
        notify(details);
        setBrowserAction({ text: '451', color: 'red' });
        setTimeout(function() {
            setBrowserAction({ clear: true });
        }, 3000);
    }
}, { urls: ["<all_urls>"] });

/* 
 * params -> [[clear (boolean) | text (string)] | color (string)]
 */
function setBrowserAction(params) {
    if (params['text']) {
        chrome.browserAction.setBadgeText({ text: params['text'] });
    } else if (params['clear']) {
        chrome.browserAction.setBadgeText({ text: '' });
    }
    if (params['color']) {
        chrome.browserAction
            .setBadgeBackgroundColor({ color: params['color'] });
    }
}

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
