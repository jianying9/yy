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