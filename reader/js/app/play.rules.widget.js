(function($, global, undefined) {
  
  // custom cache
  var _cache = amplify.request.cache.persist; 
  amplify.request.cache.persist = function( resource, settings, ajaxSettings ) {
    ajaxSettings.data +=  ajaxSettings.url;
    return _cache.apply(this, arguments);
  };
  
  
  var reader = {
    options: {
      src: '../livre/',
      config: 'js/app/config.yml'
    },
    
    _create: function(options, elem) {
      var cache =  /(file|localhost|dropbox)/.test(location.host) ? true : 'persist';
      
      this.win = $(window);
      
      this.model = {};
      this.cpt = 0;
      
      // define requests
      amplify.request.define('play.rules.config', 'ajax', {
        url: this.options.config,
        dataType: 'text',
        type: 'GET',
        cache: cache
      });
      
      amplify.request.define('play.rules.file', 'ajax', {
        url: this.options.src + '{file}',
        dataType: 'text',
        type: 'GET',
        cache: cache
      });
      
      this.build();
      
      return this;
    },
    
    build: function() {
      // first get files from config file
      amplify.request('play.rules.config', $.proxy(this.configHandler, this));
    },
    
    configHandler: function(r) {
      if(!r) return;
      
      var files = yaml.eval(r);
      if(!files.files) {
        throw new Error('Hmm, config files has incorrect structure (no files key)');
      }
      
      this.files = files.files;
      
      $.each(files.files, $.proxy(this.fileHandler, this));
    },
    
    fileHandler: function(i, val) {
      amplify.request('play.rules.file', {file: val}, $.proxy(function(r) {
        this.cpt++;
        
        this.model[val] = r;
        
        if(this.cpt === this.files.length) {
          // Success!
          this.done(this.model);
        }
      }, this));
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
  
  $.widget('play.reader', reader);
  
  $('#main').reader();
  
  
})(this.jQuery, this);