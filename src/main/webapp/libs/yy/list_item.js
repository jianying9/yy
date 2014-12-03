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