// 获得滚动条位置
function getOffset(){
    if(window.pageXOffset){
        return {
            x : window.pageXOffset,
            y : window.pageYOffset
        }
    }else{
        return {
            x : document.body.scrollLeft + document.documentElement.scrollLeft,
            y : document.body.scrollTop + document.documentElement.scrollTop
        }
    }
}

// 获得视口尺寸
function getViewportOffset(){
    if(window.innerWidth){
        return {
            w : window.innerWidth,
            h : window.innerHeight
        }
    }else{
        if(window.compatMode == 'BackCompat'){
            return {
                w : document.body.clientWidth,
                h : document.body.clientHeight
            }
        }else{
            return {
                w : document.documentElement.clientWidth,
                h : document.documentElement.clientHeight
            }
        }
    }
}

function getStyle(elem,prop){
    if(window.getComputedStyle){
        return window.getComputedStyle(elem,null)[prop];
    }else{
        return elem.currentStyle[prop];
    }
}

// 封装绑定处理函数的addEvent()
//用惰性函数编写的好处：
//可以避免重复判断，提高效率
function addEvent(elem, type, handle){
    if(elem.addEventListener){
        elem.addEventListener(type,handle,false);
        addEvent = function (elem, type, handle){
            elem.addEventListener(type,handle,false);
        }
    }else if (elem.attachEvent){
        elem.attachEvent('on' + type, function (){
            handle.call(elem);
        })
        addEvent = function (elem, type, handle) {
            elem.attachEvent('on' + type, function (){
                handle.call(elem);
            })
        }
    }else{
        elem['on' + type] = handle;
        addEvent = function (elem, type, handle) {
            elem['on' + type] = handle;
        }
    }
}

// 封装函数---取消冒泡
function stopBubble(event){ 
    if(event.stopPropagation){
        event.stopPropagation();
    }else{
        event.cancelBubble = true;
    }
}

// 封装函数---取消默认事件
function cancelHandler(event){
    if(event.preventDefault){
        event.preventDefault();
    }else{
        event.returnValue = false;
    }
}

//异步加载js
function load (url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    if (script.readyState) {
        script.onreadystatechange = function () {
            if(script.readyState === 'complete' || script.readyState === 'loaded') {
                tools[callback]();
            }
        }
    }else{
        script.onload = function () {
            tools[callback]();//用对象的方式来储存函数
        }
    }
    script.src = url;//防止src加载太快，script.readyState失效了
    document.head.appendChild('script');
}

//多物体多值链式运动
function startMove (obj, json, callback) {
    var iSpeed,
        iCur;
    obj.timer = setInterval( function () {
        var bStop = true;//确保每一个元素都到达了他的指定位置，才停止
        for (var attr in json) {
            //假如修改的是
            if(attr == 'opacity') {
                iCur = parseFloat( getStyle(obj, attr) ) * 100;
            } else {
                iCur = parseInt( getStyle(obj, attr) );   
            }   
            iSpeed = ( json[attr] -  iCur ) / 7;//让方块做先加速后减速运动
            iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor( iSpeed );
            if(attr == 'opacity') {
                obj.style.opacity = ( iCur + iSpeed ) / 100;
            } else {
                obj.style[attr] = iCur + iSpeed + 'px';
            }
            if(iCur != json[attr]) {
                bStop = false;
            }
            if(bStop) {
                clearInterval(obj.timer);
                typeof callback == 'function' ? callback() : '';
            }
        }
    },30)
}

//返回相对于文档的定位
function getPosition (ele) {
    if(ele.offsetParent.nodeName == 'BODY') {
        return {
            left : ele.offsetLeft,
            top : ele.offsetTop
        }
    } else {
        return {
            left : ele.offsetLeft + getPosition(ele.offsetParent).left,
            top : ele.offsetTop + getPosition(ele.offsetParent).top
        }
    }
}

//ajax函数的封装
function ajaxFunc(method, url, data, callback, flag) {
    var xhr = null;
    if(window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHttp');
    }
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                callback(xhr.responseText);
            }
        } else {
            callback('error');
        }
    }
    method = method.toUpperCase();
    if(method == 'GET') {
        var date = new data(),
            timer = date.getTimer();
        xhr.open(method, url + "?" + data + '&timer=' + timer, flag);
        xhr.send();
    } else if(method == 'POST') {
        xhr.open(method, url, flag);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(data);
    }
}