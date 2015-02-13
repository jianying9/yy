define('yy/list', ['require', 'yy/yy', 'yy/list_item'], function(require) {
    var _yy = require('yy/yy');
    var _index = _yy.getIndex();
    var _utils = _yy.getUtils();
    var _components = _yy.getComponents();
    var self = {};
    self.parameters = ['scroll'];
    self.create = function(component, parameters) {
        var _extend = {};
        _extend.data = {};
        component._extend = _extend;
        component._utils = _utils;
        component._components = _components;
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
                                if (component._extend.scrollBottomEventHandler) {
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
                var dy = this._extend.clientHeight - this._extend.sHeight;
                this._utils.scrollTop(dy, this);
            }
        };
        component.scrollTop = function() {
            if (this._extend.scroll === 'true') {
                var $this = this.$this;
                var dy = this._extend.clientHeight - this._extend.sHeight;
                this._utils.scrollTop(-dy, this);
            }
        };
        //
        component.getPageIndex = function() {
            return this._extend.pageIndex;
        };
        component.setPageIndex = function(pageIndex) {
            this._extend.pageIndex = pageIndex;
        };
        component.getPageSize = function() {
            return this._extend.pageSize;
        };
        component.setPageSize = function(pageSize) {
            this._extend.pageSize = pageSize;
        };
        component.getPageNum = function() {
            return this._extend.pageNum;
        };
        component.setPageNum = function(pageNum) {
            this._extend.pageNum = pageNum;
        };
        component.getPageTotal = function() {
            return this._extend.pageTotal;
        };
        component.setPageTotal = function(pageTotal) {
            this._extend.pageTotal = pageTotal;
        };
        //
        component.init = function(config) {
            this._extend.itemDataToHtml = config.itemDataToHtml;
            this._extend.key = config.key;
            this._extend.itemClazz = config.itemClazz;
            this._extend.itemCompleted = config.itemCompleted;
            this._extend.scrollTopEventHandler = config.scrollTopEventHandler;
            this._extend.scrollBottomEventHandler = config.scrollBottomEventHandler;
            if (config.scrollSpeed) {
                this._extend.scrollSpeed = config.scrollSpeed;
            }
        };
        component.check = function() {
            if (!this._extend.key) {
                throw 'Un init list data key!id:' + this.id;
            }
            if (!this._extend.itemDataToHtml) {
                throw 'Un init list method itemDataToHtml!id:' + this.id;
            }
        };
        component.clear = function() {
            var child;
            for (var id in this.children) {
                child = this.children[id];
                if (child.type === 'list_item') {
                    child.remove();
                }
            }
            this.initScroll();
        };
        component.getItemData = function(keyValue) {
            return this._extend.data[keyValue];
        };
        component.getItemByKey = function(keyValue) {
            var result;
            var child;
            for (var id in this.children) {
                child = this.children[id];
                if (child.key == keyValue) {
                    result = child;
                    break;
                }
            }
            return result;
        };
        component.loadData = function(data) {
            var that = this;
            that.check();
            var key = that._extend.key;
            var keyValue;
            var itemClazz = that._extend.itemClazz;
            var html = '';
            var itemData;
            var item;
            var id;
            var itemCompleted = that._extend.itemCompleted;
            var localData = that._extend.data;
            for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                itemData = data[dataIndex];
                keyValue = itemData[key];
                if (!keyValue && keyValue !== 0) {
                    throw 'list loadData error! can not find value by key:' + key;
                }
                //如果key已经存在，则删除旧数据
                item = that.getItemByKey(keyValue);
                if (item) {
                    item.remove();
                }
                localData[keyValue] = itemData;
                id = keyValue + '';
                id = id.replace(/\W/g, '-');
                html += '<div id="' + id + '" key="' + keyValue + '" class="list_item ';
                if (itemClazz) {
                    html += itemClazz;
                }
                html += '">';
                html += that._extend.itemDataToHtml(itemData);
                html += '</div>';
            }
            that.$this.append(html);
            //
            var $child = that.$this.children('.list_item');
            $child.each(function() {
                //判断子节点是否已经解析过，如果解析过就不在解析
                var $this = $(this);
                var id = $this.attr('id');
                if (!that.children[id]) {
                    item = that._components.create({
                        type: 'list_item',
                        $this: $this,
                        parent: that
                    });
                    //调用item加载完成后执行方法
                    if (itemCompleted) {
                        itemCompleted(item);
                    }
                }
            });
            that.initScroll();
        };
        component.addItemData = function(itemData) {
            var item;
            var that = this;
            that.check();
            var key = that._extend.key;
            var itemClazz = that._extend.itemClazz;
            var html = '';
            var localData = that._extend.data;
            var itemCompleted = that._extend.itemCompleted;
            var keyValue = itemData[key];
            if (!keyValue && keyValue !== 0) {
                throw 'list addItemDataFirst error! can not find value by key:' + key;
            }
            //如果key已经存在，则删除旧数据
            item = that.getItemByKey(keyValue);
            if (item) {
                item.remove();
            }
            localData[keyValue] = itemData;
            var id = keyValue + '';
            id = id.replace(/\W/g, '-');
            html += '<div id="' + id + '" key="' + keyValue + '" class="list_item ';
            if (itemClazz) {
                html += itemClazz;
            }
            html += '">';
            html += that._extend.itemDataToHtml(itemData);
            html += '</div>';
            that.$this.append(html);
            //
            item = that._components.create({
                type: 'list_item',
                $this: $('#' + id),
                parent: that
            });
            //
            //调用item加载完成后执行方法
            if (itemCompleted) {
                itemCompleted(item);
            }
            that.initScroll();
            return item;
        };
        component.addItemDataFirst = function(itemData) {
            var item;
            var that = this;
            that.check();
            var key = that._extend.key;
            var itemClazz = that._extend.itemClazz;
            var html = '';
            var localData = that._extend.data;
            var itemCompleted = that._extend.itemCompleted;
            var keyValue = itemData[key];
            if (!keyValue && keyValue !== 0) {
                throw 'list addItemDataFirst error! can not find value by key:' + key;
            }
            //如果key已经存在，则删除旧数据
            item = that.getItemByKey(keyValue);
            if (item) {
                item.remove();
            }
            localData[keyValue] = itemData;
            var id = keyValue + '';
            id = id.replace(/\W/g, '-');
            html += '<div id="' + id + '" key="' + keyValue + '" class="list_item ';
            if (itemClazz) {
                html += itemClazz;
            }
            html += '">';
            html += that._extend.itemDataToHtml(itemData);
            html += '</div>';
            if (that.firstChild) {
                that.firstChild.$this.before(html);
            } else {
                that.$this.append(html);
            }
            //
            item = that._components.create({
                type: 'list_item',
                $this: $('#' + id),
                parent: that
            });
            that.firstChild = item;
            //
            //调用item加载完成后执行方法
            if (itemCompleted) {
                itemCompleted(item);
            }
            that.initScroll();
            return item;
        };
        component.removeItem = function(keyValue) {
            var child;
            for (var id in this.children) {
                child = this.children[id];
                if (child.key == keyValue) {
                    child.remove();
                    break;
                }
            }
            delete this._extend.data[keyValue];
            this.initScroll();
        };
        component.size = function() {
            var num = 0;
            for (var id in this._extend.data) {
                num++;
            }
            return num;
        };
        return component;
    };
    return self;
});