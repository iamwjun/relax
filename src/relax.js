/*! relax.js | (c) 2018, 2018 | cddxwujun@qq.com */
'use strict';

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.relax = factory());
}(this, (function () { 'use strict';

    console.log('now run?');
    /*
     * requestAnimationFrame兼容问题
     */
    window.requestAnimationFrame = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.msRequestAnimationFrame || 
    window.oRequestAnimationFrame

    if (!Element.prototype.tap) {
        Object.defineProperty(Element.prototype, 'tap', {
            value: function(callback /*, initialValue*/) {
                if (this === null) {
                    throw new TypeError('element.prototype.tap ' + 'called on null or undefined' );
                }
                if (typeof callback !== 'function') {
                    throw new TypeError( callback + ' is not a function');
                }

                var start = false,
                    move = false,
                    cancel = false,
                    end = false,
                    touches;
                this.addEventListener('touchstart', function(ev){
                    if(touches != ev.touches){
                        touches = ev.touches;
                        move = false;
                        cancel = false;
                    }
                    start = true;
                }, {passive: true})
                this.addEventListener('touchmove', function(){
                    move = true;
                }, {passive: true})
                this.addEventListener('touchcancel', function(){
                    cancel = true;
                }, {passive: true})
                this.addEventListener('touchend', function(){
                    end = true;
                    console.log(start, move, cancel, end, touches);
                    if(!move && !cancel && start && end){
                        callback(touches)
                    }
                }, {passive: true})
            },
            writable: false
        })
    }

    var jsx = function(type, props, ...children) {
        return { type, props, children };
    }

    const tips = jsx('div',{ 'className': 'progress', style: 'display:none' },
        jsx('div',{ 'className': 'progressTips' },
            jsx('div',{ 'className': 'loader' },
                jsx('div', { 'className': 'circle' }),
                jsx('div', { 'className': 'circle' }),
                jsx('div', { 'className': 'circle' }),
                jsx('div', { 'className': 'circle' }),
                jsx('div', { 'className': 'circle' })
            ),
            jsx('span', { 'className': 'textTips' })
        )
    );

    var CHECK_TYPE = 1;
    var REQUEST_LOADING = false;
    var start = null;

    /*
     *<div class="cui_layer" style="display:none">
        <div class="cui_layer_padding">
            <div class="cui_layer_content"></div>
        </div>
     </div>
     */
    const layer = jsx('div',{ 'className': 'cui_layer' },
        jsx('div',{ 'className': 'cui_layer_padding' },
            jsx('div',{ 'className': 'cui_layer_content' }),
        )
    );

    /*
     *<div class="paycheck">
        <ul>
            <li><i class="slideDown"></i>请选择支付方式</li>
            <li>
                <dl class="wallet cfix">
                    <dt class="fl"><i class="purse gray"></i><p class="nochange">钱包余额支付(￥193.96)</p></dt>
                    <dd class="fr"><i data-type="1" class="icon-check active"></i></dd>
                </dl>
            </li>
            <li>
                <dl class="wallet cfix">
                    <dt class="fl"><i class="wechat"></i><p class="nochange">微信支付</p></dt>
                    <dd class="fr"><i data-type="2" class="icon-check"></i></dd>
                </dl>
            </li>
            <li><u>需付款<span>0.01元</span></u></li>
            <li><span class="tap" data-value="2">确认付款</span></li>
        </ul>
    </div>
     */
    const payBox = jsx("div",{ "className": "paycheck" },
        jsx("ul", null,
            jsx("li", null,
                jsx("i", { "className": "slideDown", "action": "close" }), "\u8BF7\u9009\u62E9\u652F\u4ED8\u65B9\u5F0F"
            ),
            jsx("li",null,
                jsx("dl",{ "className": "wallet cfix", "action": "check-0" },
                    jsx("dt",{ "className": "fl" },
                        jsx("i", { "className": "purse gray" }),
                        jsx("p", { "className": "nochange" }, "\u94B1\u5305\u4F59\u989D\u652F\u4ED8(\uFFE5193.96)")
                    ),
                    jsx("dd",{ "className": "fr" },
                        jsx("i", { "className": "icon-check active" }))
                    )
                ),
            jsx("li", null,
                jsx("dl",{ "className": "wallet cfix", "action": "check-1" },
                    jsx("dt",{ "className": "fl" },
                        jsx("i", { "className": "wechat" }),
                        jsx("p", { "className": "nochange" },"\u5FAE\u4FE1\u652F\u4ED8")
                    ),
                    jsx("dd",{ "className": "fr" },jsx("i", { "className": "icon-check" }))
            )),
            jsx("li",null,
                jsx("u",null,"\u9700\u4ED8\u6B3E",
                    jsx("span",null,"0.01\u5143")
                )
            ),
            jsx("li",null,
                jsx("span",{ "className": "confirm", "action": "confirm" },"\u786E\u8BA4\u4ED8\u6B3E")
            )
        )
    );

    var createElement = function(node){
        if (typeof node === 'string') {
            return document.createTextNode(node);
        }
        const element = document.createElement(node.type);
        if (node.props) {
            node.props.className ? element.className = node.props.className : '';            
            if (node.props.action) {
                element.dataset.action = node.props.action;
                element.tap(function(ev){
                    console.log(ev);
                    instructionProcessing(node.props.action);
                })
            }
            node.props.style ? element.style = node.props.style : '';
        }        
        node.children.map(createElement).forEach(element.appendChild.bind(element));
        return element;
    }

    var message = function(txt){
        if(!$('.cui_layer')){
            document.body.appendChild(createElement(layer));
        }
        $('.cui_layer_content').innerText = txt;
        setTimeout("$('.cui_layer').style.display = 'none';", 1000);
    }

    var progressPromptBox = function(txt){
        if(!$('.progress')){
            document.body.appendChild(createElement(tips));
        }
        $('.textTips').innerText = txt;
        if ($('.progress').style.display == 'block') {
            $('.progress').style.display = 'none';
            return false;
        }
        $('.progress').style.display = 'block';
    }

    var instructionProcessing = function(command){
        let instruction = command.split("-");
        console.log(instruction);
        switch (instruction[0]) {
            case 'pay':
                unifiedOrder(instruction);
                break;
            case 'create':
                createIinstruction(instruction);
                break;
            case 'close':
                hidePaymentOptions();
                break;
            case 'check':
                checkPayment(instruction[1]);
                break;
            case 'confirm':
                confirmPayment();
                break;
            default:
                break;
        }
    }

    var createIinstruction = function(instruction){
        if(!$('.paycheck')){
            document.body.appendChild(createElement(payBox));
        }
        $('.paycheck').classList.add('show');
        // $('.paycheck ul').classList.remove('fadeOutDown');
        // $('.paycheck ul').classList.add('fadeInUp');
        start = null;
        window.requestAnimationFrame(step);
    }

    var step = function(timestamp, dom, type) {
        var element = $('.paycheck ul');
        if (!start) start = timestamp;
        var progress = timestamp - start;
        element.style.bottom = Math.min((progress - 360) / 10, 0) + 'rem';
        if (progress < 360) {
            window.requestAnimationFrame(step);
        }
    }

    var step2 = function(timestamp, element, type) {
        console.log(timestamp, element, type);
        var element = $('.paycheck ul');
        if (!start) start = timestamp;
        var progress = timestamp - start;
        console.log(start, progress);
        element.style.bottom = Math.max(- progress / 10, -18) + 'rem';
        if (progress < 360) {
            window.requestAnimationFrame(step2);
        }else{
            $('.paycheck').classList.remove('show');
        }
    }

    var unifiedOrder = function(instruction){
        request(instruction[2], 'POST', {}).then((response) => {
            if (200 === response.status) {
                progressPromptBox('');
                alert(response.message)
            }
        }).catch((error) => {
            console.log("request error:" + error)
        })
    }

    var hidePaymentOptions = function(){
        //$('.paycheck').classList.remove('show');
        start = null;
        window.requestAnimationFrame(step2, $('.paycheck ul'), 1)
    }

    var checkPayment = function(type){
        CHECK_TYPE = type;
        document.querySelectorAll('.wallet').forEach(function(item, index){
            if (type == index) {
                item.children[0].firstElementChild.classList.remove('gray');
                item.children[1].firstElementChild.classList.remove('active');
            }else{
                item.children[0].firstElementChild.classList.add('gray');
                item.children[1].firstElementChild.classList.add('active');
            }
        })
    }

    var confirmPayment = function(){
        request('weixinmini', 'POST', {}).then((response) => {
            if (200 === response.status) {
                progressPromptBox('');
                alert(response.message)
            }
        }).catch((error) => {
            console.log("request error:" + error)
        })
    }

    var getProgramDirectory = function(){
        return location.pathname.split('/')[1];
    }

    var getFullInterfaceUrl = function(path){
        return location.origin + '/' + getProgramDirectory() + '/external/php/api/'+ path +'/';
    }

    var request = function (url, type, data, loading) {
        loading ? '' : progressPromptBox('\u8bf7\u7a0d\u5019...');
        var header = {
            cache: 'no-cache',
            headers: {
                'content-type': 'application/json'
            },
            method: type,
            mode: 'cors'
        };
        data && Object.keys(data).length > 0 ? header.body = JSON.stringify(data) : '';
        return fetch(getFullInterfaceUrl(url), header).then(response => response.json())
    }

    var refresh = function(){
        for (var i = 1; i < 31; i++) {
            (function(i){
                setTimeout(function() {
                    if (i == 30) {
                        location.reload();
                    }
                    $('#reload').innerText = '请在 '+ (30 - i) +' 秒内完成支付！';
                }, 1000 * i);
            })(i)
        }
    }

    var remainTime = function(duration, display) {
        var timer = duration, minutes, seconds;
        setInterval(function () {
            minutes = parseInt(timer / 60, 10)
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.innerHTML = '请在'+ minutes + "分" + seconds +'秒内离场';

            if (--timer < 0) {
                timer = duration;
            }
            if (--timer == 0) {
                location.reload();
            }
        }, 1000);
    }

    var $ = function(selector){
        return document.querySelector(selector);
    }

    var $s = function(selectors){
        return document.querySelectorAll(selectors);
    }

    $s('.tap').forEach(function(item, index){
        item.tap(function(ev){
            console.log(ev[0].target.dataset.action);
            instructionProcessing(ev[0].target.dataset.action);
        })
    })



    var relax = {
        tips: tips,
        $s: $s,
        progressPromptBox: progressPromptBox,
        request: request,
        instructionProcessing: instructionProcessing,
        refresh: refresh,
        message: message
    };
    return relax;
})));