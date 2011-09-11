Allez, on se cogne l'affichage
=

##Introduction

Si vous vous souvenez, au chapitre "ch02-Premiere-application", nous avions très rapidement (mais alors très très rapidement) modifié la vue principale de l'application, pour juste faire afficher un numéro de version. Cette vue, représentée par `index.html`, c'est la page principale de notre site, alors autant qu'elle affiche un peu plus d'informations.

Actuellement dans sa version courante (1.x.y), Play!► utilise un moteur de template d'affichage basé sur Groovy. Attention, vous n'avez pas besoin de connaître (presque pas) Groovy pour vous en servir. Au passage, ça n'engage à rien d'aller jeter un coup d'oeil à Groovy qui à mon sens est un fantastique langage (ça n'engage que moi, même pas les autres rédacteurs du présent bouquin). 

##Tout d'abord, les "spécifications"

Dans un premier temps, je veux afficher sur ma page d'accueil :

- les pêcheurs de l'association
- les poissons du coin
- la liste des compétitions

	//TODO : quand on clique sur une compétition on peut obtenir le détail de celle-ci

Dans un deuxième temps, je veux faire un peu de mise en page "sexy"

##Modifions le contrôleur

Allez ouvrir `Application.java` (dans `azerguespeche/app/controllers/`). Si vous n'avez rien cassé dans les chapitres précédents, vous devriez avoir le code suivant :

	package controllers;
	
	import play.*;
	import play.mvc.*;
	import java.util.*;
	import models.*;
	
	public class Application extends Controller {
	
	    public static void index() {
	
	        Version version = new Version();
	
	        render(version);
	    }
	
	}

###On code :

A ceux qui vont grincer des dents en lisant le code : désolé !. Eh oui j'utilise des variables "française", ce n'est pas joli joli. On s'en fout, nous sommes là pour apprendre à se dépatouiller avec Play!►. Pour les bonnes pratiques, vous verrez avec mes petits camarades dans les parties "pros".

####"Ramener" une liste d'enregistrements ?

C'est là, qu'une fois de plus Play!► est magique!. Nos objets "Models" ont tous des méthodes qui permettent d'aller interroger la base, se sauvegarder en base (pour les instances des modèles), etc. … :

- `Pecheur.find(string query)`
- `Pecheur.findAll()`
- `Pecheur.count()`
- `Pecheur toto = new Pecheur(); toto.save()`
- etc. … (RTFM)
	
Donc si je veux la liste de tous les pêcheurs, je vais utiliser ceci : `List<Pecheur> listePecheurs = Pecheur.findAll();`

####Et finalement ce contrôleur, il va ressembler à quoi ?

A ceci :

	package controllers;
	
	import play.*;
	import play.mvc.*;
	
	import java.util.*;
	
	import models.*;
	
	public class Application extends Controller {
	
	    public static void index() {
	
	        List<Pecheur> listePecheurs = Pecheur.findAll();
	        List<Poisson> listePoissons = Poisson.findAll();
	        List<Competition> listeCompetitions = Competition.findAll();
	
	        Version version = new Version();
	
	        render(listePecheurs, listePoissons, listeCompetitions, version);
	
	    }
	
	}

**Remarque :** la méthode `render` sert juste à "balancer" les données obtenue vers la vue.

Justement, allons modifier notre vue.

##Modifions la vue

Allez ouvrir la page `index.html` (dans `azerguespeche/app/views/Application`).

###Je souhaite afficher la liste des pêcheurs

1- je vais utiliser les tags html suivants : `<ul><li></li></ul>`
2- pour parcourir la liste des pêcheurs, je vais utiliser le tag de template Play!► : `#{list items:<list_items>, as:'<item>'} … #{/list}`
3- pour afficher une valeur, j'utiliserais  le tag de template Play!► : `${item.propertyOrMethod}`

Un exemple est toujours plus parlant :

	#{extends 'main.html' /}
	#{set title:'Azergues Pêche' /}
	
	<B>Version : ${version.reference} ${version.name}</B>
	
	<hr>
	
	<ul>
	    #{list items:listePecheurs, as:'pecheur'}
	        <li>${pecheur.identifiant} : ${pecheur.prenom} - ${pecheur.nom} (${pecheur.departement})</li>
	    #{/list}
	</ul>

Lancez votre application et accédez au lien : [http://localhost:9000/](http://localhost:9000/) :

![Alt "p00_ch05_01"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch05_01.png)

###Allez, on termine …

Complétons notre vue (toujours dans `index.html`) :

	#{extends 'main.html' /}
	#{set title:'Azergues Pêche' /}
	<h1>Azergues Pêche</h1>
	<B>Version : ${version.reference} ${version.name}</B>
	
	<hr>
	<h2>Nos amis pêcheurs</h2>
	<ul>
	    #{list items:listePecheurs, as:'pecheur'}
	        <li>${pecheur.identifiant} : ${pecheur.prenom} - ${pecheur.nom} (${pecheur.departement})</li>
	    #{/list}
	</ul>
	
	<h2>Les poissons du coin</h2>
	<ul>
	    #{list items:listePoissons, as:'poisson'}
	        <li>${poisson.nom}</li>
	    #{/list}
	</ul>
	
	<h2>Les compétitions</h2>
	<ul>
	    #{list items:listeCompetitions, as:'competition'}
	        <li>Le : ${competition.date} : ${competition.nom}</li>
	    #{/list}
	</ul>

Lancez votre application et accédez au lien : [http://localhost:9000/](http://localhost:9000/) :

![Alt "p00_ch05_02"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch05_02.png)

**Trop facile !**, maintenant je voudrais classer les compétitions par dates et avoir le détail d'une compétition quand je clique sur une compétition.

###On fignole

####Classer les compétitions de la plus récente à la plus vieille : 

Dans `Application.java` on remplace `List<Competition> listeCompetitions = Competition.findAll();` par `List<Competition> listeCompetitions = Competition.find("order by date DESC").fetch();` … Et là vous venez de faire une requête JPA. Vous pouvez tester votre page, ça fonctionne.

####Ajouter des liens pour avoir le détail des compétitions

Chaque modèle JPA hérite d'une propriété `id`, c'est de cette propriété dont nous allons nous servir pour identifier chacune des compétitions.

1- Modifions `index.html` la partie correspondant aux compétitions

	<h2>Les compétitions</h2>
	<ul>
	    #{list items:listeCompetitions, as:'competition'}
	        <li>Le : ${competition.date} : <a href="/competition?id=${competition.id}">${competition.nom}</a></li>
	    #{/list}
	</ul>

2- Modifions `Application.java` en lui ajoutant une méthode `competition()` (toute simple pour le moment) :

    public static void competition(Long id) {

        Long idCompetition = id;

        render(idCompetition);
    }

3- Créons une vue "competition" : créez une page `competition.html` dans `azerguespeche/app/views/Application/` avec le code suivant :

	#{extends 'main.html' /}
	#{set title:'Azergues Pêche' /}
	<h1>Azergues Pêche</h1>
	<B>Id Competition : ${idCompetition} </B>

4- Lancez votre application et accédez au lien : [http://localhost:9000/](http://localhost:9000/), on a bien les liens :

![Alt "p00_ch05_03"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch05_03.png)

5- Allons expliquer à Play!► que lorsque l'on clique sur un lien avec l'url `/competition` il faudra appeler la méthode `competition()`du contrôleur `Application`. Pour cela il suffit de modifier le fichier `routes` du répertoire `conf` en lui ajoutant la ligne suivante :

	GET /competition Application.competition

6- Clickez sur un lien, l'identifiant de la compétition est bien passé à la vue "competition"

![Alt "p00_ch05_04"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch05_04.png)

####Modifions le contrôlleur et terminons la vue "competition"

1- Modifions la méthode `competition()` de `Application.java` :

    public static void competition(Long id) {

        Competition competitionSelectionnee =  Competition.findById(id);
        render(competitionSelectionnee);
    }

2- Modifions la vue "competition" (la page `competition.html`) de la façon suivante :

	#{extends 'main.html' /}
	#{set title:'Azergues Pêche' /}
	<h1>Azergues Pêche</h1>
	<B>Id Competition : ${competitionSelectionnee.id} ${competitionSelectionnee.nom} Le ${competitionSelectionnee.date}</B>
	
	<h2>Les Prises</h2>
	<ul>
	    #{list items:competitionSelectionnee.prises, as:'prise'}
	        <li>${prise.poisson.nom} par ${prise.pecheur.nom}</li>
	    #{/list}
	</ul>

3- Lancez votre application et accédez au lien : [http://localhost:9000/](http://localhost:9000/)
4- Clickez sur un lien "compétition" :

![Alt "p00_ch05_05"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch05_05.png)

Et Hop, même pas mal!


##C'est moche !

Là je suis d'accord :). On va essayer d'embellir tout ça. Je ne suis pas un graphiste, nous allons faire dans le simple. Ensuite, libre à vous de laisser s'exprimer "le délire de l'artiste" ou "le fantasme de l'homme" (cf. "Pierre dans le Père Noël est une ordure").

Dans un 1er temps, réglons tout de suite une chose horrible : Vous avez du remarquer que je répète `<h1>Azergues Pêche</h1>` dans toute mes vues : c'est idiot. Dans le répertoire `azerguespeche/app/views/` vous avez une page `main.html` dont héritent les vues (vous savez la ligne `#{extends 'main.html' /}` en en-tête des vues). Donc vous me virez `<h1>Azergues Pêche</h1>` des vues et vous allez le coller dans `main.html` :

<!DOCTYPE html>

	<html>
	    <head>
	        <title>#{get 'title' /}</title>
	        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	        <link rel="stylesheet" type="text/css" media="screen" href="@{'/public/stylesheets/main.css'}">
	        #{get 'moreStyles' /}
	        <link rel="shortcut icon" type="image/png" href="@{'/public/images/favicon.png'}">
	        <script src="@{'/public/javascripts/jquery-1.4.2.min.js'}" type="text/javascript" charset="utf-8"></script>
	        #{get 'moreScripts' /}
	    </head>
	    <body>
	        <h1>Azergues Pêche</h1>
	        #{doLayout /}
	    </body>
	</html>

Si vous regardez le code de plus près, vous voyez qu'il fait référence à une feuille de style `main.css` dans le répertoire `/public/stylesheets`.
Allons donc modifier cette feuille (qui est vide pour le moment).

###La feuille de style : main.css


	body {
		background-color            : #ddd;
		color                       : #222;
		font-family                 : Helvetica;
		font-size                   : large;
		margin                      : 0;
		padding                     : 0;
	}
	
	h1 {
	    display                     : block;
	    width                       : 100%;
		margin                      : 0;
		padding-top                 : 10px;
	    padding-bottom              : 10px;
	    background                  : black;
	    text-align                  : center;
		text-decoration             : none;
	    font-size                   : 16px;
	    color                       : white;
		line-height                 : 20px;
		height                      : 20px;
	}
	
	h2 {
	    font-size                   : 18px;
	    margin                      : 20px;
	
	}
	
	ul {
		list-style                  : none;
		padding                     : 0;
		margin                      : 10px;
	}
	
	ul li {
		background-color            : #FFFFFF;
		border                      : 1px solid #999999;
	    color                       : #222;
		display                     : block;
		font-weight                 : bold;
		margin-bottom               : -1px;
		padding                     : 10px 8px;
		text-decoration             : none;
	}
	
	ul li:first-child {
		border-top-left-radius      : 6px;
		border-top-right-radius     : 6px;
	}
	
	ul li:last-child {
		border-bottom-left-radius   : 6px;
		border-bottom-right-radius  : 6px;
	}

###Derniers réglages

1- Ajoutez ceci `<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no, width=device-width">` dans `main.html`, cela permettra à votre page de bien s'adapter sur un mobile.

2- Lancez votre application et accédez au lien : [http://localhost:9000/](http://localhost:9000/) :

![Alt "p00_ch05_06"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch05_06.png)

Et sous iPhone, ce n'est pas trop mal non plus ;)

![Alt "p00_ch05_07"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch05_07.png)

OK, ça ne respire pas la couleur, mais en un rien de temps, vous vous êtes fait un site mobile. Allez, soyez créatifs!

C'est tout pour aujourd'hui.









