define('yy/module', ['require', './yy'], function(require) {
    var yy = require('./yy');
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
    var _components = yy.getComponents();
    //模块加载moduleLoader
    self.loadModule = function(moduleId, callback, loader) {
        if (!loader) {
            loader = _components.getRoot();
        }
        var component = _components.findChildByKey(loader, moduleId);
        if (component) {
            if (callback) {
                callback(component);
            }
        } else {
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
        }
    };
    return self;
});