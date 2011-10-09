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



/* DEFINITION DU MODELE */

Ext.regModel('Menu', {
    fields: ['code','label']
});

var storeMenu = new Ext.data.JsonStore({
    model  : 'Menu',
    sorters: {property:'code',direction:'DESC'},

	//sortInfo:{field:'code',direction:'DESC'},
	//fields:['code','label','item'],

    getGroupString : function(record) {
        return record.get('code');
		//return record.get('code')[0];
    },

    data: [

        /*{code: '15/02/2011', label: 'Parameters',item:0},
        {code: '1/1/2011', label: 'Report'},
		{code: '26/03/2011', label: 'Home', item:1},
		{code: '26/03/2011', label: 'Test', item:2}*/

    ] 

});

/*--------Github----------*/

var path = "livre/";
var converter = new Showdown.converter();
//window.list_items = [];

var gitHubStorage = new Store('3monkeys','play.rules', function(){

	gitHubStorage.getItemsOfBranch('master', function(items){ 
		window.news = items.filter(function(item) { return item.name === "NEWS.md"; })[0];
		gitHubStorage.getContent(news.name, function(content){
			news.content = converter.makeHtml(washCode(content));
			/*twitts.setData(
				'<h2 class="border">@Twitter</h2>'+
				'<h3 class="border">#PlayFramework</h3>'+
				playframework+
				'<h3 class="border">@loic_d</h3>'+
				loic+
				'<h3 class="border">@k33g_org</h3>'+
				k33g
			);*/
		});			

		var livre  = items.filter(function(item) { return item.name === "livre"; })[0];

		gitHubStorage.getItemsOfItem(livre, function(items){
			//list_items.push({title:"<b>Voir les news</b>", id:"NEWS"});
			items.forEach(function(item) {
				if(item.type ==='tree') {
					
					//list_items.push({title:item.name, id:{sha:item.sha,name:item.name}});
					storeMenu.add({code:path, label:item.name, item:path+item.name});

					gitHubStorage.getItemsOfItem(item, function(chapters){

						var pathPart = path+item.name+"/";
						//list_items[item.name] = [];
						//list_items[item.name].push({title:"<b>Retour TDM ...</b>", id:"TDM"});
						
						chapters.forEach(function(chapter) {
							
							//list_items[item.name].push({title:chapter.name, id:{sha:chapter.sha,name:pathPart+chapter.name}});
							
							storeMenu.add({code:pathPart, label:chapter.name, item:pathPart+chapter.name});

						});

					});
				} else { //Blob
					//list_items.push({title:item.name, id:{sha:item.sha,name:path+item.name}});
					storeMenu.add({code:path, label:item.name, item:path+item.name});

				}
				//list.setData(list_items);
				//console.log(list_items);
			});
			
		});

	});
});	

/*--------Github----------*/







