// ugly code, gtd code
/* * /
var container = $("#container"),

win = $(window), 

url = "src/livre/",

f = [],

done = function done(model) {
  
  
};

// First, get files list
$.ajax({
  cache: false,
  url: 'js/app/config.yml',
  complete: function(r, status) {
    var text = r.responseText, cpt = 0, files, model = {}; 
    if(!text) return;

    f = files = yaml.eval(text);
    
    
    $.each(files.files, function(i, val) {
      $.ajax({
        cache: false,
        url: url + val,
        complete: function(r, status) {
          cpt++;
          
          model[val] = r.responseText;
          
          if(cpt === files.files.length) {
            // Success!
            done(model);
          }
        }
      })
    });
  }
});
/* */