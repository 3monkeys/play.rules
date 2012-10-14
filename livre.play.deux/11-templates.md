#Créer des templates Play

>*Qu'allons nous voir ?*

>	- *Comment créer un template Play ré-utilisable avec giter8*


##Pourquoi ?

Voilà, vous commencez à "bricoler" avec Play 2. Vous en avez fait la pub à tout vos camarades de travail, du coup, vous devez faire des démos à un peu tout le monde. Et vous vous apercevez qu'à chaque fois, vous devez à chaque fois 

- copier les fichiers twitter bootstrap, 
- créer un répertoire `models`, 
- que finalement vous avez besoin de l'authentification, le modèle `user`, le controller associé, 
- que la page de démarrage, le fichier de conf, ... ce sont toujours les mêmes
- etc. ...

Et un "ingénieur informaticien", c'est fainéant ....

La possibilité de faire des templates est prévues dans Play 2, mais n'est pas encore disponible à l'heure où j'écris (en tous les cas je ne suis pas au courant).

Cependant il y a une solution (Play 2 va probablement utiliser les mêmes composants) : **Giter8** [https://github.com/n8han/giter8](https://github.com/n8han/giter8).

**Giter8** est un outil en ligne de commande qui permet de générer une structure projet à partir d'un template projet hébergé sur github (donc pour le moment, pas le choix, il faut héberger ça sur github).

J'ai pu tester sous windows et OSX, je n'ai pas eu de problème. Il y a quelques pré-requis avant d'arriver à installer **Giter8**, mais vous allez voir tout est simple.

##Prérequis : Installation de conscript

**Conscript** est un utilitaire qui va nous permettre d'installer **Giter8**.

- aller ici : [https://github.com/n8han/conscript#readme](https://github.com/n8han/conscript#readme)
- télécharger "conscript runnable jar" : [https://github.com/downloads/n8han/conscript/conscript-0.4.0.jar](https://github.com/downloads/n8han/conscript/conscript-0.4.0.jar)
- lancer **Conscript** (en général un double-click sur le jar suffit, sinon : `java -jar conscript-0.4.0.jar`)
- attendre, un message va vous avertir que `cs` a été installé
- mettre `cs` dans votre path

##Installation de giter8

Tout simplement :

- en mode commande, tapez `cs n8han/giter8` ... patientez
- c'est fini

##Création/Préparation de votre template projet

Créez un répertoire (que vous penserez à pousser sous github ensuite) avec la structure suivante :
j'ai appelé mon répertoire `play-java-lazy.g8` : Les templates sont sur des repositories github et ont un suffixe `.g8`.

... et il contient ceci :

	play-java-lazy.g8
		+-project
		| +-plugin.sbt
		|
		+-src/
		  +-main/
		    +-g8/
		    | +-default.properties
		    | +-$application_names$/
		    |  	+-app/
		    |  	+-conf/
		    |     +-application.conf
		    |  	+-project/
		    |     +-build.properties
		    |     +-Build.scala
		    |     +-plugin.sbt
		    |  	+-public/
		    |  	+-README.md
		    |  

###Dans `/project/plugin.sbt` :

	addSbtPlugin("net.databinder" %% "giter8-plugin" % "0.4.4")

###Dans `/src/main/g8/default.properties` :

	description = This template generates a Java play 2.0.x project with some goodies
	play_version=2.0.2
	application_secret = unicornslovecats
	application_name = killer_app
	verbatim = *.html *.js *.css *.coffee

###Dans `/src/main/g8/$application_names$/` :

Vous copiez les répertoires les répertoires de votre projet "template".

###Vérifier que `/src/main/g8/$application_names$/project/Build.scala` a bien le contenu suivant:

	import sbt._
		import Keys._
		import PlayProject._

		object ApplicationBuild extends Build {

		    val appName         = "$application_name$"
		    val appVersion      = "1.0"

		    val appDependencies = Seq(
		      // Add your project dependencies here,
		    )

		    val main = PlayProject(appName, appVersion, appDependencies, mainLang = JAVA).settings(
		      // Add your own project settings here   
		    )

		}

**Ce qui est important,** c'est la ligne `val appName = "$application_name$"`, cela permet de choisir le nom de votre projet à la création de celui ci (ainsi que le nom du répertoire projet).


###Dans `/src/main/g8/$application_names$/conf/application.conf` :

Vous pouvez rendre le paramètre `application.conf` paramétrable (valeur par défaut dans `default.properties`) :

	# If you deploy your application to several instances be sure to use the same key!
	application.secret="$application_secret;format="random"$"


###Vérifier que dans `/src/main/g8/$application_names$/project/plugin.sbt` :

Il y a la bonne version de **Play** :

	// Comment to get more information during initialization
	logLevel := Level.Warn

	// The Typesafe repository
	resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"

	// Use the Play sbt plugin for Play projects
	addSbtPlugin("play" % "sbt-plugin" % "2.0.2")

	sbtPlugin := true

###Vérifier que dans `/src/main/g8/$application_names$/project/build.properties` :

Il y a la bonne version de **sbt** : par exemple `sbt.version=0.11.3`

Vous pouvez trouver un exemple ici : [https://github.com/k33g/play-java-lazy.g8](https://github.com/k33g/play-java-lazy.g8). *(PS: ne pas tenir compte du fichier mycommands.scala, c'est juste un test)*

Mais pour être "plus sûr", vous pouvez allez voir l'exemple de chez **TypeSafe** : [https://github.com/typesafehub/play-java.g8](https://github.com/typesafehub/play-java.g8).

###Poussez moi tout ça sous github

- en mode commande pour les champion
- avec le fabuleux client github (pour moi)

##Installation d'un template :

Maintenant que votre modèle de projet giter8 est publié sous github, vous pouvez l'installer simplement, en tapant la commande suivante dans un terminal :

	g8 k33g/play-java-lazy.g8

Puis répondez aux questions, par exemple :

	This template generates a Java play 2.0.x project with some goodies 

	application_secret [unicornslovecats]: 
	application_name [killer_app]: 
	play_version [2.0.2]: 2.0.3

Et voilà, votre application est créée, vous n'avez plus qu'à lancer.










