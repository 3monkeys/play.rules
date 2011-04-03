/**
 * This file is our main application's controller.
 *
 * It defines the Sammy routes callback triggered within the apps.
 *
 */
(function(global, undefined) {
  
  // Load scripts.
  define(['jquery', 'amplify', 'showdown', 'config', 'views/book', 'model/book'], function($, amplify, Showdown, config, bookView, bookModel) {
    
    var model = bookModel({
      github: {
        data: {
          user: config.user,
          repo: config.repo   
        }
      }
    }),
    
    view = bookView(),
    
    convertor = new Showdown.converter();
    
    
    return {
      
      log: function(){
        console.log(this, arguments);
      },
      
      index: function(context){
        
        model.repo(function(data) {
          var r = data.query.results.repository;
          amplify.store('book.repository', r);
          view.render('header', r);
        });
        
        model.commits(function(data){
          console.log('commits', arguments);
          amplify.store('book.commits', data.query.results.commits);
          amplify.store('book.sha', data.query.results.commits[0].commit.id);          
        });
        
        model.blobs(function(data) {
          var blobs = data.blobs, tmp = [];
          
          $.each(blobs, function(i, val) {
            var n = i.match(/(\d+)-/),
            
            file = i.replace(config.ext, '').split('-').join(' - ').split('_').join(' ');
            
            if(n && n[1]) {
              tmp[parseInt(n[1], 10)] = {
                num: n[1],
                filename: i,
                file: file
              };
            }
          });
          
          amplify.store('book.blobs', blobs);
          view.render('#main', tmp);
        });
        
      },
      
      book: function(context){
        context.redirect('#/');
      },
      
      chapter: function(context){
        var file = context.params.splat,
        
        sha = amplify.store('book.sha');
        
        model.file(sha, file, function(data) {
          view.render('#main', 'chapter', {markdown: convertor.makeHtml(data.blob.data)});
        });
      },

      toc: function(context){
        context.redirect('#/');
      }
    };
  });
  
  
})(this);