# Découverte des modules

Il existe un grand nombre de modules complémentaires pour ajouter des fonctionnalités à Play. Nous allons en voir quelques exemples.

## Validation côté client avec HTML5

La spécification HTML 5 prévoit la possibilité de valider les données d'un formulaire HTML côté client, directement dans le navigateur avant d'envoyer les données vers un serveur.
Il existe un module pour Play qui permet de faire un mapping entre les annotations de validation du modèle (qui servent normalement à valider les données côté serveur) et le rendu HTML, pour intégrer cette fonctionnalité.

Pour activer ce module, après l'avoir téléchargé il suffit d'ajouter cette ligne dans le fichier dependencies.yml, dans la section _require_ :

    - play -> html5validation 1.2


Sur une entité du modèle, on ajoute une annotation de validation pour indiquer qu'un des champs est obligatoire : 

	@Entity  
	public class Album extends Model {  
	  
		@Required  
		public String name;  
	}  

Dans le formulaire HTML, on peut utiliser un nouveau tag, #{input} : 

	#{input for:'album.name', type:'text', id:'name' /}  

Ce tag sera traduit en une balise input classique, avec un attribut indiquant que le champ est obligatoire : 

    <input type="text" name="album.name" value="album?.name" id="name" required="required"/>

Le rendu est le suivant si on valide le formulaire sans remplir le champ obligatoire : 

![Alt "p03_ch01_01"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p03_ch01_01.png)

Le tag input supporte un grand nombre d'options et plusieurs types d'annotations de validation, comme @Match pour valider une expression régulière ou @Email. Toutes ces options sont décrites dans [cette documentation](http://www.playframework.org/modules/html5validation-1.0/home).

Si votre navigateur ne supporte pas la validation HTML5, aucun soucis car la validation côté serveur sera exécutée dans tous les cas. J'ai testé avec Chrome 10 et Firefox 4 beta 12 et cela fonctionne parfaitement sur ces navigateurs.

## Play et Scala

Play propose d'utiliser au choix les langages Scala ou Java pour développer des applications.
Scala est un langage pour la machine virtuelle Java (JVM) qui marie les caractéristiques des langages orientés objet et des langage fonctionnels.
C'est un langage très différent de Java, il demande donc un temps d'adaptation pour les développeurs Java. Cependant, nous allons voir à travers quelques exemples que c'est un langage très intéressant qui peut nous aider à améliorer sensiblement la lisibilité et l'expressivité du code, grâce à l'approche fonctionnelle.

### Exemples de code

Pour effectuer le rendu d'un template, une seule ligne suffit. On déclare une map contenant les attributs de la page à afficher :

	def list() = {
		Template('albums -> Albums.all.fetch(100))
	}
	
On peut facilement trier une collection avec la fonction filter :

	var numbers = Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
	// Récupération des nombres pairs
	var evenNumbers = numbers.filter(x => x%2==0)

On peut même simplifier l'écriture de cette fonction avec le caractère joker '_' :

	var evenNumbers = numbers.filter(_%2==0)

Cette fonction nous sera utilise dans l'application vote4music, notamment pour trier les albums par année :
	
	albums = albums.filter(x => formatYear.format(x.releaseDate).equals(year))
	    
Pour tirer des albums en fonction du nombre de votes, dans le sens décroissant, on peut écrire :

	albums.sortBy(_.nbVotes).reverse

Pour trouver l'intervalle compris entre 2 entiers, ici le plus ancien album et le plus récent, il suffit d'écrire :

	val first = Albums.firstAlbumYear
	val last = Albums.lastAlbumYear
	//Utilisation de la fonction to
	years = first.to(last).toList

En Java, ces exemples auraient nécessité de passer par de vilaines boucles for (ou par l'utilisation de librairies comme Guava ou lambdaJ).

Une version totalement écrite en Scala de l'application vote4music est consultable ici[https://github.com/loicdescotte/vote4music-scala]

### Installer le module Scala

Pour installer ce module, il suffit d'ajouter cette ligne dans le fichier dependencies.yml, dans la partie require : `- play -> scala 0.9`.
Ca y'est vous êtes armés pour développer en Scala!

### Apprendre Scala

Si vous désirez apprendre ce langage, il existe un e-book gratuit (en anglais) : http://programming-scala.labs.oreilly.com/index.html[http://programming-scala.labs.oreilly.com/index.html]
	
## jQuery datatables

Nous avons utilisé le plugin datatables de jQuery dans la partie 1 de ce livre. Nous allons maintenant voir comment l'intégrer automatiquement au système de CRUD avec un module Play. 
    TODO See https://github.com/schaloner/tabula-rasa

## Google APP Engine et Siena

    TODO See http://viralpatel.net/blogs/2011/01/first-play-framework-gae-siena-application-tutorial-example.html

## Et plein d'autres modules!

Il existe un tas d'autres modules et de nouveaux arrivent fréquemment grâce à la communauté des développeurs Play. La liste complète des modules disponibles est consultable ici[http://www.playframework.org/modules].