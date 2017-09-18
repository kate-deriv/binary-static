// Check view width, add navbar height as offset if on desktop
function checkWidth() {
    let mq = window.matchMedia("(max-width: 1199px)");
    return (mq.matches ? 50 : document.getElementById('navigation').scrollHeight);
}

function toggleMobileMenu() {
    const toggleButton = document.getElementById('toggle-menu');
    const navbar       = document.getElementById('navigation');
    toggleButton.addEventListener('click', function (e) {
        navbar.classList[navbar.classList.contains('expand') ? 'remove' : 'add']('expand');
        e.stopPropagation();
    });
}

function checkBrowser() {
    const isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    const isIE = /*@cc_on!@*/false || !!document.documentMode; // Internet Explorer 6-11
    return (isFirefox || isIE);
}

// scrollTo function with animation
// - Gist reference: https://gist.github.com/andjosh/6764939
function scrollTo(to, duration) {
    if (!duration) duration = 1000;
    let start = window.pageYOffset,
        change = to - start,
        currentTime = 0,
        increment = 20;

    const animateScroll = function(){
        currentTime += increment;
        let val = Math.easeInOutQuad(currentTime, start, change, duration);
        document.body.scrollTop = val;
        document.documentElement.scrollTop = val;
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    animateScroll();
}

//t = current time
//b = start value
//c = change in value
//d = duration
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};

function getParamValue(url, key) {
    var regex   = new RegExp('[?&]' + key + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results || !results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getLanguage() {
    var all_languages = [ 'en', 'de', 'es', 'fr', 'id', 'it', 'ja', 'pl', 'pt', 'ru', 'th', 'vi', 'zh_cn', 'zh_tw' ];
    var language = window.location.href.toLowerCase().split('/').slice(3).find(function(l) { return all_languages.indexOf(l) >= 0; });
    return language || 'en';
}

function wsConnect() {
    return new WebSocket('wss://blue.binaryws.com/websockets/v3?app_id=1&l=' + getLanguage());
}
