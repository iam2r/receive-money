var uid = getQueryString('uid') || "iam2r"
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
function ajax(option) {
    // method, url, data, timeout, success, error
    var xhr;
    var str = option.data ? data2str(option.data) : '';
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (option.method.toLowerCase() === 'post') {
        xhr.open(option.method, option.url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(str);
    } else if (option.method.toLowerCase() === 'get') {
        xhr.open(option.method, option.url + '?' + str, true);
        xhr.send();
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            clearTimeout(timer);
            if (xhr.status >= 200 && xhr.status < 300 || xhr === 304) {
                option.success(xhr);
            } else {
                option.error(xhr);
            }
        }
    };
    if (option.timeout) {
        var timer = setTimeout(function () {
            xhr.abort();
            clearTimeout(timer);
        }, option.timeout)
    }
}
function data2str(data) {
    var res = [];
    data.t = new Date().getTime();
    for (var key in data) {
        res.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    return res.join('&');
}
function createPayment() {
    ajax({
        method: 'GET',
        url: 'db.json',
        data: {
            _t: +new Date()
        },
        timeout: 2000,
        success: (res) => {
            var data = JSON.parse(res.response)
            var setting = data.find(it => it.id === uid) || data.find(it => it.id === "iam2r")
            doAction(setting)
        },
        error: err => {
            console.log('错误信息', err)
        }
    })
    function doAction(setting) {
        var text = '',
            id = '',
            userAgent = navigator.userAgent,
            colorLight = "#ffffff",
            colorDark = "#000000",
            tips = "长按识别二维码"
        if (userAgent.match(/Alipay/i)) {
            return window.location.href = setting.aliUrl;
        }

        if (userAgent.match(/MicroMessenger\//i)) {
            id = 'wechat';
            text = setting.wechatUrl;
        } else if (userAgent.match(/QQ\//i)) {
            id = 'qq';
            text = setting.qqUrl;
        } else {
            id = 'all';
            text = window.location.href;
            tips = '扫描二维码'
        }

        var node = document.createElement('div');
        node.setAttribute('class', 'code-item');
        node.setAttribute('id', "code-" + id);

        node.innerHTML =
            `
            <div class="code-title">
                <span class="data-wechat"></span>    
                <span class="data-ali"></span>    
                <span class="data-qq"></span>    
            </div>
            <div id="code-area-placeholder" style="display:none"></div>
            <div class="code-area">
                <div class="code-target" style="background-color:${colorLight}">
                    <img id="img-placeholder" src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==">
                </div>
            </div>
            <div class="code-footer">${tips}<br/><span>向 <strong>${setting.name}</strong> 付款</span></div>
       `

        document.body.appendChild(node);
        new QRCode(document.getElementById("code-area-placeholder"), {
            text: text,
            colorDark: colorDark,
            colorLight: colorLight,
        });
        var raf = function () {
            return window.requestAnimationFrame ||
                // Older versions Chrome/Webkit
                window.webkitRequestAnimationFrame ||
                // Firefox < 23
                window.mozRequestAnimationFrame ||
                // opera
                window.oRequestAnimationFrame ||
                // ie
                window.msRequestAnimationFrame || function (callback) {
                    return window.setTimeout(callback, 1000 / 60);
                };
        }();
        var step = function step() {
            var src = document.querySelector("#code-area-placeholder img").getAttribute("src");
            if (!src) {
                raf(step);
            } else {
                document.querySelector('#img-placeholder').src = src;
            }
        };
        raf(step);
    }

}
createPayment();