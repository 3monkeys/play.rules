/*
	--- TOOLS ---
*/
function washCode(data){
    data = data.replace(/```html/g,'');
    data = data.replace(/``` html/g,'');
    data = data.replace(/~~~html/g,'');
    data = data.replace(/~~~ html/g,'');

    data = data.replace(/```xml/g,"");
    data = data.replace(/``` xml/g,"");
    data = data.replace(/~~~xml/g,"");
    data = data.replace(/~~~ xml/g,"");

    data = data.replace(/```js/g,'');
    data = data.replace(/``` js/g,'');
    data = data.replace(/~~~js/g,'');
    data = data.replace(/~~~ js/g,'');

    data = data.replace(/```java/g,'');
    data = data.replace(/``` java/g,'');
    data = data.replace(/~~~java/g,'');
    data = data.replace(/~~~ java/g,'');

    data = data.replace(/```css/g,'');
    data = data.replace(/``` css/g,'');
    data = data.replace(/~~~css/g,'');
    data = data.replace(/~~~ css/g,'');

    data = data.replace(/```/g,"</pre>");
    data = data.replace(/~~~/g,"</pre>");

    return data;
}


var loic = "", k33g = "", playframework = "";
tw.search('#playframework',function(data){
    for(var i = 0; i < 3; i+=1){
		playframework += '<li><span> (' + data[i].user + ')</span> &raquo; ' + data[i].msg+'</li>';
    }
	tw.search('from:loic_d',function(data){
        for(var i = 0; i <3; i+=1){
			loic += '<li>' + data[i].msg+'</li>';
        }
		tw.search('from:k33g_org',function(data){
	        for(var i = 0; i <3; i+=1){
				k33g += '<li>' + data[i].msg+'</li>';
	        }
	    });
    });

});


var Store = Class({
	constructor : function Store (user,repo, callBk) {
		var that = this;
		this.branches = {};
		this.user = user;
		this.repo = repo;
		var branches = gh.repo(this.user, this.repo).branches(function(data){
			that.branches = data.branches;
			//console.log("Branches of ",that.repo," are loaded : ", that.branches);
			if(callBk) { callBk(); }
		});
	},
	getBranchId : function(name) { return this.branches[name]; },
	getItemsOfBranch : function(name, callBk) {
		var that = this;
		gh.object(this.user, this.repo).tree(this.getBranchId(name),function(items){
			//console.log("Items of ",name," are loaded : ");
			if(callBk) { callBk(items.tree); }
		});
	},
	getItemsOfItem : function(item, callBk) {
		var that = this;
		gh.object(this.user, this.repo).tree(item.sha,function(items){
			//console.log("Items of ",item.name,"(",item.sha,")"," are loaded : ");
			if(callBk) { callBk(items.tree); }
		});			
	},
	getContent : function(pathOfFile, callBk){
		gh.object(this.user, this.repo).blob(pathOfFile, this.getBranchId('master'),function(result){
			//console.log(result);
			if(callBk) { callBk(result.blob.data); }
		});
	}
});

// required
jo.load();


// placed in a module pattern, not a terrible idea for application level code
var App = (function() {
	var stack;
	var page;
	window.list;
	var menu;
	var twitts;
	//var cssnode;

	function init() {		

		//cssnode = joDOM.applyCSS(".htmlgroup { background: #fff; }");

		var nav;
		
		if (jo.matchPlatform("hpwos") && typeof PalmSystem === 'undefined')
			joEvent.touchy = false;
		// chaining is supported on constructors and any setters		
		scn = new joScreen(
			new joContainer([
				new joFlexcol([
					nav = new joNavbar(),
					stack = new joStackScroller()
				])
			]).setStyle({position: "absolute", top: "0", left: "0", bottom: "0", right: "0"})
		);
		
		nav.setStack(stack);
		
		// this is a bit of a hack for now; adds a CSS rule which puts enough
		// space at the bottom of scrolling views to allow for our floating
		// toolbar. Going to find a slick way to automagically do this in the
		// framework at some point.
		/*---
		joDefer(function() {
			var style = new joCSSRule('jostack > joscroller > *:last-child:after { content: ""; display: block; height: ' + (toolbar.container.offsetHeight) + 'px; }');
		});
		---*/

		var html = new joHTML('');
				
		page = new joCard([
			html
		]);
		
		
		/*--------Github----------*/
		
		var path = "livre/";
		var converter = new Showdown.converter();
		window.list_items = [];

		var gitHubStorage = new Store('3monkeys','play.rules', function(){

			gitHubStorage.getItemsOfBranch('master', function(items){ 
				window.news = items.filter(function(item) { return item.name === "NEWS.md"; })[0];
				gitHubStorage.getContent(news.name, function(content){
					news.content = converter.makeHtml(washCode(content));
					twitts.setData(
						'<h2 class="border">@Twitter</h2>'+
						'<h3 class="border">#PlayFramework</h3>'+
						playframework+
						'<h3 class="border">@loic_d</h2>'+
						loic+
						'<h3 class="border">@k33g_org</h3>'+
						k33g
					);
				});			

				var livre  = items.filter(function(item) { return item.name === "livre"; })[0];

				gitHubStorage.getItemsOfItem(livre, function(items){
					list_items.push({title:"<b>Voir les news</b>", id:"NEWS"});
					items.forEach(function(item) {
						if(item.type ==='tree') {
							
							list_items.push({title:item.name, id:{sha:item.sha,name:item.name}});

							gitHubStorage.getItemsOfItem(item, function(chapters){

								var pathPart = path+item.name+"/";
								list_items[item.name] = [];
								list_items[item.name].push({title:"<b>Retour TDM ...</b>", id:"TDM"});
								
								chapters.forEach(function(chapter) {
									
									list_items[item.name].push({title:chapter.name, id:{sha:chapter.sha,name:pathPart+chapter.name}});

								});

							});
						} else { //Blob
							list_items.push({title:item.name, id:{sha:item.sha,name:path+item.name}});

						}
						list.setData(list_items);
					});
					
				});

			});
		});		
		/*--------Github----------*/
		
		menu = new joCard([
			list = new joMenu([
				{ title: "Patientez pendant le chargement ...", id: "" }
			]),
			new joHTML('<br>'),
			twitts = new joHTML()
		]).setTitle("Play.Rules<b>!</b>&raquo; eBook");
		menu.activate = function() {
			// maybe this should be built into joMenu...
			list.deselect();
		};

		list.selectEvent.subscribe(function(id) {
			if(list_items[id.name]){
				list.setData(list_items[id.name]);
				list.deselect();
			} else {
				if(id==="TDM") {
					list.setData(list_items);
					list.deselect();
					
				}else {
					if(id==="NEWS") {
						html.setData('<br>' + news.content);
						$('pre code').each(function(i, e) {hljs.highlightBlock(e, '    ')});
						
						list.deselect();
						stack.push(page);
					} else {
						
						gitHubStorage.getContent(id.name, function(content){
							//console.log(id.name);
							html.setData(converter.makeHtml(washCode(content)));
							$('pre code').each(function(i, e) {hljs.highlightBlock(e, '    ')});
							stack.push(page);
						});
						
					}
				}
			}
		}, this);
				
		joGesture.forwardEvent.subscribe(stack.forward, stack);
		joGesture.backEvent.subscribe(stack.pop, stack);
		
		document.body.addEventListener('touchmove', function(e) {
		    e.preventDefault();
			joEvent.stop(e);
		}, false);

		stack.push(menu);
	}
	
	function back() {
		stack.pop();
	}
	
	// public stuff
	return {
		"init": init
	}
}());
