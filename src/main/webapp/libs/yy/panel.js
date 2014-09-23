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
            _extend.scrollSpeed = 80;
            _extend.move = false;
            _extend.mouseLastY = 0;
            var id = _index.nextIndex();
            var scrollHtml = '<div id="' + id + '" class="scroll" style="height:0;top:0;"></div>';
            component.$this.append(scrollHtml);
            var $scroll = $('#' + id);
            _extend.$scroll = $scroll;
            _extend.scrollTopEventHandler = null;
            _extend.scrollBottomEventHandler = null;
            //滚动条事件
            //滚动条mousedown
            $scroll.mousedown(function(e) {
                _extend.$scroll.addClass('move');
                _extend.move = true;
                _extend.mouseLastY = e.pageY;
                var _root = component._components.getRoot();
                //绑定全局mousedown事件,当鼠标放开时，停止滚动
                _root.$this.bind('mouseup', function(e) {
                    $scroll.removeClass('move');
                    _extend.move = false;
                    _extend.mouseLastY = 0;
                    //允许选中
                    _root.$this.unbind('selectstart').css({
                        '-moz-user-select': 'text',
                        '-webkit-user-select': 'text',
                        '-ms-user-select': 'text',
                        '-khtml-user-select': 'text',
                        'user-select': 'text'
                    });
                    //解除mousemove,mouseup事件
                    _root.$this.unbind('mousemove');
                    _root.$this.unbind('mouseup');
                });
                //绑定全局mousemove,检测鼠标坐标的y轴变化，同步改变滚动条
                _root.$this.bind('mousemove', function(e) {
                    if (_extend.move) {
                        var scrollHeight = component.$this[0].scrollHeight;
                        var clientHeight = component.$this[0].clientHeight;
                        if (clientHeight < scrollHeight) {
                            var dy = e.pageY - _extend.mouseLastY;
                            var result = component._utils.scrollTop(dy, component);
                            switch (result) {
                                case 1:
                                    if (component._extend.scrollTopEventHandler) {
                                        component._extend.scrollTopEventHandler(component);
                                    }
                                    break;
                                case 2:
                                    if (component._extend.scrollBottomEventHandler) {
                                        component._extend.scrollBottomEventHandler(component);
                                    }
                                    break;
                            }
                            _extend.mouseLastY = e.pageY;
                        }

                    }
                });
                //禁止选中
                _root.$this.bind('selectstart', function() {
                    return false;
                }).css({
                    '-moz-user-select': 'none',
                    '-webkit-user-select': 'none',
                    '-ms-user-select': 'none',
                    '-khtml-user-select': 'none',
                    'user-select': 'none'
                });
            });
            //绑定滚动事件
            component.$this.mousewheel(function(e, delta, deltaX, deltaY) {
                if (component._extend.scroll === 'true') {
                    var scrollHeight = component.$this[0].scrollHeight;
                    var clientHeight = component.$this[0].clientHeight;
                    if (clientHeight < scrollHeight) {
                        var speed = component._extend.scrollSpeed;
                        if (delta > 0) {
                            speed = -speed;
                        }
                        var result = component._utils.scrollTop(speed, component);
                        switch (result) {
                            case 1:
                                if (component._extend.scrollTopEventHandler) {
                                    component._extend.scrollTopEventHandler(component);
                                }
                                break;
                            case 2:
                                if(component._extend.scrollBottomEventHandler) {
                                    component._extend.scrollBottomEventHandler(component);
                                }
                                break;
                        }
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