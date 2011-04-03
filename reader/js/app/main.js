/**
 * This file is our application's base JavaScript file;
 */
(function($, global, undefined) {
  
  // Configure RequireJS
  require({
    
    baseUrl: 'js/app/',
    
    paths: {
      'jquery': '../libs/jquery',
      'sammy':  '../libs/sammy',
      'underscore':  '../libs/underscore',
      'amplify': '../libs/amplify',
      'amplify.core': '../libs/amplify/amplify.core',
      'amplify.request': '../libs/amplify/amplify.request',
      'amplify.store': '../libs/amplify/amplify.store',
      'showdown': '../libs/showdown',
      'jquery.tmpl': '../libs/jquery.tmpl',
      'text': '../libs/require.text'
    },
    
    // Load jQuery before any other scripts
    priority: ['jquery']
  });
  
  // Load scripts.
  require(['jquery', 'sammy', 'amplify', 'controller/book'], function($, Sammy, amplify, controller) {

    global.amp = amplify;

    // Define Sammy app and routes
    var app = Sammy("#main", function() {
      this.get('#/', $.proxy(controller.index, controller));
      this.get('', $.proxy(controller.index, controller));
      
      this.get('#/book/', $.proxy(controller.book, controller));
      
      this.get(/\#\/book\/(.*)/, $.proxy(controller.chapter, controller));
      
      this.get('#/book/toc/', $.proxy(controller.toc, controller));
      this.get('#/toc/', $.proxy(controller.toc, controller));
    });
    
    
    
    $(function() {
      app.run('#/');
    });
    
  });
  
  
})(this.jQuery, this);