// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.trendyol.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stackoverflow.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function injectJquery() {
        var script = document.createElement('script');
        script.src = 'https://code.jquery.com/jquery-3.6.3.min.js'; // Check https://jquery.com/ for the current version
        document.getElementsByTagName('head')[0].appendChild(script);

        console.log($('a').attributes)
    }

    injectJquery();
})();