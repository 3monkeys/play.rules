Le SOCLE de notre application grâce au module CRUD
=

Dans ce chapitre nous allons :

- paramétrer notre projet pour utiliser la base de données embarquée : HSQLDB
- déclarer le module CRUD
- créer des classes "Models"
- utiliser le module CRUD pour générer notre IHM de saisie
- apporter quelques modifications pour améliorer l'affichage et valider les saisies

Et tout ceci facilement et rapidement

##Préparation de notre environnement

###Nous allons avoir besoin d'une base de données

> * chercher dans `/conf/application.conf` ceci :

	    # Database configuration
	    # ~~~~~ 
	    # Enable a database engine if needed.
	    #
	    # To quickly set up a development database, use either:
	    #   - mem : for a transient in memory database (HSQL in memory)
	    #   - fs  : for a simple file written database (HSQL file stored)
	    # db=mem

> * activer la ligne `# db=mem` en enlevant # et remplaçant `mem` par `fs`

###Nous allons activer le module CRUD

*C'est quoi CRUD ?*, alors déjà, ça veut dire **C**reate **R**ead **U**pdate **D**elete, le module CRUD de Play! va permettre de générer automatiquement pour vous les écrans de saisie des données à partir de votre modèle objet avec toute la mécanique qui va bien pour sauvegarder vos modifications. Je n'en dis pas plus, les exemples qui vont suivre parleront d'eux-même.

Donc pour activer le module CRUD :

> * aller dans `/azerguespeche/conf/application.conf`
> * ajouter ceci :

        # Import CRUD module
        module.crud=${play.path}/modules/crud

> * aller dans le fichier routes `/azerguespeche/conf/routes`
> * ajouter ceci :

        # Import CRUD routes
        * /admin module:crud

> * Et ceci : juste après `GET /   Application.index`

        GET /admin  module:crud`

*Note : on vient d'expliquer à Play! que l'on utilise le module CRUD lorsque l'on utilise l'url [http://localhost:9000/admin/](http://localhost:9000/admin/)*

**Avant de continuer, arrêtez puis relancez votre application :**

donc avec la commande : `play run azerguespeche` en mode console.

Vous devriez voir apparaître un message du type : `07:48:26,643 INFO  ~ Module crud is available (/Users/k33g_org/play/modules/crud)`

##Il est temps de créer notre modèle objet (model)

Pour se mettre en jambes nous allons créer des pêcheurs et des poissons. les sources des classes vont ici `/azerguespeche/app/models/`, (donc dans IntelliJ, vous faites un click-droit sur le répertoire models + new + Java Class)

###La classe Pecheur

aura le code suivant :

	package models;
	import javax.persistence.*;
	import play.db.jpa.*;

	@Entity
	public class Pecheur extends Model{
	    public String identifiant;
	    public String nom;
	    public String prenom;

	    public Pecheur(){

	    }
	
		/*ce constructeur n'est pas obligatoire, c'est pour plus tard*/
	    public Pecheur(String identifiant, String nom, String prenom) {
	        this.identifiant = identifiant;
	        this.nom = nom;
	        this.prenom = prenom;
	    }
	}

*Note : tous les modèles sont précédés par l'annotation `@Entity`, cela permet à Play! de savoir que c'est un modèle qui sera "persistable" en base de données.*

*Note bis : tous les modèles héritent de la classe `Model`, ce qui leur affecte différents "comportements", comme la méthode `save()`.*

*Note (encore) : vous pouvez remarquer que l'on n'utilise pas de getter ni de setter, mais directement des champs publiques, Play! s'occupera de les générer à la compilation.*

###La classe Poisson

	package models;
	import javax.persistence.*;
	import play.db.jpa.*;

	@Entity
	public class Poisson extends Model{
	    public String identifiant;
	    public String nom;

	    public Poisson() {
	    }
	
		/*ce constructeur n'est pas obligatoire, c'est pour plus tard*/
	    public Poisson(String identifiant, String nom) {
	        this.identifiant = identifiant;
	        this.nom = nom;
	    }
	}

ça c'est fait.

##Maintenant, au tour des contrôleurs

- dans `/azerguespeche/app/controllers/` créer les 2 classes "controllers" correspondant à nos 2 classes "models" précédentes

> pour info le contrôleur de Pecheur.java s'appellera Pecheur**s**.java (c'est la norme, on parle aussi de **conventions**)

Vous allez voir, c'est tout simple avec le mode CRUD :

###La classe Pecheur**s**

	package controllers;

	import play.*;
	import play.mvc.*;

	public class Pecheurs extends CRUD {

	}

###La classe Poisson**s**

	package controllers;

	import play.*;
	import play.mvc.*;

	public class Poissons extends CRUD {

	}

**C'est tout ?!?** ... Ben voui ! C'est pas la classe ça ?

Vérifions quand même : [http://localhost:9000/admin/](http://localhost:9000/admin/), et là vous devriez avoir l'écran suivant :

![Alt "p00_ch03_01"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_01.png)

Pour être plus sûr : clickez sur "add" à droite, sur la ligne "Pêcheur", nous allons ajouter quelques "amis pêcheurs" :

- Vous pouvez voir que Play! s'est débrouillé comme un chef à partir de la structure de votre classe `Pecheur`

![Alt "p00_ch03_02"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_02.png)

- Lorsque vous sauvegardez ("Save and create another"), Play! vous affiche un joli message d'encouragement (en vert)

![Alt "p00_ch03_03"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_03.png)

Créons encore 2 pêcheurs ... : `loic_d` et `mklabs`

Si vous revenez à la liste des pêcheurs (clickez sur pecheurs en haut : `Home > Pecheurs`) vous obtenez ceci et c'est laid ! :

![Alt "p00_ch03_04"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_04.png)

###Retournons vite modifier le code de nos modèles :

Nous allons nous contenter de rajouter (surcharger en fait) la méthode `toString()` de nos 2 modèles

####Dans Classe Pecheur

	@Override
    public String toString() {
        return identifiant+" : "+nom+" "+prenom;
    }

####Dans Classe Poisson

	@Override
    public String toString() {
        return identifiant+" : "+nom;
    }

Raffraichissez la page :

![Alt "p00_ch03_05"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_05.png)

C'est mieux, non ?

Nous allons créer quelques poissons, mais avant de continuer ...

###Comment rendre la saisie obligatoire ?

Tout simplement en utilisant l'annotation `@Required` au dessus des champs obligatoires (dans notre classe Poisson) et en ajoutant la référence suivante dans le code de la classe : `import play.data.validation.Required;`, nous aurons donc le code suivant :

	package models;
	import javax.persistence.*;

	import play.data.validation.Required;
	import play.db.jpa.*;

	@Entity
	public class Poisson extends Model{
	    @Required
	    public String identifiant;
	    @Required
	    public String nom;

	    public Poisson() {
	    }

	    public Poisson(String identifiant, String nom) {
	        this.identifiant = identifiant;
	        this.nom = nom;
	    }

	    @Override
	    public String toString() {
	        return identifiant+" : "+nom;
	    }
	}

*Note : faite donc la même chose pour la classe `Pecheur`, ça sera fait*

Vérifions si cela fonctionne en allant créer quelques poissons :

![Alt "p00_ch03_06"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_06.png)

Vous pouvez déjà remarquer que l'annotation "Required" apparaît en dessous des champs de saisie.
Essayez de sauvegarder sans avoir rien saisi :

![Alt "p00_ch03_07"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_07.png)

Play! vous affiche un message d'erreur, et où sont les champs obligatoires, tout ça juste avec une simple annotation !

Bon, maintenant, il faut les saisir ces poissons ...


###Comment "exiger" un format de saisie

Vous pouvez aussi déclarer qu'un type de format est nécessaire comme l'e-mail, un chiffre, etc. ...
Pour cela allons modifier la classe `Pecheur` en ajoutant un champ email et un champ département.

- pour l'email, nous utiliserons l'annotation `@Email` (la référence à déclarer dans le code sera : `import play.data.validation.Email;`)
- pour le département, c'est encore plus facile, le simple fait de le typer en `Integer` suffit

Le code de notre classe `Pecheur` va ressembler à ceci :

	package models;
	import javax.persistence.*;

	import play.data.validation.Email;
	import play.data.validation.Required;
	import play.db.jpa.*;

	@Entity
	public class Pecheur extends Model{
	    @Required
	    public String identifiant;
	    @Required
	    public String nom;
	    @Required
	    public String prenom;

	    @Email
	    public String email;

	    public Integer departement;

	    public Pecheur(){

	    }

	    public Pecheur(String identifiant, String nom, String prenom) {
	        this.identifiant = identifiant;
	        this.nom = nom;
	        this.prenom = prenom;
	    }

	    @Override
	    public String toString() {
	        return identifiant+" : "+nom+" "+prenom;
	    }
	}

- retournez dans votre appli web [http://localhost:9000/admin/pecheurs](http://localhost:9000/admin/pecheurs) :
- sélectionnez un pêcheur à modifier :

![Alt "p00_ch03_08"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_08.png)

Vous pouvez remarquer que le formulaire précise qu'il souhaite une adresse mail valide pour l'email et une valeur de type numérique pour le département.

Soyons donc débile :

- pour le mail, saisir : ph.charriere_gmail.com
- pour le département, saisir : Rhône
- clicker sur "Save"

![Alt "p00_ch03_09"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_09.png)

Eh oui, Play! propose bien un module "anti-débile" et vous explique ce qu'il faut saisir avant d'enregistrer.

##Quelques remarques

###Recherches

Je ne sais pas si vous avez vu, mais dans les pages du module CRUD il y a un "petit" module de recherche, on l'essaie ? En images :

![Alt "p00_ch03_10"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_10.png)

![Alt "p00_ch03_11"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_11.png)

![Alt "p00_ch03_12"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p00_ch03_12.png)

Plutôt sympa, vous n'avez rien eu à coder pour ça :)

###Modèles

Vous avez aussi noté (j'espère) que toutes les modifications apportées aux classes modèles étaient répercutées à la fois sur la partie base de données et la partie affichage, et tout cela sans gros effort.

##La suite (c'est fini pour cette partie)

Nous verrons comment :

- créer de nouveaux modèles et des relations entre eux (nous aborderons donc quelques notions de JPA)
- aller plus loin dans la personnalisation de nos écrans CRUD

Vous n'avez pas encore le statut "demi-dieu" de la programmation Web en java *(1)*, mais je sens déjà quelque chose frétiller en vous :) Non ? Vous avouerez que pour le moment c'est assez facile et sans effort et pourtant ça a déjà de la gueule. J'espère que cela vous donne envie de continuer.

- - -

- (1) : ne vous inquiétez pas, je n'ai pas cette prétention non plus ;), mais nous allons progresser ensemble


