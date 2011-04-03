(function(global, undefined) {
  
  // Load scripts.
  define(['jquery', 'amplify'], function($, amplify) {
    
    var requests = {
      repoInfo: "select * from github.repo where id='{user}' and repo='{repo}'",
      authorInfo: "select * from github.user.info where id='{user}'",
      commits: "select commit.id from github.repo.commits where id='{user}' and repo='{repo}'"
    },
    
    errorHandler = function(data) {
      console.error('book.error.yql: ', this, arguments);
      amplify.publish('book.error.yql', data);
    },
    
    replaceRequest = function(request, user, repo) {
      user = user || this.options.github.data.user;
      repo = repo || this.options.github.data.repo;
      return request.replace('{user}', user).replace('{repo}', repo)
    };
    
    bookModel = {
      
      options: {
        yql: {
          url: 'http://query.yahooapis.com/v1/public/yql',
          dataType: 'jsonp',
          type: 'GET',
          cache: 'persist',
          data: {
            format: 'json',
            env: 'store://datatables.org/alltableswithkeys'
          }          
        },
        
        blobsUrl: 'http://github.com/api/v2/json/blob/all/{user}/{repo}/master',
        fileUrl: 'http://github.com/api/v2/json/blob/show/{user}/{repo}/{sha}/{file}',
        
        github: {
          data: {
            user: 'k33g',
            repo: 'groovy-book'            
          }
        }
      },
      
      init: function(options) {
        this.options = $.extend({}, this.options, options);
        
        amplify.request.define('book.yql', "ajax", this.options.yql);
        
        amplify.request.define('book.github.blobs', "ajax", $.extend({}, this.options.yql, {
          url: this.options.blobsUrl,
          data: this.options.github.data
        }));
        
        amplify.request.define('book.github.file', "ajax", $.extend({}, this.options.yql, {
          url: this.options.fileUrl,
          cache: false,
          data: this.options.github.data
        }));
        
        return this;
      },
      
      repo: function(cb){
        amplify.request({
          resourceId: 'book.yql',
          data: {q: replaceRequest.call(this, requests.repoInfo)},
          success: $.proxy(cb, this),
          error: $.proxy(errorHandler, this)
        });
      },
      
      author: function(cb){
        amplify.request({
          resourceId: 'book.yql',
          data: {q: replaceRequest.call(this, requests.authorInfo)},
          success: $.proxy(cb, this),
          error: $.proxy(errorHandler, this)
        });
      },
      
      commits: function(cb){
        amplify.request({
          resourceId: 'book.yql',
          data: {q: replaceRequest.call(this, requests.commits)},
          success: $.proxy(cb, this),
          error: $.proxy(errorHandler, this)
        });
      },

      blobs: function(cb){
        amplify.request({
          resourceId: 'book.github.blobs',
          success: $.proxy(cb, this),
          error: $.proxy(errorHandler, this)
        });
      },
      
      file: function(sha, file, cb){
        amplify.request({
          resourceId: 'book.github.file',
          data: {sha: sha, file: file},
          success: $.proxy(cb, this),
          error: $.proxy(errorHandler, this)
        });
      }
    };
    
    
    return function(options){
      return Object.create(bookModel).init(options);
    };
  });
  
  
})(this);