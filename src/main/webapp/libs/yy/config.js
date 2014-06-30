define('yy/config' ,['require'], function(require) {
    var self = {};
    //模块解析顺序
    model = {};
    model.skip = ['skip', 'form', 'button', 'panel', 'label', 'list'];
    model.module = ['skip', 'form', 'button', 'panel', 'label', 'list'];
    model.form = ['skip', 'button', 'label'];
    model.button = [];
    model.label = [];
    model.panel = ['skip', 'form', 'button', 'panel', 'label', 'list'];
    model.list = ['list_item'];
    model.list_item = ['skip', 'form', 'button', 'label', 'list'];
    //
    self.model = model;
    return self;
});