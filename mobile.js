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

// not required
jo.setDebug(true);

// placed in a module pattern, not a terrible idea for application level code
var App = (function() {
	var stack;
	var scn;
	var button;
	var backbutton;
	var page;
	var login;
	var test;
	var more;
	var option;
	var select;
	var moreback;
	var urldata;
	 window.list;
	var menu;
	var cssnode;
//	var blipsound = new joSound("blip2.wav");
//	var bloopsound = new joSound("blip0.wav");
	var cancelbutton;
	var testds;

	function init() {		

		cssnode = joDOM.applyCSS(".htmlgroup { background: #fff; }");
		

		//var toolbar;
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
				//toolbar = new joToolbar("This is a footer, neat huh?")
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

		
		// some arbitrary HTML shoved into a joHTML control
		var html = new joHTML('<h1>Disclaimer</h1><p>This is a disclaimer. For more information, you can check <a href="moreinfo.html">this <b>file</b></a> for more info, or try your luck with <a href="someotherfile.html">this file</a>.');
		var htmlgroup;
		
		var selectedDoc, selectedLabel;
		
		page = new joCard([
			//selectedLabel = new joLabel("HTML Control : "),
			html
			//htmlgroup = new joGroup(html)
		]).setTitle("Success");
		
		
		//htmlgroup.setStyle("htmlgroup");
		
		//backbutton.selectEvent.subscribe(back, this);
		
		/*--------Github----------*/
		
		var path = "livre/";
		var converter = new Showdown.converter();
		window.list_items = [];

		var gitHubStorage = new Store('3monkeys','play.rules', function(){
			console.log("gitHubStorage");
			
			function getChapterContent(clickedLink) {			
				gitHubStorage.getContent(clickedLink, function(content){
					
					//$("#details-container").html(converter.makeHtml(washCode(content)));
					//$('pre code').each(function(i, e) {hljs.highlightBlock(e, '    ')});
					
					//showContent();
					window.document.getElementById("scroller").scrollTop = 0;
				});
			}

			gitHubStorage.getItemsOfBranch('master', function(items){ 
				window.news = items.filter(function(item) { return item.name === "NEWS.md"; })[0];
				gitHubStorage.getContent(news.name, function(content){
					news.content = converter.makeHtml(washCode(content));
					
					//$("#details-container").html(news.content);
					//$('pre code').each(function(i, e) {hljs.highlightBlock(e, '    ')});

					twitter.removeClass("hide").addClass("show");

					window.document.getElementById("scroller").scrollTop = 0
				});			

				var livre  = items.filter(function(item) { return item.name === "livre"; })[0];

				gitHubStorage.getItemsOfItem(livre, function(items){
					list_items.push({title:"<b>Voir les news</b>", id:"NEWS"});
					items.forEach(function(item) {
						if(item.type ==='tree') {
							//{ title: "Form Widgets", id: "login" },
							
							list_items.push({title:item.name, id:{sha:item.sha,name:item.name}});
							
							//console.log("###",{title:item.name, id:item.sha});
							//$('#toc').append('<li class="part" style="width:100%;padding-left:0px;" id="li_'+item.sha+'"><b style="padding-left:5px">'+item.name+'</b></li>');

							//$('#li_'+item.sha).append('<ul class="list" id="ul_'+item.sha+'"></li>');

							gitHubStorage.getItemsOfItem(item, function(chapters){

								var pathPart = path+item.name+"/";
								list_items[item.name] = [];
								list_items[item.name].push({title:"<b>Retour TDM ...</b>", id:"TDM"});
								
								chapters.forEach(function(chapter) {
									
									list_items[item.name].push({title:chapter.name, id:{sha:chapter.sha,name:pathPart+chapter.name}});
									//console.log("chapter : ",{title:chapter.name, id:chapter.sha});

									//$('#ul_'+item.sha).append('<li style="width:100%" id="li_'+chapter.sha+'"><a href="#'+pathPart+chapter.name+'">'+chapter.name+'</a></li>')
									
									//$('#li_'+chapter.sha)
									//.bind('click',function(element){ getChapterContent(pathPart+chapter.name); });

								});
								//list.setData(list_items);
							});
						} else { //Blob
							list_items.push({title:item.name, id:{sha:item.sha,name:path+item.name}});
							//console.log(">>>",{title:item.name, id:item.sha});
							/*$('#toc')
							.append('<li id="li_'+item.sha+'"><a href="#'+path+item.name+'">'+item.name+'</a></li>');
							$('#li_'+item.sha)
							.bind('click',function(element){ getChapterContent(path+item.name); });*/
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
			])
			//TDMButton = new joButton("Les News ...")
		]).setTitle("Play.Rules<b>!</b>&raquo; eBook");
		menu.activate = function() {
			// maybe this should be built into joMenu...
			list.deselect();
		};

		list.selectEvent.subscribe(function(id) {
			console.log(id);
			if(list_items[id.name]){
				//TDMButton.setData("<< Back");
				console.log(list_items[id.name]);
				list.setData(list_items[id.name]);
				list.deselect();
			} else {
				if(id==="TDM") {
					list.setData(list_items);
					list.deselect();
					
				}else {
					if(id==="NEWS") {
						list.setData(list_items);
						list.deselect();
					} else {
						//selectedLabel.setData(id.name);
						page.setTitle(id.name);
						
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
		

			
		
		/*TDMButton.selectEvent.subscribe(function() {
			TDMButton.setData("Les News ...");
			list.setData(list_items);
		}, this);*/


		//backbutton.selectEvent.subscribe(back, this);
		html.selectEvent.subscribe(link, this);
		
		stack.pushEvent.subscribe(blip, this);
		stack.popEvent.subscribe(bloop, this);
		
		joGesture.forwardEvent.subscribe(stack.forward, stack);
		joGesture.backEvent.subscribe(stack.pop, stack);
		
		document.body.addEventListener('touchmove', function(e) {
		    e.preventDefault();
			joEvent.stop(e);
		}, false);

		stack.push(menu);
	}
	
	function blip() {
//		blipsound.play();
	}
	
	function bloop() {
//		bloopsound.play();
	}
	
	function link(href) {
		joLog("HTML link clicked: " + href);
		urldata.setData(href);
		stack.push(more);
	}
	
	function click() {
		stack.push(page);
	}
	
	function back() {
		stack.pop();
	}
	
	// public stuff
	return {
		"init": init,
		"getData": function() { return testds; },
		"getStack": function() { return stack; },
		"getButton": function() { return button; },
		"getSelect": function() { return select; },
		"getOption": function() { return option; }
	}
}());
