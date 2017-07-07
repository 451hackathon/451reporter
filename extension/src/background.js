chrome.webRequest.onCompleted.addListener(function(details) {
    if (details.statusCode == 451) {
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
