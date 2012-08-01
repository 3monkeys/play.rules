#Les assets dans Play

>*Qu'allons nous voir ?*

>	- *Qu'est-ce que c'est et pourquoi ?*
>	- *Découverte rapide de Coffeescript*
>	- *Utilisation de Coffeescript*
>	- *LESS ?*
>	- *...*


##Assets ???

Mais qu'est-ce donc ? En fait, ce sont tous les fichiers statiques (css, html, js, coffee, png, jpg ...) de votre application web Play. Vous les trouvez dans le répertoire `public` de l'application. Et pour y faire référence dans nos vues scala, nous utilisons le mot clé `@routes.Assets.at()` :

- pour les fichiers javascript : `<script src="@routes.Assets.at("javascripts/jquery-1.7.1.min.js")" type="text/javascript"></script>`
- pour les feuilles de style : `<link rel="stylesheet" media="screen" href="@routes.Assets.at("bootstrap/css/bootstrap-responsive.css")">`
- pour les images : `<link rel="shortcut icon" type="image/png" href="@routes.Assets.at("images/favicon.png")">`
- etc. ...

Mais il existe d'autres types d'assets.

##Assets "compilés"

Ce sont les fichiers statiques qui subissent un retraitement avant publication, comme :

- la minification des fichiers javascript pour améliorer les temps de chargement
- la compression gzip pour les browsers qui le supportent
- la transformation de fichiers `less` en `css` (nous allons voir ce que c'est plus loin)
- la transpilation de fichiers coffeescript en javascript (ça aussi, nous allons le voir)
-  ...

>**Remarque :** Play gère la mise en cache des assets.

##Mise en oeuvre

###Préparation

Pour que Play compile les assets, il faut créer un répertoire `assets` dans le répertoire `app`, puis dans le répertoire `assets`, créez un répertoire `javascripts` et un répertoire `stylesheets`.

Nous allons commencer par des assets Coffeescript.

###Coffeescript

Mais, tout d'abors une petite présentation de Coffeescript avant la mise en oeuvre.

####Rappels

Coffeescript c'est à la fois un langage et un transpiler (un run-time aussi). Vous écrivez en Coffeescript, puis vous transpilez en Javascript. Ce nouveau langage a été créé par Jeremy Ashkenas ([https://github.com/jashkenas/coffee-script](https://github.com/jashkenas/coffee-script) & [http://coffeescript.org/](http://coffeescript.org/)).

>**Remarque :** Coffeescript est "fourni" avec Play!>2.

Vous pouvez exécuter Coffeescript :

- côté client, dans le navigateur une fois transpilé en javascript ou directement en coffeescript avec un runtime javascript capable d'exécuter les script `coffee`
- côté serveur ou en mode commande avec Nodejs

#####Pourquoi ?

>*"CoffeeScript is JavaScript, the same language with a different accent"* **Patrick Lee**  (CoffeeScript in Action)

Coffescript simplifie le javascript, génère du javascript "propre" et apporte de nombreux "plus" pour vous faciliter la vie, simplifier votre code, en améliorer la lisibilité. 

Quelques exemples avant de passer à la pratique.

#####Les fonctions en Coffeescript

	addition = (a,b) -> 
		a+b

#####Utilisation d'autres librairies javascript (et simplification)

	#Ceci est une remarque :
	#code js avant : 
	#	jQuery $(document).ready(function () {
	#		some();
	#		init();
	#		calls();
	#	});

	$ -> some()
	    init()
	    calls()

>**Remarque :** la syntaxe coffeescript facilite la création de DSL

#####Les "Strings" & les Interpolations

Par exemple vous avez un objet :

	bob =
       firstName : "Bob"
       lastName : "Morane"
       hello : ->
			"Hello !"

sont équivalent javascript serait :

	var bob = {
		firstName : "Bob",
		lastName : "Morane",
		hello : function () {
			return "Hello !";
		}
	}

Vous pouvez ensuite l'utiliser dans une String (et notez bien, sur plusieurs lignes) de la façon suivante :

	console.log "
       Firstname : #{bob.firstName},
       LastName  : #{bob.lastName},
       Method (hello) : #{bob.hello()}
	"

#####Les Arrays

	buddies = [
		{name:"Bob", age:30}
		{name:"Sam", age:50}
        { name : "John", age : 20 }
    ]

    #tous les copains de moins de 50 ans
    result = (buddy for buddy in buddies when buddy.age < 50)

#####Et enfin : les CLASSES !!!

	class Human

		#static field
		@counter : 0

    	constructor : (@firstName, @lastName) ->
        	#fields : @ = this
        	Human.counter += 1
		
		#method
    	hello : ->
        	console.log "Hello #{@firstName} #{@lastName}"

        #static method
        @howMany : ->
        	Human.counter

		Bob = new Human "Bob", "Morane" 
		console.log "Human.counter #{Human.howMany()}"

#####Avec un peu d'héritage

	class Superhero extends Human
    	constructor : (@firstName, @lastName, @name) ->
    	hello : ->
        	super + " aka #{@name}"

####Mise en oeuvre

Nous allons re-écrire le code de notre "single page application" (cf chapitre **"Services (JSON)"**) en Coffeescript.

#####Préparation 

Tout d'abord, vous pouvez supprimer le code javascript dans la vie `mainPage.scala.html` (juste après la remarque `<!-- === ici votre code applicatif === -->`).

Ensuite, toujours dans la même vue, dans la section `<head>`, juste après la référence à jQuery, ajoutez une référence à notre futur code :

	<script src="@routes.Assets.at("javascripts/myapp.js")" type="text/javascript"></script>

Nous allons ensuite créer un fichier `myapp.coffee` qui sera automatiquement compilé (transpilé) par Play en javascript.

#####myapp.coffee

Dans le répertoire `app/assets/javascripts`, créez un fichier `myapp.coffee` avec le code suivant :

	#=== mon code ne s'exécute qu'une fois le DOM complètement chargé ===
	console.log "CoffeeScript version in progress ..."
	$ ->
		#définition des différents éléments d'IHM
		console.log "dom loaded ... i hope ..."
		user = {}
		alertAuthentication = $ "div[name=authentication]"
		loginButton = $ "button[name=login]"
		logoutButton = $ "button[name=logout]"
		loadBookmarksButton = $ "button[name=loadbookmarks]"
		email = $ "input[name=email]"
		password = $ "input[name=password]"
		labels = $ "label"
		bookmarksList = $ "ul[name=bookmarks]"

		#onclick du bouton login
		console.log "OnClick login button definition ..."
		loginButton.click ->
			user.email = email.val()
			user.password = password.val()

			$.ajax 
				type:"POST"
				url:"/loginjson"
				data: 
					email : user.email
					password : user.password
				error : (err)->
					console.log "Erreur", err
				success : (data)->
					if data isnt "badRequest"
						alertAuthentication.attr("class","alert alert-success")
						  .html "<strong>Bienvenue !</strong> #{data}"
						user.name = data
						labels.hide()
						email.hide()
						password.hide()
						loginButton.hide()
					else
						alertAuthentication.attr("class","alert alert-error")
							.html "<strong>Oups !</strong> vous avez du vous tromper"

		#onclick du bouton logout
		console.log "OnClick logout button definition ..."
		logoutButton.click ->
		
			$.ajax 
				type:"GET"
				url:"/logoutjson"
				error : (err)->
					console.log "Erreur", err
				success : (data)->
					if user.name
					  alertAuthentication.attr("class", "alert alert-info")
					  	.html "<strong>Au revoir</strong> #{user.name}"
					  labels.show()
					  email.show()
					  password.show()
					  loginButton.show()
					  user = {}
					  bookmarksList.html ""

		#onclick du bouton de chargement des bookmarks
		console.log "OnClick load bookmarks button definition ..."
		loadBookmarksButton.click ->
		
			$.ajax 
				type:"GET"
				url:"/bookmarks/jsonlist"
				error : (err)->
					console.log "Erreur", err
				success : (data)->
					if data isnt "failed"
						console.log data
						bookmarksList.html ""
						data.bookmarks.forEach (bookmark) ->
							bookmarksList.append $ """
								<li><b>#{bookmark.title} | 
								<a href='#{bookmark.url}'>#{bookmark.url}</a> | 
								<i>#{bookmark.details}</i> | 
								(#{bookmark.category.label})</li>
							"""
					else
						alertAuthentication.attr("class", "alert alert-error")
							.html "
								<strong>
									Il faut être authentifié !
								</strong> pour obtenir la liste des bookmarks
								"

Enregistrez, relancez votre application ([http://localhost:9000/main](http://localhost:9000/main)), et ça fonctionne comme avant. Alors, je suis d'accord, faire du Coffeescript, c'est quand même un gros changement. Mais vous n'êtes pas obligés, cependant je vous engage à donner une chance à ce langage, vous verrez, vous ne ferez plus du javascript comme avant.

Passons à une nouvelle "visions" des feuilles de styles avec **LESS**.

###Less

Less [http://lesscss.org/](http://lesscss.org/) est une autre façon d'écrire vos feuilles de style. C'est un nouveau langage css, dynamique, plus pratique, avec la possibilité d'utiliser des variables, des opérations, ...
Pour une présentation plus détaillée, allez faire un tour sur le blog de **Cedric Exbrayat** : [http://hypedrivendev.wordpress.com/2012/01/31/css-sucks-do-less/](http://hypedrivendev.wordpress.com/2012/01/31/css-sucks-do-less/).

####Mise en oeuvre

Alors, nous n'allons pas re-écrire Twitter Bootstrap (qui est lui aussi créé avec Less), mais ajouter des styles à notre vue principale `index.scala.html`.

Pour cela, allez d'abord dans la vue `main.scala.html` (qui est référencée dans `index.scala.html`), puis dans la section `<head>` de la vue, ajoutez une référence à notre future feuille de style :

	<link rel="stylesheet" media="screen" href="@routes.Assets.at("stylesheets/mycss.css")">

#####myapp.coffee

Dans le répertoire `app/assets/stylesheets`, créez un fichier `mycss.lss` avec le code suivant :

	@h1BckGrdColor : blue;
	@h1ForeColor : white;

	@h2BckGrdColor : gray;
	@h2ForeColor : whitesmoke;

	supertag {
		h1 {
			color: @h1ForeColor;
			background-color: @h1BckGrdColor;
			padding-left: 5px;
		}
		h2 {
			color : @h2ForeColor;
			background-color: @h2BckGrdColor;
			padding-left: 5px;
			margin-bottom: 5px;
		}

		input {
			background-color: yellow
		}
	}

J'utilise donc 4 variables : `@h1BckGrdColor`, `@h1ForeColor`, `@h2BckGrdColor`, `@h2ForeColor` (cela permet de rendre le code plus paramétrable). Puis je crée un tag `supertag` et surcharge les styles `h1`, `h2` et `input`. Cela signifie que tous les tags `h1`, `h2` et `input` à l'intérieur d'un tag `supertag` prendront les styles définis dans notre fichier less.

#####index.scala.html

Nous pouvons maintenant utiliser notre tag `<supertag>`. Allez modifier la vue `index.scala.html` : encadrez tous le code html par le tag `<supertag></supertag>` :


```html

	@(
	message: String,
	bookmarks: List[models.Bookmark],
	categories: List[models.Category],
	user: User
	)

	@main("Gestion des bookmarks", user) {

	<supertag>
	<h1>BookMarks</h1>
	<h6>@message</h6>
	<!-- Formulaire de saisie : Catégories -->
	<fieldset>
	    <h2>Nouvelle Cat&eacute;gorie</h2>
	    <form method="post" action="@routes.Categories.add()">
	        <input name="label" placeholder="label">
	        
	        <button class="btn" type="submit">Ajouter la Cat&eacute;gorie</button>
	    </form>
	</fieldset>

	@if(flash.containsKey("error")) {
		<div class="alert alert-error">
			<strong>Oups!</strong> @flash.get("error")
		</div>
	}
		
	<!-- Liste des Catégories -->
	<ul>
	    @for(category <- categories) {
	    <li>@category.id @category.label</li>
	    }
	</ul>

	<!-- Formulaire de saisie : Bookmarks -->

	<fieldset>
	    <h2>Nouveau Bookmark</h2>
	    <form method="post" action="@routes.Bookmarks.add()">
	        <input name="title" placeholder="title">
	        <input name="url" placeholder="url">
	        <input name="details" placeholder="details">

	        <select size="1" name="category.id">
	            @for(category <- categories) {
	            <option value="@category.id">@category.label</option>
	            }
	        </select>

	        <button class="btn" type="submit">Ajouter le Bookmark</button>
	    </form>
	</fieldset>
	<!-- Liste des Bookmarks -->
	<ul>
	    @for(bookmark <- bookmarks) {
	    <li>@bookmark.title : <a href="@bookmark.url">@bookmark.url</a> :
	        @if(bookmark.category != null) {
	        @bookmark.category.label
	        }
	    </li>
	    }
	</ul>
	</supertag>
	}
```

Enregistrez. Lancez : Tadaaaaa !

![FIG1](rsrc/10-assets-less-001.png)\


>Oui je sais, c'est moche !

Entrainez vous maintenant, vous verrez, cela devient intéressant de faire du css ;).

