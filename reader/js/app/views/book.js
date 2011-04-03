(function(global, document, undefined) {
    define([
      'jquery',
      'showdown',
      'text!views/templates/index.html',
      'text!views/templates/header.html',
      'text!views/templates/chapter.html',            
      'jquery.tmpl'
    ], 
    
    function($, Showdown, index, header, chapter) {

      var view = {
          options: {},
          init: function(elem, options) {
            this.options = $.extend({}, this.options, options);
            this.dom = elem || document.body;
            this.elem = $(this.dom);
            this.converter = new Showdown.converter();
            
            this.tmpl = {
              "#main": index,
              "header": header,
              
              "chapter": chapter
            };
            
            return this;
          },
    
          render: function(what, template, data) {
            console.log('render to ', what, ' with ', data);
            var target = this.elem.find(what).empty(), tmpl;
            
            if(template && typeof template !== 'string') {
              data = template;
              template = null;
            }
            
            tmpl = !template && (what in this.tmpl) ? this.tmpl[what] : this.tmpl[template];
            
            if(!tmpl) {
              console.error('template not found', template);
              return;
            }
            
            $.tmpl(tmpl, data, {
              dateFormat: function(str) {
                return new Date(str).toLocaleString();
              }
            }).appendTo(target);
          }
      };

      return function(elem, options) {
          return Object.create(view).init(elem, options);
      }
    });
})(this, this.document);