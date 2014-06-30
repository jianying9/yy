define('yy/panel', ['require', 'yy/yy'], function(require) {
    var _yy = require('yy/yy');
    var _index = _yy.getIndex();
    var _utils = _yy.getUtils();
    var _event = _yy.getEvent();
    var self = {};
    self.parameters = ['scroll'];
    self.create = function(component, parameters) {
        var _extend = {};
        component._extend = _extend;
        component._utils = _utils;
        if (parameters.scroll === 'true') {
            //可以拥有滚动条
            _extend.scroll = 'true';
            var id = _index.nextIndex();
            var scrollHtml = '<div id="' + id + '" class="scroll"></div>';
            component.$this.append(scrollHtml);
            var $scroll = $('#' + id);
            _extend.$scroll = $scroll;
            //绑定滚动事件
            _event.bind(component, 'mousewheel', function(com, event, delta, deltaX, deltaY) {
                if (com._extend.scroll === 'true') {
                    var scrollHeight = com.$this[0].scrollHeight;
                    var clientHeight = com.$this[0].clientHeight;
                    if (clientHeight < scrollHeight) {
                        var speed = 50;
                        var top = com.$this.scrollTop();
                        if (delta > 0) {
                            speed = -speed;
                        }
                        var newTop = top + speed;
                        if (newTop > scrollHeight - clientHeight) {
                            newTop = scrollHeight - clientHeight;
                        }
                        if (newTop < 0) {
                            newTop = 0;
                        }
                        com._utils.scrollTop(newTop, com);
                        com.$this.scrollTop(newTop);
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
        return component;
    };
    return self;
});