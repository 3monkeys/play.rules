(function($, global, undefined) {
  
  // Make sure Object.create is available in the browser (for our prototypal inheritance)
  (function() {
    function F(){};
    if(typeof Object.create !== 'function') {
      Object.create = function(o) {
        F.prototype = o;
        return new F(); 
      };
    }
  })();
  
  var reader = {
    options: {
      url: 'src/livre/'
    },
    init: function(options, elem) {
      this.options = $.extend({}, this.options, options);
      this.element = $(elem);
      this.dom = elem;
      this.win = $(window);
      
      this.cpt = 0;
      this.model = {};
      
      this.build();
      
      return this;
    },
    
    build: function() {
      // first get files from config file
      $.ajax({
        cache: false,
        dataType: 'text',
        url: 'js/app/config.yml',
        complete: $.proxy(this.configHandler, this)
      });
    },
    
    configHandler: function(r, status) {
      var self = this;
      if(!r.responseText) return;
      files = yaml.eval(r.responseText);
      if(!files.files) {
        throw new Error('Hmm, config files has incorrect structure (no files key)');
      }
      
      this.files = files.files;
      
      $.each(files.files, $.proxy(this.fileHandler, this));
    },
    
    fileHandler: function(i, val) {
      $.ajax({
        cache: false,
        url: this.options.url + val,
        complete: $.proxy(function(r, status) {
          this.cpt++;
          
          this.model[val] = r.responseText;
          
          if(this.cpt === this.files.length) {
            // Success!
            this.done(this.model);
          }
        }, this)
      });
    },
    
    done: function() {
      var html = $.map(this.files, $.proxy(this.renderFile, this));
      
      this.element.append(html.join(' '));
      
      this.win.sausage({
          content: function(i, page) {
            return '<span class="sausage-span">' + page.find(':header').first().text() + '</span>';
          }
      });
    },
    
    renderFile: function(index) {
      var m = this.model[index];
      
      if(m === undefined) {
        throw new Error('Duh, error happened' + val);
      }
      
      return '<div class="page">${file}</div>'.replace('${file}', new Showdown.converter().makeHtml(m));
    }
  };
  
  var r = Object.create(reader).init({}, document.body);
  
  
})(this.jQuery, this)