/**
 * yy mobile核心库
 */

define(function(require) {
//require用于依赖加载
    require('jquery');
    var self = {};
    //context上下文对象
    var _context = {
        httpServer: 'http://127.0.0.1/service.io'
    };
    self.setConfig = function(config) {
        for (var name in config) {
            _context[name] = config[name];
        }
    };
    self.getConfig = function(name) {
        return _context[name];
    };
    //获取url参数
    self.getUrlPara = function() {
        var result = {};
        var text = window.location.search;
        var num = text.indexOf('?');
        text = text.substr(num + 1);
        var paraArr = text.split('&');
        var para;
        for (var index = 0; index < paraArr.length; index++) {
            para = paraArr[index].split('=');
            result[para[0]] = para[1];
        }
        return result;
    };
    //cookie对象
    var _cookie = {
        setCookie: function(key, value, options) {
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
        getCookie: function(name) {
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
    self.getCookie = function() {
        return _cookie;
    };
    //session对象
    var _session = {};
    self.setSession = function(config) {
        for (var name in config) {
            _session[name] = config[name];
        }
    };
    self.getSession = function(name) {
        return _session[name];
    };
    self.clearSession = function() {
        for (var name in _session) {
            delete _session[name];
        }
    };
    //utils创建工具对象
    var _utils = {
        trim: function(value) {
            return $.trim(value);
        },
        shortDate: function(thisDateStr, nowDate) {
            var result;
            thisDateStr = thisDateStr.replace(/-/g, '/');
            var thisDate = new Date(Date.parse(thisDateStr));
            var dYear = nowDate.getFullYear() - thisDate.getFullYear();
            if (dYear > 0) {
                result = dYear + '年前';
            } else {
                var dMonth = nowDate.getMonth() - thisDate.getMonth();
                if (dMonth > 0) {
                    result = dMonth + '月前';
                } else {
                    var dDay = nowDate.getDate() - thisDate.getDate();
                    if (dDay > 0) {
                        result = dDay + '天前';
                    } else {
                        result = thisDateStr.split(' ')[1];
                    }
                }
            }
            return result;
        },
        validate: function(configs) {
            var config;
            var value;
            var error = '';
            for(var index = 0; index < configs.length; index++) {
                config = configs[index];
                if(config.$field.val() === '') {
                    error = config.error;
                    break;
                }
            }
            return error;
        }
    };
    self.getUtils = function() {
        return _utils;
    };
//返回
    return self;
});