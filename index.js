(function($, _, Backbone, win) {
    var SettingsModel = Backbone.Model.extend({
        defaults: {
            height: '250',
            width: '320',
            URL: 'http://',
            responsive: false,
        },
        validate: function(attrs, options) {
            if (this.hasChanged('responsive')) {
                if (attrs.responsive) {
                    this.set('width', '100%');
                } else {
                    this.set('width', this.defaults.width);
                }
            }
            if (!attrs.URL.match(/^http/i)) {
                return 'The URL can only start with http';
            }
        }
    });

    var ContainerView = Backbone.View.extend({
        el: $('#container'),
        initialize: function() {
            this.listenTo(this.model, 'change', this.isValid);

            $.ajax('template.html', {
                cache: false,
                success: this.setTemplate,
                context: this,
                error: function(arg1, arg2, arg3) {
                    alert('Error loading template: ' + arg3);
                }
            });
        },

        isValid: function() {
            if (!this.model.isValid()) {
                $('.error').html(this.model.validationError);
                this.$el.css('display', 'none');
            } else {
                $('.error').html('');
                this.$el.css('display', 'block');
                this.render();
            }
        },

        template: function(html) {
            return html;
        },

        setTemplate: function(html) {
            this.template = _.template(html);
            return this;
        },

        render: function() {
            this.$el.val(this.template(this.model.toJSON()));
            return this;
        }
    });

    var InputView = Backbone.View.extend({
        tagName: 'input',
        attributes: { type: 'text', name: '', id: '', value: '', 'data-field': '' },
        initialize: function() {
            this.render();
        },

        render: function() {
            this.attributes.value = this.model;
            return this;
        }
    });

    var FormView = Backbone.View.extend({
        el: $('#adData'),
        
        events: {
            'keyup input[type=text]': 'updateAdCode',
            'click input[type=checkbox]': 'updateAdCode'
        },

        updateAdCode: function(event) {
            var field = $(event.target),
                value = '';
            if (field.attr('type') == 'checkbox') {
                value = field.is(':checked');
            } else {
                value = field.val();
            }
            this.settings.set(field.data('field'), value);
        },

        updateFields: function() {
            _.each(this.settings.attributes, _.bind(function(value, setting) {
                var field = this.$el.find('[data-field=' + setting + ']');
                if (_.isBoolean(value)) {
                    if (value) {
                        field.attr('checked', 'checked');
                    } else {
                        field.removeAttr('checked');
                    }
                } else {
                    field.val(value);
                }
            }, this));
        },

        render: function() {
            _.each(this.settings.attributes, _.bind(function(value, setting) {
                var inputContainer = $('<div/>');
                this.$el.append(inputContainer);

                var input = new InputView({
                    attributes: {
                        type: _.isBoolean(value) ? 'checkbox' : 'text', 
                        autocomplete: 'off',
                        id: setting, 
                        name: setting, 
                        value: value, 
                        'data-field': setting
                    }
                });

                var label = $('<label/>', {for: setting}).html(setting);
                label.appendTo(inputContainer);
                input.render().$el.appendTo(inputContainer);
            }, this));

            return this;
        },

        initialize: function(template) {
            this.settings = new SettingsModel();
            this.containerView = new ContainerView({model: this.settings});
            this.render();
            this.listenTo(this.settings, 'change', this.updateFields);
        }
    });

    new FormView();
})(jQuery, _, Backbone, this);