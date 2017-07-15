# 451Reporter Chrome Extension [prototype]

Currently all this extension does is display a tiny red banner if the browser receives a response with status code 451. 

## Installation

- Clone this repo or download as zip.
- Open `chrome://extensions` in Chrome
- ensure that "Developer mode" is checked
- Click on `Load unpacked extension...` and navigate to the downloaded repo. Press Select / Okay.
- Make sure that the extension icon is visible next to the omnibox / address bar. If it is not, it's probably hidden under the options menu on the right hand side. Click the vertical three dots, right click the extension icon, and click `Keep in Toolbar`.
- Test! Expected behaviour is that the extension icon will display `451` in a small red banner for 3 seconds.

Example websites to test on:
 * [https://github.com/SonyPS3/scedev](https://github.com/SonyPS3/scedev)
 * [https://frankcasino.com](https://frankcasino.com)
 * [primary resource is blocked](https://dkg.fifthhorseman.net/http451-example/dangerous.html)
 * [subresources are blocked](https://dkg.fifthhorseman.net/http451-example/mild.html)
 * [subresources and sub-subresources are blocked](https://dkg.fifthhorseman.net/http451-example/meta.html)
 * [sub-subresources are blocked](https://dkg.fifthhorseman.net/http451-example/sub.html)
 * GitHub maintains a [repository of DMCA takedown notices](https://github.com/github/dmca).
