define('yy/button', ['require', 'yy/yy'], function(require) {
    var self = {};
    self.parameters = [];
    self.create = function(component, parameters) {
        component.setLabel = function(label) {
            this.$this.text(label);
        };
        component.getLabel = function() {
            return this.$this.text();
        };
        return component;
    };
    return self;
});
define('yy/config' ,['require'], function(require) {
    var self = {};
    //模块解析顺序
    model = {};
    model.skip = ['form', 'button', 'panel', 'label', 'list', 'skip'];
    model.module = ['form', 'button', 'panel', 'label', 'list', 'skip'];
    model.form = ['button', 'label', 'skip'];
    model.button = [];
    model.label = [];
    model.panel = ['form', 'button', 'panel', 'label', 'list', 'skip'];
    model.list = ['list_item'];
    model.list_item = ['form', 'button', 'label', 'list', 'skip'];
    //
    self.model = model;
    return self;
});
define('yy/form', ['require', 'yy/yy'], function(require) {
    var _yy = require('yy/yy');
    var _utils = _yy.getUtils();
    var self = {};
    self.parameters = [];
    self.create = function(component, parameters) {
        var _extend = {};
        component._extend = _extend;
        component._utils = _utils;
        _extend.$fields = {};
        _extend.$files = {};
        _extend.lastData = {};
        component.init = function() {
            var that = this;
            var $fields = that.$this.find('input,textarea');
            $fields.each(function() {
                var $this = $(this);
                var name = $this.attr('name');
                if (name) {
                    var type = $this.attr('type');
                    if (type === 'file') {
                        that._extend.$files[name] = $this;
                    } else if (type === 'radio') {
                        var checked = $this.prop('checked');
                        if (checked) {
                            that._extend.$fields[name] = $this;
                        }
                    } else {
                        that._extend.$fields[name] = $this;
                    }
                }
            });
        };
        component.getFile = function(name) {
            var file;
            var $file = this._extend.$files[name];
            if ($file) {
                var value = $file.val();
                if (value) {
                    file = $file[0].files[0];
                }
            }
            return file;
        };
        //
        component.getData = function() {
            var $fields = this._extend.$fields;
            var data = {};
            var $field;
            var value;
            for (var name in $fields) {
                $field = $fields[name];
                value = $field.val();
                value = this._utils.trim(value);
                data[name] = value;
            }
            return data;
        };
        component.getField = function(name) {
            var $fields = this._extend.$fields;
            return $fields[name];
        };
        component.setData = function(name, value) {
            var $fields = this._extend.$fields;
            var $field = $fields[name];
            if ($field) {
                $field.val(value);
            }
        };
        component.focus = function(name) {
            var $fields = this._extend.$fields;
            var $field = $fields[name];
            if ($field) {
                //控制光标到文字输入最后
                var value = $field.val();
                var input = $field[0];
                if (input.createTextRange) {
                    var range = input.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', value.length);
                    range.moveStart('character', value.length);
                    range.select();
                } else if (input.setSelectionRange) {
                    input.focus(); 
                    input.setSelectionRange(value.length, value.length);
                }
            }
        };
        //
        component.loadData = function(data) {
            var $fields = this._extend.$fields;
            var value;
            for (var name in $fields) {
                value = data[name];
                if (value || value === '' || value === 0) {
                    $fields[name].val(value);
                }
            }
        };
        //
        component.clear = function() {
            var $fields = this._extend.$fields;
            for (var name in $fields) {
                $fields[name].val('');
            }
            var $files = this._extend.$files;
            for (var name in $files) {
                $files[name].val('');
            }
        };
        //初始化
        component.init();
        return component;
    };
    return self;
});
define('yy/label', ['require', 'yy/yy'], function(require) {
    var self = {};
    self.parameters = [];
    self.create = function(component, parameters) {
        component.setLabel = function(label) {
            this.$this.text(label);
        };
        component.getLabel = function() {
            return this.$this.text();
        };
        return component;
    };
    return self;
});
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
define('yy/list_item', ['require', 'yy/yy'], function(require) {
    var self = {};
    self.parameters = [];
    self.create = function(component, parameters) {
        component.getData = function() {
            var data = this.parent._extend.data;
            return data[this.key];
        };
        component.setData = function(name, value) {
            var data = this.parent._extend.data;
            var itemData = data[this.key];
            if(itemData) {
                itemData[name] = value;
            }
        };
        component.selected = function() {
            var $this = this.$this;
            var $that;
            if ($this.hasClass('selected') === false) {
                for (var id in this.parent.children) {
                    $that = this.parent.children[id].$this;
                    if($that.hasClass('selected')) {
                        $that.removeClass('selected');
                        break;
                    }
                }
                $this.addClass('selected');
            }
        };
        component.unselected = function() {
            var $this = this.$this;
            $this.removeClass('selected');
        };
        return component;
    };
    return self;
});
define('yy/module', ['require', 'yy/yy'], function(require) {
    var _yy = require('yy/yy');
    var self = {};
    self.parameters = [];
    self.create = function(component, parameters) {
        component._extend = {};
        component.getContext = function(key) {
            return this._extend[key];
        };

        component.setContext = function(obj) {
            for (var name in obj) {
                this._extend[name] = obj[name];
            }
        };
        component._findByKey = function(key, parent) {
            var result;
            var child;
            //先扫描当前子节点
            for (var indexId in parent.children) {
                child = parent.children[indexId];
                if (child.key == key) {
                    result = child;
                    break;
                }
            }
            //如果当前子节点没有，则开始递归扫描
            if (!result) {
                for (var indexId in parent.children) {
                    child = parent.children[indexId];
                    if (child.type !== 'module') {
                        result = this._findByKey(key, child);
                        if (result) {
                            break;
                        }
                    }
                }
            }
            return result;
        };
        component.findByKey = function(key) {
            var result;
            if (this.key == key) {
                result = this;
            } else {
                result = this._findByKey(key, this);
            }
            return result;
        };
        return component;
    };
    var _components = _yy.getComponents();
    //模块加载moduleLoader
    self.loadModule = function(moduleId, callback, loader) {
        _components.init();
        if (!loader) {
            loader = _components.getRoot();
        }
        var component = _components.findChildByKey(loader, moduleId);
        if (component) {
            component.remove();
        }
        require([moduleId], function(module) {
            var htmlUrl = 'text!' + moduleId + '.html';
            require([htmlUrl], function(html) {
                loader.$this.append(html);
                var $this = $('#' + moduleId);
                var component = _components.create({
                    type: 'module',
                    $this: $this,
                    parent: loader
                });
                if (module.init) {
                    module.init(component);
                }
                if (callback) {
                    callback(component);
                }
            });
        });
    };
    //初始化root模块
    self.initModule = function(callback) {
        _components.init(callback);
    };
    return self;
});
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
/**
 * yy核心库
 */

define('yy/yy', ['require', 'jquery', 'yy/config', 'crypto'], function(require) {
//require用于依赖加载
    var self = {};
    var _config = require('yy/config');
    //浏览器信息
    var _browser = {};
    _browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
    _browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
    _browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
    _browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
    //计数器
    var _index = {
        currentIndex: (new Date()).getTime(),
        zIndex: 20,
        nextIndex: function() {
            this.currentIndex++;
            return this.currentIndex.toString();
        },
        nextZIndex: function() {
            this.zIndex++;
            return this.zIndex.toString();
        }
    };
    self.getIndex = function() {
        return _index;
    };
    //context上下文对象
    var _context = {
        httpServer: 'http://127.0.0.1/service.io',
        webSocketServer: 'ws://127.0.0.1/service.io',
        defaultUrl: '',
        logLevel: 3,
        version: 1
    };
    self.setConfig = function(config) {
        for (var name in config) {
            _context[name] = config[name];
        }
    };
    self.getConfig = function(name) {
        return _context[name];
    };
    //utils创建工具对象
    var _utils = {
        attr: function(name, $target, defValue) {
            var value = $target.attr(name);
            if (!value) {
                value = defValue;
            }
            return value;
        },
        trim: function(value) {
            return $.trim(value);
        },
        getDate: function() {
            var date = new Date();
            var month = date.getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            var day = date.getDate();
            if (day < 10) {
                day = '0' + day;
            }
            var result = date.getFullYear() + '-' + month + '-' + day;
            return result;
        },
        getDateTime: function() {
            var date = new Date();
            var month = date.getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }
            var day = date.getDate();
            if (day < 10) {
                day = '0' + day;
            }
            var hour = date.getHours();
            if (hour < 10) {
                hour = '0' + hour;
            }
            var minute = date.getMinutes();
            if (minute < 10) {
                minute = '0' + minute;
            }
            var second = date.getSeconds();
            if (second < 10) {
                second = '0' + second;
            }
            var result = date.getFullYear() + '-' + month + '-'
                    + day + ' ' + hour + ':'
                    + minute + ':' + second;
            return result;
        },
        shortDate: function(thisDateStr) {
            var result = thisDateStr;
            thisDateStr = thisDateStr.replace(/-/g, '/');
            var thisDate = new Date(Date.parse(thisDateStr));
            var nowDate = new Date();
            var dYear = nowDate.getFullYear() - thisDate.getFullYear();
            if (dYear === 0) {
                var dMonth = nowDate.getMonth() - thisDate.getMonth();
                if (dMonth === 0) {
                    var dDay = nowDate.getDate() - thisDate.getDate();
                    if (dDay <= 2) {
                        switch (dDay) {
                            case 2:
                                result = '前天 ' + thisDateStr.split(' ')[1];
                                break;
                            case 1:
                                result = '昨天 ' + thisDateStr.split(' ')[1];
                                break;
                            default:
                                result = thisDateStr.split(' ')[1];
                        }
                    }
                }
            }
            return result;
        },
        initScroll: function(clientHeight, scrollHeight, component) {
            var _extend = component._extend;
            var sHeight = 0;
            if (clientHeight < scrollHeight) {
                _extend.scrollHeight = scrollHeight;
                _extend.clientHeight = clientHeight;
                var sHeight = parseInt(Math.pow(clientHeight, 2) / scrollHeight);
                _extend.seed = (scrollHeight - clientHeight) / (scrollHeight - sHeight);
                _extend.sHeight = sHeight;
            }
            _extend.$scroll.css({height: sHeight});
        },
        scrollTop: function(dy, component) {
            //0-滚动到头部，1-在中间，2滚动到底部
            var result = 1;
            var _extend = component._extend;
            var scrollTop = component.$this.scrollTop();
            var cssTop = parseInt(_extend.$scroll.css('top'));
            var newCssTop = parseInt((dy + cssTop - scrollTop) / (1 - _extend.seed));
            var newScrollTop = parseInt(newCssTop * _extend.seed);
            if (newCssTop + _extend.sHeight > _extend.scrollHeight) {
                newCssTop = _extend.scrollHeight - _extend.sHeight;
                newScrollTop = _extend.scrollHeight - _extend.clientHeight;
                //滚动到底部
                result = 2;
            }
            if (newCssTop < 0) {
                newCssTop = 0;
                newScrollTop = 0;
                //滚动到头部
                result = 1;
            }
            _extend.$scroll.css({top: newCssTop});
            component.$this.scrollTop(newScrollTop);
            return result;
        },
        validate: function(data, config) {
            var result = true;
            var value;
            for (var name in config) {
                value = data[name];
                if (!value || value === '') {
                    result = false;
                    config[name].failure();
                    break;
                } else {
                    config[name].success();
                }
            }
            return result;
        }
    };
    self.getUtils = function() {
        return _utils;
    };
    //logger日志对象
    var _logger = {};
    if (_browser.mozilla || _browser.webkit) {
        _logger._loggerImpl = console;
        _logger._context = _context;
        _logger.debug = function(msg) {
            if (this._loggerImpl && this._context.logLevel >= 4) {
                var date = _utils.getDateTime();
                this._loggerImpl.debug(date + '-DEBUG:' + msg);
            }
        };
        _logger.info = function(msg) {
            if (this._loggerImpl && this._context.logLevel >= 3) {
                var date = _utils.getDateTime();
                this._loggerImpl.debug(date + '-INFO:' + msg);
            }
        };
        _logger.warn = function(msg) {
            if (this._loggerImpl && this._context.logLevel >= 2) {
                var date = _utils.getDateTime();
                this._loggerImpl.debug(date + '-WARN:' + msg);
            }
        };
        _logger.error = function(msg) {
            if (this._loggerImpl && this._context.logLevel >= 1) {
                var date = _utils.getDateTime();
                this._loggerImpl.debug(date + '-ERROR:' + msg);
            }
        };
    } else {
        _logger.debug = function(msg) {
        };
        _logger.info = function(msg) {
        };
        _logger.warn = function(msg) {
        };
        _logger.error = function(msg) {
        };
    }
    var _key = 'wolf2014';
    //获取url参数
    self.getUrlPara = function() {
        var result = {};
        var text = window.location.search;
        var index = text.indexOf('?');
        text = text.substr(index + 1, text.length);
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
    self.getCookie = function(name) {
        return _cookie.getCookie(name);
    };
    self.setCookie = function(key, value, options) {
        _cookie.setCookie(key, value, options);
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
    //初始session
    var urlParas = self.getUrlPara();
    if (urlParas._s) {
        var _s = decodeURIComponent(urlParas._s);
        var keyHex = CryptoJS.enc.Utf8.parse(_key);
        var s = CryptoJS.DES.decrypt(_s, keyHex, {iv: keyHex});
        s = CryptoJS.enc.Utf8.stringify(s);
        var session = eval('(' + s + ')');
        self.setSession(session);
    }
    //创建带session的url，获取boolean,string,number类型的session信息
    self.createUrl = function(url) {
        //session加密
        var type;
        var hasSession = false;
        var s = '{';
        for (var name in _session) {
            type = typeof(_session[name]);
            switch (type) {
                case 'boolean':
                    s += '"' + name + '":' + _session[name] + ',';
                    hasSession = true;
                    break;
                case 'number':
                    s += '"' + name + '":' + _session[name] + ',';
                    hasSession = true;
                    break;
                case 'string':
                    s += '"' + name + '":"' + _session[name] + '",';
                    hasSession = true;
                    break;
            }
        }
        if (hasSession) {
            s = s.substr(0, s.length - 1);
        }
        s += '}';
        var keyHex = CryptoJS.enc.Utf8.parse(_key);
        var es = CryptoJS.DES.encrypt(s, keyHex, {iv: keyHex});
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
    self.openUrl = function(url) {
        var u = this.createUrl(url);
        window.open(u);
    };
    //改变页面
    self.changeUrl = function(url) {
        var u = this.createUrl(url);
        window.location.href = u;
    };
    //定时任务
    var _timerTaskManager = {
        _index: _index,
        _logger: _logger,
        _taskQueue: {},
        submitTask: function(task) {
            if (!task.id) {
                task.id = this._index.nextIndex();
            }
            if (!task.nextTime || task.nextTime < 1) {
                task.nextTime = 2;
            }
            this._taskQueue[task.id] = task;
        },
        start: function() {
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
    setInterval(function() {
        try {
            _timerTaskManager.start();
        } catch (e) {
            _logger.error('timer error' + e);
        }
    }, 500);
    self.submitTimerTask = function(timerTask) {
        _timerTaskManager.submitTask(timerTask);
    };
    //创建事件管理对象
    var _event = {
        click: {},
        dbclick: {},
        keydown: {},
        bind: function(component, type, func) {
            if (this[type]) {
                this[type][component.id] = func;
            }
        },
        unbind: function(component, type) {
            var id = component.id;
            if (type) {
                var eventType = this[type];
                if (eventType) {
                    delete eventType[id];
                }
            } else {
                delete this.click[id];
                delete this.dbclick[id];
                delete this.keydown[id];
            }
        },
        getFunc: function(component, type) {
            var func;
            var id = component.id;
            if (this[type]) {
                func = this[type][id];
            }
            return func;
        }
    };
    self.getEvent = function() {
        return _event;
    };
    //message消息管理对象
    var _message = {
        difftime: 0,
        desKey: _key,
        actions: {},
        _logger: _logger,
        listen: function(component, actionName, func) {
            var action = this.actions[actionName];
            if (!action) {
                action = {};
                this.actions[actionName] = action;
            }
            action[component.id] = {
                target: component,
                func: func
            };
        },
        remove: function(component) {
            var id = component.id;
            var action;
            for (var actionName in this.actions) {
                action = this.actions[actionName];
                delete action[id];
            }
        },
        createSeed: function(msg) {
            var serverTime = ((new Date()).getTime() + this.difftime).toString();
            var keyHex = CryptoJS.enc.Utf8.parse(this.desKey);
            var seed = CryptoJS.DES.encrypt(serverTime, keyHex, {iv: keyHex});
            seed = CryptoJS.enc.Hex.stringify(seed.ciphertext);
            msg.seed = seed;
        },
        notify: function(res) {
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
                        if (res.sid) {
                            _session.sid = res.sid;
                        }
                        var listener;
                        for (var id in action) {
                            listener = action[id];
                            listener.func(listener.target, res);
                        }
                    }
                } else {
                    if (res.wolf) {
                        if (res.wolf === 'TIME') {
                            //时间同步
                            var clientTime = (new Date()).getTime();
                            this.difftime = res.time - clientTime;
                            //写入cookie
                            var difftimeByte = CryptoJS.enc.Utf8.parse('difftime');
                            var difftimeHex = CryptoJS.enc.Hex.stringify(difftimeByte);
                            _cookie.setCookie(difftimeHex, this.difftime.toString(), {expires: 1});
                            //判断是否有时间同步回调方法
                            var timeInit = self._timeInit;
                            if (timeInit) {
                                timeInit();
                                delete self._timeInit;
                            }
                        } else if (res.wolf === 'SHUTDOWN') {
                            if (_context.defaultUrl) {
                                window.location.href = _context.defaultUrl;
                            }
                        }
                    }
                }
            }
        },
        send: function(msg) {
            msg.sid = _session.sid;
            var that = this;
            that.createSeed(msg);
            $.getJSON(_context.httpServer + '?callback=?', msg, function(res) {
                try {
                    that.notify(res);
                } catch (e) {
                    that._logger.error('error:' + e);
                }
            });
        },
        startComet: function() {
            var that = this;
            var getPushMessage = function() {
                $.getJSON(_context.httpServer + '?callback=?', {wolf: 'PUSH', sid: _session.sid}, function(res) {
                    //PUSH STOP
                    if (res.wolf) {
                        if (res.wolf === 'PUSH_TIMEOUT') {
                            getPushMessage();
                        }
                    } else {
                        try {
                            that.notify(res);
                        } catch (e) {
                            that._logger.error('error:' + e);
                        }
                        getPushMessage();
                    }
                });
            };
            getPushMessage();
        }
    };
    self.getMessage = function() {
        return _message;
    };
    //初始化body
    var $body = $('body');
    $body.attr({
        id: 'root',
        type: 'module'
    });
    //components组建对象管理
    var _components = {
        _init: false,
        _root: {
            $this: $body
        },
        _logger: _logger,
        _index: _index,
        _utils: _utils,
        _event: _event,
        _message: _message,
        init: function(callback) {
            if (!this._init) {
                this._root = this.create({
                    type: 'module',
                    $this: $body,
                    parent: null
                });
                this._init = true;
                if (callback) {
                    callback(this._root);
                }
            }
        },
        getRoot: function() {
            return this._root;
        },
        findChildByKey: function(parent, key) {
            var result;
            var child;
            var children = parent.children;
            for (var indexId in children) {
                child = children[indexId];
                if (child.key == key) {
                    result = child;
                    break;
                }
            }
            return result;
        },
        findById: function(id, loader) {
            var result;
            if (!loader) {
                loader = this._root;
            }
            if (id === loader.id) {
                result = loader;
            } else {
                var child;
                var children = loader.children;
                //先扫描当前子节点
                for (var indexId in children) {
                    child = children[indexId];
                    if (child.id == id) {
                        result = child;
                        break;
                    }
                }
                //如果当前子节点没有，则开始递归扫描
                if (!result) {
                    for (var indexId in children) {
                        child = children[indexId];
                        result = this.findById(id, child);
                        if (result) {
                            break;
                        }
                    }
                }
            }
            return result;
        },
        create: function(ctx) {
            var _components = this;
            var parent = ctx.parent;
            if (ctx.type === 'skip') {
                //遍历所有子控件
                var innerModels = _config.model.skip;
                for (var index = 0; index < innerModels.length; index++) {
                    var type = innerModels[index];
                    var $child = ctx.$this.children('.' + type);
                    $child.each(function() {
                        _components.create({
                            type: type,
                            $this: $(this),
                            parent: parent
                        });
                    });
                }
            } else {
                //
                var key = ctx.$this.attr('key');
                if (!key) {
                    key = ctx.$this.attr('id');
                }
                var id = _components._index.nextIndex();
                var component = {
                    id: id,
                    type: ctx.type,
                    $this: ctx.$this,
                    parent: parent,
                    key: key,
                    children: {},
                    _components: _components
                };
                component.$this.attr('id', id);
                if (component.parent) {
                    component.parent.children[id] = component;
                }
                var model = require('yy/' + ctx.type);
                //读取配置参数
                var parameters = {};
                var attrName, attrValue;
                for (var index = 0; index < model.parameters.length; index++) {
                    attrName = model.parameters[index];
                    attrValue = _components._utils.attr(attrName, component.$this);
                    parameters[attrName] = attrValue;
                }
//创建组件
                model.create(component, parameters);
                //组件固有方法
                component.show = function() {
                    this.$this.show();
                };
                component.hide = function() {
                    this.$this.hide();
                };
                component.isVisible = function() {
                    return this.$this.is(':visible');
                };
                component.findChildByKey = function(key) {
                    return this._components.findChildByKey(this, key);
                };
                component.removeChildren = function() {
                    var child;
                    for (var id in this.children) {
                        child = this.children[id];
                        child.remove();
                    }
                    this.children = {};
                };
                component.remove = function() {
                    //清除所有子节点
                    this.removeChildren();
                    _components._event.unbind(this);
                    _components._message.remove(this);
                    this.$this.remove();
                    if (this.parent) {
                        delete this.parent.children[this.id];
                        //重新判断父节点的firstChild
                        if (this.parent.firstChild === this) {
                            this.parent.firstChild = null;
                            for (var id in this.parent.children) {
                                this.parent.firstChild = this.parent.children[id];
                                break;
                            }
                        }
                    }
                };
                //修改parent的firstChild
                if (parent && !parent.firstChild) {
                    parent.firstChild = component;
                }
                //创建内部组件
                var innerModels = _config.model[ctx.type];
                for (var index = 0; index < innerModels.length; index++) {
                    var type = innerModels[index];
                    var $child = ctx.$this.children('.' + type);
                    $child.each(function() {
                        var result = _components.create({
                            type: type,
                            $this: $(this),
                            parent: component
                        });
                        if (type !== 'skip') {
                            result.$this.removeClass('skip');
                        }
                    });
                }
                _components._logger.debug('create component finished.type:' + ctx.type + ' key:' + key + ' id:' + id);
                return component;
            }
        }
    };
    self.getComponents = function() {
        return _components;
    };
    //
    self.init = function(config, callback) {
        //保存配置
        this.setConfig(config);
        //判断是否采用websocket通信
        if (config.websocket && config.websocket === 'on') {
            if ((window.MozWebSocket || window.WebSocket) && _context.webSocketServer) {
                var Socket = "MozWebSocket" in window ? MozWebSocket : WebSocket;
                //初始化websocket
                _message.index = 0;
                _message.send = function(msg) {
                    var that = this;
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
                        } else if(chType === '[object Number]') {
                            msgText += '"' + name + '":"' + value + '",';
                        }
                    }
                    msgText = msgText.substr(0, msgText.length - 1);
                    msgText += '}';
                    if (that.webSocket && that.webSocket.readyState === 1) {
                        that.webSocket.send(msgText);
                        that.webSocket._logger.info(that.webSocket.id + ':sendMessage:' + msgText);
                    } else {
                        that.index++;
                        var webSocket = new Socket(_context.webSocketServer);
                        webSocket._server = _context.webSocketServer;
                        webSocket._logger = _logger;
                        webSocket._event = _event;
                        webSocket.id = that.index;
                        webSocket.onopen = function(event) {
                            this._logger.info(this.id + ':connect:' + this._server);
                            this.send(msgText);
                            this._logger.info(this.id + ':sendMessage:' + msgText);
                        };
                        webSocket.onmessage = function(event) {
                            this._logger.info(this.id + ':onMessage:' + event.data);
                            var res = eval('(' + event.data + ')');
                            if (res.sid) {
                                //保持
                                this._logger.info(this.id + ':hold:' + res.sid);
                                that.webSocket = this;
                            }
                            try {
                                that.notify(res);
                            } catch (e) {
                                this._logger.error(this.id + ':error:' + e);
                            }
                        };
                        webSocket.onclose = function(event) {
                            this._logger.info(this.id + ':close:' + this._server);
                        };
                        webSocket.onerror = function(event) {
                            this._logger.info(this.id + ':error:' + this._server);
                        };
                    }
                };
                //websocket不需要comet推送
                _message.startComet = function() {
                };
            }
        }
        //初始化通信密钥
        if (config.key) {
            var keyArray = CryptoJS.enc.Hex.parse(config.key);
            _message.desKey = CryptoJS.enc.Utf8.stringify(keyArray);
            //检测cookie
            var difftimeByte = CryptoJS.enc.Utf8.parse('difftime');
            var difftimeHex = CryptoJS.enc.Hex.stringify(difftimeByte);
            var difftimeCookie = _cookie.getCookie(difftimeHex);
            if (difftimeCookie) {
                _message.difftime = parseInt(difftimeCookie);
                callback();
            } else {
                //设置时间同步后回调初始化方法
                this._timeInit = callback;
                //同步时间
                _message.send({wolf: 'TIME'});
            }
        } else {
            callback();
        }
    };
    //初始化事件响应
    $body.click(function(event) {
        var target = event.target;
        while (target.id === '') {
            target = target.parentNode;
        }
        if (target) {
            var targetId = target.id;
            var component = _components.findById(targetId);
            if (component) {
                var func = _event.click[component.id];
                if (func) {
                    func(component, event);
                }
            }
        }
    });
    $body.dblclick(function(event) {
        var target = event.target;
        while (target.id === '') {
            target = target.parentNode;
        }
        if (target) {
            var targetId = target.id;
            var component = _components.findById(targetId);
            if (component) {
                var func = _event.dbclick[component.id];
                if (func) {
                    func(component, event);
                }
            }
        }
    });
    $body.keydown(function(event) {
        var target = event.target;
        while (target.id === '') {
            target = target.parentNode;
        }
        if (target) {
            var targetId = target.id;
            var component = _components.findById(targetId);
            if (component) {
                var func = _event.keydown[component.id];
                if (func) {
                    func(component, event);
                }
            }
        }
    });
    return self;
});
