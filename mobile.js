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
		var ex;
	
		testds = new joRecord({
			uid: "jo",
			pwd: "password",
			num: 1,
			fruit: 2,
			active: true,
			note: false
		}).setAutoSave(false);
		
		// our bogus login view
		login = new joCard([
			new joGroup([
				new joLabel("Username"),
				new joFlexrow(nameinput = new joInput(testds.link("uid"))),
				new joLabel("Password"),
				new joFlexrow(new joPasswordInput(testds.link("pwd"))),
				new joLabel("Options"),
				new joFlexrow(option = new joOption([
					"One", "Two", "Three", "Four", "Five"
				], testds.link("num")).selectEvent.subscribe(function(value) {
					console.log("option selected: " + value);
				})),
				new joLabel("Selection"),
				select = new joSelect([
					"Apple", "Orange", "Banana", "Grape", "Cherry", "Mango"
				], testds.link("fruit")),
				new joFlexrow([
					new joLabel("Activate").setStyle("left"),
					new joToggle(testds.link("active"))
				]),
				new joFlexrow([
					new joLabel("Notify").setStyle("left"),
					new joToggle(testds.link("note")).setLabels(["No", "Yes"])
				])
			]),
			new joDivider(),
			ex = new joExpando([
				new joExpandoTitle("Advanced Settings"),
				new joExpandoContent([
					new joLabel("Domain"),
					new joFlexrow(new joInput("localhost")),
					new joLabel("Port"),
					new joFlexrow(new joInput("80"))
				])
			]).openEvent.subscribe(function() {
				stack.scrollTo(ex);
				console.log("scrollto");
			}),
			new joFooter([
				new joDivider(),
				button = new joButton("Login"),
				cancelbutton = new joButton("Back")
			])
		]).setTitle("Form Widget Demo");
		
//	was demoing how to disable a control, but decided having a "back"
// button was more important right now
//		cancelbutton.disable();
		cancelbutton.selectEvent.subscribe(back, this);
		
		// some arbitrary HTML shoved into a joHTML control
		var html = new joHTML('<h1>Disclaimer</h1><p>This is a disclaimer. For more information, you can check <a href="moreinfo.html">this <b>file</b></a> for more info, or try your luck with <a href="someotherfile.html">this file</a>.');
		var htmlgroup;
		
		page = new joCard([
			new joLabel("HTML Control"),
			htmlgroup = new joGroup(html),
			new joCaption("Note that the HTML control above is using another stylesheet without impacting our controls."),
			new joFooter([
				new joDivider(),
				backbutton = new joButton("Back")
			])
		]).setTitle("Success");
		
		htmlgroup.setStyle("htmlgroup");
		
		more = new joCard([
			new joGroup([
				new joCaption("Good job! This is more info. Not very informative, is it?"),
				new joCaption(urldata = new joDataSource(""))
			]),
			new joFooter([
				new joDivider(),
				moreback = new joButton("Back Again")
			])
		]).setTitle("URL Demo");
		
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
							list_items.push({title:item.name, id:{sha:item.sha,name:item.name}});
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
			]),
			new joDivider(),
			TDMButton = new joButton("Les News ...")
		]).setTitle("Play.Rules!► eBook");
		menu.activate = function() {
			// maybe this should be built into joMenu...
			list.deselect();
		};

		list.selectEvent.subscribe(function(id) {
			console.log(id);
			if(list_items[id.name]){
				TDMButton.setData("<< Back");
				console.log(list_items[id.name]);
				list.setData(list_items[id.name]);
			}
			/*if (id == "login")
				stack.push(login);
			else if (id == "popup")
				scn.alert("Hello!", "Is this the popup you were looking for? This is a very simple one; you can put much more in a popup if you were inclined.", function() { list.deselect(); });
			else if (id != "help")
				stack.push(joCache.get(id));*/
		}, this);
		
		TDMButton.selectEvent.subscribe(function() {
			TDMButton.setData("Les News ...");
			list.setData(list_items);
		}, this);


		moreback.selectEvent.subscribe(function() { stack.pop(); }, this);
		button.selectEvent.subscribe(click.bind(this));
		backbutton.selectEvent.subscribe(back, this);
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
