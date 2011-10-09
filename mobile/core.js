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


var abk = (function () {
    var abak = {};

    abak.version = function(){return "0.00";}

    abak.getHeader = function(title){
        var header = new Ext.Toolbar({
            dock: 'top',
            title:title

        });
        return header
    };

    abak.getFooter = function(title){
        var footer = new Ext.Toolbar({
            dock: 'bottom',
            title:title
        });

        return footer;
    };


    abak.getMainScreen = function(elements){
        var mainScreen;

        mainScreen = new Ext.Panel({
            fullscreen: true,
			style:"background-color:white;",
            dockedItems: [elements.header,elements.footer,elements.leftSidePanel],
            items:[
                elements.rightSidePanel
            ]
        });

        return mainScreen;

    }


	/*--- page d'affichage de contenu ---*/
    abak.getHomeCard = function(){

        var homeCard = new Ext.Panel({
            style:"background-color:white;padding-left:20px;padding-right:10px;",
            title:'REPORT',
            scroll:'vertical',
            /*margin:'10px',*/
            height:'100%',
            html:[
                '',
                ''
            ].join(""),
			items:[
				window.homeCardTitle = new Ext.Component({html:'title ...'}),
				window.homeCardContent = new Ext.Component({html:'content ...'})
				]
			
        });
		
        return homeCard;
    };

    abak.getLeftSidePanel = function(rightSidePanel){
        var list = new Ext.List({
            //fullscreen: true,

            scroll:'vertical',
            dock: 'left',
            style:"border-right:solid black 1px;",
            width:350,


            itemTpl : '{label}',
            /*itemTpl : '{code} {label}',*/
            grouped : true,
            
			/*indexBar: true,*/

            store: storeMenu,

            listeners: {

                itemtap: function(subList, subIdx, el, e){

                    var store      = subList.getStore(),
                        record     = store.getAt(subIdx);

                    console.log(record.get('code')+' '+record.get('label'));

                    //contentSidePanel.setActiveItem(1); ???

                    //contentSidePanel.setActiveItem(groupHomeSide);

					//****c'est ici que l'on change de "card"
                    //rightSidePanel.setActiveItem(record.get('item'));
					homeCardTitle.update(record.get('item'));
					
					//homeCardContent
					gitHubStorage.getContent(record.get('item'), function(content){
						
						homeCardContent.update(converter.makeHtml(washCode(content)));

					});


                },
                selectionchange: function(){
                    //console.log(this.getSelectedNodes());
                }

            }

		});

        return list;
    };


	return abak;
}());