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