define('yy/panel', ['require', 'yy/yy'], function(require) {
    var _yy = require('yy/yy');
    var _index = _yy.getIndex();
    var _utils = _yy.getUtils();
    var self = {};
    self.parameters = ['scroll'];
    self.create = function(component, parameters) {
        var _extend = {};
        component._extend = _extend;
        component._utils = _utils;
        if (parameters.scroll === 'true') {
            //可以拥有滚动条
            _extend.scroll = 'true';
            _extend.scrollSpeed = 100;
            var id = _index.nextIndex();
            var scrollHtml = '<div id="' + id + '" class="scroll"></div>';
            component.$this.append(scrollHtml);
            var $scroll = $('#' + id);
            _extend.$scroll = $scroll;
            //绑定滚动事件
            component.$this.mousewheel(function(event, delta, deltaX, deltaY) {
                if (component._extend.scroll === 'true') {
                    var scrollHeight = component.$this[0].scrollHeight;
                    var clientHeight = component.$this[0].clientHeight;
                    if (clientHeight < scrollHeight) {
                        var speed = component._extend.scrollSpeed;
                        var top = component.$this.scrollTop();
                        if (delta > 0) {
                            speed = -speed;
                        }
                        var newTop = top + speed;
                        if (newTop > scrollHeight - clientHeight) {
                            newTop = scrollHeight - clientHeight;
                            //滚动到底部
                            if (component._extend.scrollBottomEventHandler) {
                                component._extend.scrollBottomEventHandler(component);
                            }
                        }
                        if (newTop < 0) {
                            newTop = 0;
                            //滚动到头部
                            if (component._extend.scrollTopEventHandler) {
                                component._extend.scrollTopEventHandler(component);
                            }
                        }
                        component._utils.scrollTop(newTop, component);
                        component.$this.scrollTop(newTop);
                    } else {
                        component._extend.$scroll.css({height: 0});
                        //滚动到头部
                        if (component._extend.scrollTopEventHandler) {
                            component._extend.scrollTopEventHandler(component);
                        }
                    }
                }
            });
        } else {
            _extend.scroll = 'false';
        }
        component.initScroll = function() {
            if (this._extend.scroll === 'true') {
                var $this = this.$this;
                var scrollHeight = $this[0].scrollHeight;
                var clientHeight = $this[0].clientHeight;
                this._utils.initScroll(clientHeight, scrollHeight, this);
            }
        };
        component.scrollBottom = function() {
            if (this._extend.scroll === 'true') {
                var $this = this.$this;
                var scrollHeight = $this[0].scrollHeight;
                var clientHeight = $this[0].clientHeight;
                var newTop = scrollHeight - clientHeight;
                this._utils.scrollTop(newTop, this);
                $this.scrollTop(newTop);
            }
        };
        component.scrollTop = function() {
            if (this._extend.scroll === 'true') {
                var $this = this.$this;
                this._utils.scrollTop(0, this);
                $this.scrollTop(0);
            }
        };
        component.init = function(config) {
            this._extend.scrollTopEventHandler = config.scrollTopEventHandler;
            this._extend.scrollBottomEventHandler = config.scrollBottomEventHandler;
            if (config.scrollSpeed) {
                this._extend.scrollSpeed = config.scrollSpeed;
            }
        };
        return component;
    };
    return self;
});