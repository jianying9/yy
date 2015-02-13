/**
 * wolf通信封装
 */

define('wolf/wolf', ['require', 'jquery', 'crypto'], function (require) {
//require用于依赖加载
    var self = {};
    //浏览器信息
    var _browser = {};
    _browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
    _browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
    _browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
    _browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
    //计数器
    var _index = {
        currentIndex: (new Date()).getTime(),
        nextIndex: function () {
            this.currentIndex++;
            return this.currentIndex.toString();
        }
    };
    //获取
    self.nextIndex = function () {
        return _index.nextIndex();
    };
    //context上下文对象
    var _context = {
        logLevel: 3,
        version: 1
    };
    self.setContext = function (config) {
        for (var name in config) {
            _context[name] = config[name];
        }
    };
    self.getContext = function (name) {
        return _context[name];
    };
    var _defaultKeyByte = CryptoJS.enc.Utf8.parse('wolf2015');
    //server对象
    var _defaultServer = {};
    var _servers = {};
    //logger日志对象
    var _logger = {};
    if (_browser.mozilla || _browser.webkit) {
        _logger._loggerImpl = console;
        _logger._context = _context;
        _logger.debug = function (msg) {
            if (this._loggerImpl && this._context.logLevel >= 4) {
                var date = _utils.getDateTime();
                this._loggerImpl.debug(date + '-DEBUG:' + msg);
            }
        };
        _logger.info = function (msg) {
            if (this._loggerImpl && this._context.logLevel >= 3) {
                var date = _utils.getDateTime();
                this._loggerImpl.debug(date + '-INFO:' + msg);
            }
        };
        _logger.warn = function (msg) {
            if (this._loggerImpl && this._context.logLevel >= 2) {
                var date = _utils.getDateTime();
                this._loggerImpl.debug(date + '-WARN:' + msg);
            }
        };
        _logger.error = function (msg) {
            if (this._loggerImpl && this._context.logLevel >= 1) {
                var date = _utils.getDateTime();
                this._loggerImpl.debug(date + '-ERROR:' + msg);
            }
        };
    } else {
        _logger.debug = function (msg) {
        };
        _logger.info = function (msg) {
        };
        _logger.warn = function (msg) {
        };
        _logger.error = function (msg) {
        };
    }
    //获取url参数
    self.getUrlPara = function () {
        var result = {};
        var text = window.location.search;
        if (text.length > 0) {
            text = text.substr(1);
            var paraArr = text.split('&');
            var para;
            for (var index = 0; index < paraArr.length; index++) {
                para = paraArr[index].split('=');
                if (para.length === 2) {
                    result[para[0]] = para[1];
                }
            }
        }
        return result;
    };
    //cookie对象
    var _cookie = {
        setCookie: function (key, value, options) {
            options = options || {};
            var expires = '';
            if (options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires === 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString();
            }
            var path = options.path ? '; path=' + (options.path) : '';
            var domain = options.domain ? '; domain=' + (options.domain) : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [key, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        },
        getCookie: function (name) {
            var cookieValue;
            var cookies = document.cookie.split(';');
            var cookie;
            var cookieName;
            for (var i = 0; i < cookies.length; i++) {
                cookie = $.trim(cookies[i]);
                cookieName = cookie.substring(0, name.length + 1);
                if (cookieName === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
            return cookieValue;
        }
    };
    self.getCookie = function (name) {
        return _cookie.getCookie(name);
    };
    self.setCookie = function (key, value, options) {
        _cookie.setCookie(key, value, options);
    };
    //session对象
    var _sessions = {};
    self.setSession = function (serverId, config) {
        var session = _sessions[serverId];
        if (session) {
            for (var name in config) {
                session[name] = config[name];
            }
        }
    };
    self.getSession = function (serverId, name) {
        var value;
        var session = _sessions[serverId];
        if (session) {
            value = session[name];
        }
        return value;
    };
    self.clearSession = function (serverId) {
        var session = _sessions[serverId];
        if (session) {
            for (var name in session) {
                delete session[name];
            }
        }
    };
    //初始session
    var urlParas = self.getUrlPara();
    if (urlParas._s) {
        var _s = decodeURIComponent(urlParas._s);
        var s = CryptoJS.DES.decrypt(_s, _defaultKeyByte, {iv: _defaultKeyByte});
        s = CryptoJS.enc.Utf8.stringify(s);
        _sessions = eval('(' + s + ')');
    }
    //创建带session的url，获取boolean,string,number类型的session信息
    self.createUrl = function (url) {
        //session加密
        var type;
        var s = '{';
        var session;
        var value;
        for (var id in _sessions) {
            s += '"' + id + '":{';
            session = _sessions[id];
            for (var name in session) {
                value = session[name];
                type = typeof (value);
                switch (type) {
                    case 'boolean':
                        s += '"' + name + '":' + value + ',';
                        break;
                    case 'number':
                        s += '"' + name + '":' + value + ',';
                        break;
                    default :
                        s += '"' + name + '":"' + value + '",';
                        break;
                }
            }
            value = s.substr(s.length - 1);
            if (value === ',') {
                s = s.substr(0, s.length - 1);
            }
            s += '},';
        }
        value = s.substr(s.length - 1);
        if (value === ',') {
            s = s.substr(0, s.length - 1);
        }
        s += '}';
        var es = CryptoJS.DES.encrypt(s, _defaultKeyByte, {iv: _defaultKeyByte});
        var base64 = CryptoJS.format.OpenSSL.stringify(es);
        //重写url
        var u;
        var index = url.indexOf('?');
        if (index > 0) {
            u = url.substring(0, index);
            var p = url.substring(index + 1, url.length);
            var paraArr = p.split('&');
            var para;
            var paras = {};
            for (var index = 0; index < paraArr.length; index++) {
                para = paraArr[index].split('=');
                paras[para[0]] = para[1];
            }
            paras._s = encodeURIComponent(base64);
            u += '?';
            for (var name in paras) {
                u += name + '=' + paras[name] + '&';
            }
            u = u.substring(0, u.length - 1);
        } else {
            u = url + '?_s=' + encodeURIComponent(base64);
        }
        return u;
    };
    //打开新页面
    self.openUrl = function (url) {
        //session转cookie
        var u = this.createUrl(url);
        window.open(u);
    };
    //改变页面
    self.changeUrl = function (url) {
        //session转cookie
        var u = this.createUrl(url);
        window.location.href = u;
    };
    //定时任务
    var _timerTaskManager = {
        _index: _index,
        _logger: _logger,
        _taskQueue: {},
        submitTask: function (task) {
            if (!task.id) {
                task.id = this._index.nextIndex();
            }
            if (!task.nextTime || task.nextTime < 1) {
                task.nextTime = 2;
            }
            this._taskQueue[task.id] = task;
        },
        start: function () {
            var task;
            var complete;
            for (var id in this._taskQueue) {
                task = this._taskQueue[id];
                if (task.message) {
                    this._logger.debug(task.message);
                }
                task.nextTime--;
                if (task.nextTime === 0) {
                    //时间倒计时为0，开始执行
                    complete = true;
                    try {
                        complete = task.execute();
                    } catch (e) {
                        this._logger.error('timer execute error:' + e);
                    }
                    if (complete) {
                        delete this._taskQueue[id];
                    }
                }
            }
        }
    };
    //执行定时任务，最小周期为0.5秒
    setInterval(function () {
        _timerTaskManager.start();
    }, 500);
    self.submitTimerTask = function (timerTask) {
        _timerTaskManager.submitTask(timerTask);
    };

    //message消息管理对象
    var _message = {
        actions: {},
        _logger: _logger,
        listen: function (actionName, handler) {
            var action = this.actions[actionName];
            if (!action) {
                action = {};
                this.actions[actionName] = action;
            }
            action[handler.id] = handler;
        },
        remove: function (actionName, handlerId) {
            var action = this.actions[actionName];
            if (action) {
                delete action[handlerId];
            }
        },
        createSeed: function (msg) {
            var serverTime = ((new Date()).getTime() + this.difftime).toString();
            var seed = CryptoJS.DES.encrypt(serverTime, _defaultKeyByte, {iv: _defaultKeyByte});
            seed = CryptoJS.enc.Hex.stringify(seed.ciphertext);
            msg.seed = seed;
        },
        notify: function (res) {
            //判断是否是批量消息
            if (Object.prototype.toString.apply(res) === '[object Array]') {
                for (var index = 0; index < res.length; index++) {
                    this.notify(res[index]);
                }
            } else {
                //DENIED状态处理
                if (res.state === 'DENIED' && res.error) {
                    //请求加密验证时间间隔异常，重新同步时间
                    var clientTime = (new Date()).getTime();
                    this.difftime = res.error - clientTime;
                    //写入cookie
                    var difftimeByte = CryptoJS.enc.Utf8.parse('difftime');
                    var difftimeHex = CryptoJS.enc.Hex.stringify(difftimeByte);
                    _cookie.setCookie(difftimeHex, this.difftime.toString(), {expires: 1});
                }
                if (res.act) {
                    var action = this.actions[res.act];
                    if (action) {
                        var handler;
                        for (var name in action) {
                            handler = action[name];
                            handler.callback(res);
                        }
                    }
                } else {
                    if (res.wolf) {
                        if (res.wolf === 'TIME') {
                            var server = _servers[res.serverId];
                            if (server) {
                                //时间同步
                                var clientTime = (new Date()).getTime();
                                var difftime = res.time - clientTime;
                                //写入cookie
                                var difftimeByte = CryptoJS.enc.Utf8.parse(server.id + '-difftime');
                                var difftimeHex = CryptoJS.enc.Hex.stringify(difftimeByte);
                                _cookie.setCookie(difftimeHex, difftime.toString(), {expires: 1});
                                //判断是否有时间同步回调方法
                                if(server.callback) {
                                    server.callback();
                                }
                            }
                        } else if (res.wolf === 'SHUTDOWN') {
                            //TODO
                        }
                    }
                }
            }
        },
        send: function (msg) {
            var that = this;
            var server = _defaultServer;
            if (msg.serverId) {
                server = _servers[msg.serverId];
            }
            var session = _sessions[server.id];
            if (session && session.sid) {
                msg.sid = session.sid;
            }
            that.createSeed(msg);
            $.getJSON(server.httpUrl + '?callback=?', msg, function (res) {
                that.notify(res);
            });
        },
        startComet: function (serverId) {
            var server = _servers[serverId];
            var session = _sessions[server.id];
            if (session && session.sid) {
                var push = {
                    'httpUrl': server.httpUrl,
                    'sid': session.sid,
                    getPushMessage: function () {
                        var that = this;
                        $.getJSON(that.httpUrl + '?callback=?', {wolf: 'PUSH', sid: that.sid}, function (res) {
                            //PUSH STOP
                            if (res.wolf) {
                                if (res.wolf === 'PUSH_TIMEOUT') {
                                    that.getPushMessage();
                                }
                            } else {
                                that.notify(res);
                                that.getPushMessage();
                            }
                        });
                    }
                };
                //执行
                push.getPushMessage();
            }
        }
    };
    self.getMessage = function () {
        return _message;
    };
    //
    self.init = function (config, callback) {
        //保存配置
        this.setContext(config);
        //判断是否采用websocket通信
        if (config.websocket && config.websocket === 'on') {
            if (window.MozWebSocket || window.WebSocket) {
                var Socket = "MozWebSocket" in window ? MozWebSocket : WebSocket;
                //初始化websocket
                _message._sockets = {};
                _message.send = function (msg) {
                    var that = this;
                    //获取服务地址
                    var server = _defaultServer;
                    if (msg.serverId) {
                        server = _servers[msg.serverId];
                    }
                    var session = _sessions[server.id];
                    if (session && session.sid) {
                        msg.sid = session.sid;
                    }
                    that.createSeed(msg);
                    //构造json，对特殊字符转义
                    var value;
                    var ch;
                    var chType;
                    var msgText = '{';
                    for (var name in msg) {
                        value = msg[name];
                        chType = Object.prototype.toString.apply(value);
                        if (chType === '[object String]') {
                            msgText += '"' + name + '":"';
                            for (var index = 0; index < value.length; index++) {
                                ch = value.charAt(index);
                                switch (ch) {
                                    case '"':
                                        msgText += '\\"';
                                        break;
                                    case '\\':
                                        msgText += '\\\\';
                                        break;
                                    case '\b':
                                        msgText += '\\b';
                                        break;
                                    case '\n':
                                        msgText += '\\n';
                                        break;
                                    case '/':
                                        msgText += '\\/';
                                        break;
                                    case '\f':
                                        msgText += '\\f';
                                        break;
                                    case '\r':
                                        msgText += '\\r';
                                        break;
                                    case '\t':
                                        msgText += '\\t';
                                        break;
                                    default:
                                        msgText += ch;
                                }
                            }
                            msgText += '",';
                        } else if (chType === '[object Number]') {
                            msgText += '"' + name + '":"' + value + '",';
                        }
                    }
                    msgText = msgText.substr(0, msgText.length - 1);
                    msgText += '}';
                    var websocket = that._sockets[server.id];
                    if (websocket && websocket.readyState === 1) {
                        websocket.send(msgText);
                        websocket._logger.info(server.id + '-' + websocket.id + ':sendMessage:' + msgText);
                    } else {
                        websocket = new Socket(server.websocketUrl);
                        websocket._server = server;
                        websocket._logger = _logger;
                        server.index++;
                        websocket.id = server.index;
                        websocket.onopen = function (event) {
                            this._logger.info(this._server.id + '-' + this.id + ':connect:' + this._server.websocketUrl);
                            this.send(msgText);
                            this._logger.info(this._server.id + '-' + this.id + ':sendMessage:' + msgText);
                        };
                        websocket.onmessage = function (event) {
                            this._logger.info(this._server.id + '-' + this.id + ':onMessage:' + event.data);
                            var res = eval('(' + event.data + ')');
                            if (res.sid) {
                                //保持
                                this._logger.info(this._server.id + '-' + this.id + ':hold:' + res.sid);
                                that._sockets[this._server.id] = this;
                            }
                            try {
                                that.notify(res);
                            } catch (e) {
                                this._logger.error(this._server.id + '-' + this.id + ':error:' + e);
                            }
                        };
                        websocket.onclose = function (event) {
                            this._logger.info(this._server.id + '-' + this.id + ':close:' + this._server);
                        };
                        websocket.onerror = function (event) {
                            this._logger.info(this._server.id + '-' + this.id + ':error:' + this._server);
                        };
                    }
                };
                //websocket不需要comet推送
                _message.startComet = function () {
                };
            }
        }
        callback();
    };
    //添加服务器
    self.addServer = function (server) {
        server.index = 0;
        server.difftime = 0;
        if (server.key) {
            server.key = CryptoJS.enc.Utf8.parse(server.key);
        } else {
            server.key = _defaultKeyByte;
        }
        _servers[server.id] = server;
        if (server.default) {
            _defaultServer = server;
        }
        //
        var difftimeByte = CryptoJS.enc.Utf8.parse(server.id + '-difftime');
        var difftimeHex = CryptoJS.enc.Hex.stringify(difftimeByte);
        var difftimeCookie = _cookie.getCookie(difftimeHex);
        if (difftimeCookie) {
            server.difftime = parseInt(difftimeCookie);
            if (server.callback) {
                server.callback();
            }
        } else {
            //同步时间
            _message.send({wolf: 'TIME', 'serverId': server.id});
        }
    };
    return self;
});