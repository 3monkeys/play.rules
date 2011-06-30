Notre application CRUD ... la suite
=

##Introduction

Dans l'épisode précédant nous avons initié notre application grâce au module CRUD. Cette fois ci nous allons aller un peu plus loin. Nous verrons comment "franciser" notre site, comment lier les modèles et enfin modifier nos formulaires (enfin un formulaire).

##Tout d'abord quelques réglages

Dans application.conf cherchez le texte suivant :

	# i18n
	# ~~~~~
	# Define locales used by your application.
	# You can then place localized messages in conf/messages.{locale} files
	# application.langs=fr,en,ja

Ajoutez à la suite la ligne suivante :

	application.langs=fr

Créer un fichier `messages.fr` dans le répertoire `conf` de l'arborescence du projet

Puis, cherchez le texte suivant : (en général c'est juste après)

	# Date format
	# ~~~~~
	date.format=yyyy-MM-dd
	# date.format.fr=dd/MM/yyyy

Transformez moi ça en :

	# Date format
	# ~~~~~
	date.format=yyyy-MM-dd
	date.format.fr=dd/MM/yyyy

Nous venons d'expliquer à Play que notre locale est française, et nous avons précisé le format de date, cela aura donc une incidence sur les écrans de saisie.

##Evolutions de notre modèle :

Nous allons créer des compétitions, qui serviront à enregistrer les prises faites par chacun des pêcheurs. Je ne vais pas gérer les inscriptions, on dit que l'on saisit uniquement les pêcheurs et leurs prises lors des compétitions.

Nous aurons donc : une compétition est composée de prises, une prises c'est un poisson pris par un pêcheur.

Créer les 2 Classes `Competition` et `Prise` dans le répertoire `models` :

###La Compétition

~~~ java
	package models;

	import javax.persistence.*;

	import play.data.validation.Required;
	import play.db.jpa.*;

	import java.util.ArrayList;
	import java.util.Date;
	import java.util.List;

	@Entity
	public class Competition extends Model {
	    @Required
	    public String nom;
	    @Required
	    public Date date;

	    /*Il y a plusieurs prises dans une compétition
	      on fait le lien avec la propriété 'competition' de la classe Prise
	    */
	    @OneToMany(mappedBy="competition", cascade=CascadeType.ALL)
	    public List<Prise> prises = new ArrayList();

	    public Competition() {
	    }

	    public Competition(String nom, Date date) {
	        this.nom = nom;
	        this.date = date;
	    }

	    @Override
	    public String toString() {
	        return nom + " : " + date;
	    }
	}
~~~

###La Prise

~~~ java
	package models;

	import javax.persistence.*;


	import play.data.validation.Required;
	import play.db.jpa.*;

	@Entity
	public class Prise extends Model {

	    /* une prise est faite par un seul pêcheur */
	    @OneToOne
	    @Required
	    public Pecheur pecheur;

	    /* on ne prend qu'un seul poisson à la fois */
	    @OneToOne
	    @Required
	    public Poisson poisson;

	    /* plusieurs prises dans une compétition 
	       cette prise appartient à 1 seule compétition
	    */
	    @ManyToOne
	    @Required
	    public Competition competition;

	    public Prise() {
	    }

	    public Prise(Pecheur parQui, Poisson poissonPris, Competition pendantCompetition) {
	        this.pecheur = parQui;
	        this.poisson = poissonPris;
	        this.competition = pendantCompetition;
	    }

	    @Override
	    public String toString() {
	        return "Prise{" +
	                "par : " + pecheur.nom +" " + pecheur.prenom +
	                ", poisson : " + poisson.nom +
	                ", pendant : " + competition.toString() +
	                '}';
	    }

	}
~~~

- - -
**Remarque :** nous venons d'utiliser des annotations JPA pour "lier" nos modèles : @OneToOne, @ManyToOne, @OneToMany ...
Vous pouvez trouver une description de ces annotation ici [http://www.oracle.com/technetwork/middleware/ias/toplink-jpa-annotations-096251.html](http://www.oracle.com/technetwork/middleware/ias/toplink-jpa-annotations-096251.html) 

- - -

##N'oublions pas les contrôleurs

Il n'y a pas grand chose à écrire, mais sans ça cela ne fonctionnera pas.

Donc tout bêtement, créer les 2 Classes `Competitions` et `Prises` dans le répertoire `controllers` :

###Contrôleur Competitions

~~~ java
	package controllers;

	import play.*;
	import play.mvc.*;

	public class Competitions extends CRUD {

	}
~~~

###Contrôleur Prise

~~~ java
	package controllers;

	import play.*;
	import play.mvc.*;

	public class Prises extends CRUD {

	}
~~~

Vous pouvez lancer l'application et vérifier le bon fonctionnement de nos modifications.

- saisissez quelques compétitions
- saisissez quelques prises

... Nous en aurons besoin pour la suite (pour le moment, je vous passe les "screenshots", nous n'avons rien fait de très compliqué).

##On passe une vitesse : Modifions les formulaires CRUD !

Sérieux, on va avoir la prétention de modifier un "truc" qui fonctionne bien (très bien même), qui a été codé par des "pros" ?
Ben voui, on va se le permettre (et en plus Play est fait pour ça).

###Modifications simples

Comme vous avez pu vous en apercevoir, dans les formulaire CRUD les libellés des champs de saisie, correspondent au nom des propriétés des classes modèles, donc pas d'accent, pas d'espace, que du brut de décoffrage, donc bof. Il y a un moyen simple pour changer ceci.

Dans le répertoire `conf` de l'arborescence, il y a le fichier `messages.fr`, dans lequel vous pouvez saisir des libellés "plus parlants" qui seront utilisés (entre autre) par les formulaires CRUD.

- - -
**Remarque :** il est aussi possible de saisir dans le fichier `messages` (sans extension) mais cela sera valable pour toutes les langues

- - -

Saisissons dans ce fichier, ceci :

	pecheur = Pêcheur
	prise = Prise
	poisson = Poisson
	competition = Compétition

Allez faire un tour dans l'écran des prises :

![Alt "p00_ch04_01"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch04_01.png)

C'est plus pro, ça coûte pas cher, et c'est facile, voire trop facile! (la magie de Play!)

- - -
**Remarque :** il est possible d'avoir autant de fichiers `messages.xxx` que de langues.

- - -

###Modifications plus "profondes"

J'aimerais (nous aimerions) bien que l'écran d'une compétition affiche la liste des prises de la compétition (ce qui n'est pas le cas actuellement si vous avez bien suivi).

Le module CRUD permet de générer automatiquement le code d'une vue (liées à son controller), et donc de se passer de la version "générée à la volée"


- arrêtez l'application
- allez dans le répertoire de l'application : `cd azerguespeche/`
- tapez la commande `play crud:ov --template Competitions/show`

Cela vient de créer dans le répertoire `views` un répertoire `Competitions` avec un template `show.html` avec le code suivant :

~~~ html
	#{extends 'CRUD/layout.html' /}

	<div id="crudShow" class="${type.name}">

		<h2 id="crudShowTitle">&{'crud.show.title', type.modelName}</h2>

		<div class="objectForm">
		#{form action:@save(object._key()), enctype:'multipart/form-data'}
			#{crud.form /}
			<p class="crudButtons">
				<input type="submit" name="_save" value="&{'crud.save', type.modelName}" />
				<input type="submit" name="_saveAndContinue" value="&{'crud.saveAndContinue', type.modelName}" />
			</p>
		#{/form}
		</div>

		#{form @delete(object._key())}
			<p class="crudDelete">
				<input type="submit" value="&{'crud.delete', type.modelName}" />
			</p>
		#{/form}

	</div>
~~~

- vous pouvez remonter d'un cran : `cd ..`
- relancer votre application : `play run azerguespeche` (ça sera fait)

**Donc**, dorénavant, lorsque vous utiliserez le formulaire d'édition des compétitions, ce sera ce template qui sera utilisé.

- - -
**Remarque :** pour modifier le formulaire de liste (toujours du module CRUD), la commande serait la suivante : `play crud:ov --template Competitions/list`, pour modifier le template CRUD general (layout.html) dont héritent toutes les vues CRUD, la commande serait la suivante : `play crud:ov --layout` ... Amusez vous (sauvegardez avant).

- - -

####Nous allons créer un "tag" qui va permettre d'afficher la liste des prises d'une compétition

Dans un 1er temps, remplacer dans `show.html`, `#{crud.form /}` par `#{crud.form} #{/crud.form}`,
Puis au sein de la nouvelle balise, saisissez le code suivant :

~~~ html
	#{crud.custom 'prises'}
    <div>
        <ul>
        #{list items:object.prises, as:'prise'}
            <li>${prise.toString()}</li>
        #{/list}
        </ul>
    </div>
    #{/crud.custom}
~~~

- - -
**Remarque :** object représente l'objet (l'instance de classe) lié au formulaire. Dans le cas qui nous intéresse, c'est une compétition. Or, il se trouve que la classe `Competition` a une propriété `prises` qui contient la liste des prises d'une compétition.
Donc pour avoir la liste, il suffit d'appeler `object.prises` et de le parcourir avec `#{list}#{/list}`.

- - -

####Au final, votre template devrait ressembler à ceci :

~~~ html
	#{extends 'CRUD/layout.html' /}

	<div id="crudShow" class="${type.name}">

		<h2 id="crudShowTitle">&{'crud.show.title', type.modelName}</h2>

		<div class="objectForm">
		#{form action:@save(object._key()), enctype:'multipart/form-data'}

	        <!-- Liste des prises d'une competition -->
	        #{crud.form}
	            #{crud.custom 'prises'}
	            <div>
	                <ul>
	                #{list items:object.prises, as:'prise'}
	                    <li>${prise.toString()}</li>
	                #{/list}
	                </ul>
	            </div>
	            #{/crud.custom}
	        #{/crud.form}
	        <!-- Fin Liste des prises d'une competition -->

			<p class="crudButtons">
				<input type="submit" name="_save" value="&{'crud.save', type.modelName}" />
				<input type="submit" name="_saveAndContinue" value="&{'crud.saveAndContinue', type.modelName}" />
			</p>

		#{/form}
		</div>

		#{form @delete(object._key())}
			<p class="crudDelete">
				<input type="submit" value="&{'crud.delete', type.modelName}" />
			</p>
		#{/form}

	</div>
~~~

Et si tout va bien, vous devriez obtenir cela :

![Alt "p00_ch04_02"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch04_02.png)

Ok, ça casse pas 3 pattes à un canard esthétiquement parlant (encore que j'ai vu beaucoup plus moche sur des projets facturés ;) ), mais avouez que l'effort est bien faible au regard du résultat. Est-ce que vous commencez à vous sentir plus "à l'aise" avec Play! ?
Encore quelques étapes, et vous en saurez assez pour commencer à "bidouiller" des choses un peu plus "trapues".

##La suite (c'est fini pour cette partie)

Nous verrons comment :

- Créer des services
- Créer "from scratch" des pages qui utilisent ces services

- - -
**Remarque : N'hésitez pas** à aller ici : [https://github.com/3monkeys/play.rules/issues](https://github.com/3monkeys/play.rules/issues) pour poser vos questions ou faire vos remarques, je ne suis pas forcément toujours assez clair, et surtout je peux faire des erreurs.

- - - 
