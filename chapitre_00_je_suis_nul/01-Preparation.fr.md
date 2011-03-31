#On se met en jambes

Tout ce qui va se dire ici doit être oublié une fois que vous passerez au chapitre 1. Le chapitre "zéro" n'est là que pour désacraliser la bête. Vous ne vous sentez pas à l'aise avec le développement web en java, le pattern MVC vous donne des boutons (faut reconnaître qu'une indigestion de Struts c'est moyen), écrire des requêtes SQL vous angoisse, vous êtes débutant etc. ... Mais vous voulez vous y coller tout de suite (l'est-y pas tout plein de motivation !). Et bien, ce chapitre est pour vous (vous allez très vite comprendre pourquoi)

##Play! c'est quoi ?

On l'a déjà dit dans l'intro ! Mais je vous donne ma définition : *"c'est le moyen de se la jouer rapidement en java-web, alors que l'on n'est pas forcément le meilleur de l'équipe"*

Lorsque vous aurez lu les chapitres du niveau supérieur et passé tous les boss de fin de niveau, vous verrez aussi que c'est un excellent framework qui vous permet de pondre des applications web de qualité, robustes, maintenables, "scalables" ... (Oh p... j'ai l'impression de répondre à un appel d'offre).
Mais ça c'est pour mes petits camarades [@loic_d](@loic_d) et [@mklabs](@mklabs). Du coup vous aurez compris que c'est moi qui ne suis pas le meilleur de l'équipe ;)

##Bon on s'y colle ?

Nous allons voir comment :

- installer Play!
- paramétrer votre IDE préféré (en fait je vais vous dire quel IDE utiliser)

###Installation

- Télécharger Play Framework : [http://http://www.playframework.org/download](http://http://www.playframework.org/download)
- dézipper quelque part
- ajouter à votre path : c'est mieux

> sous windows ça devrait donner ceci : (dans les variables utilisateur) si vous avez dézippé dans C:\play

            créer PLAY_HOME = C:\play
            ajouter %PLAY_HOME% au path : PATH = C:\bla bla bla;%PLAY_HOME%

> sous OSX, ceci

            sudo pico ~/.bash_profile
            PLAY_HOME=/Users/ton_user_name/play; export PLAY_HOME
            export PATH=$PATH:$PLAY_HOME

> sous Linux, ça doit être comme sous OSX (non ?)

			/* TODO */

- en mode commande : tapez `play` pour voir. Si tout va bien, vous aurez ceci :

		~        _            _ 
		~  _ __ | | __ _ _  _| |
		~ | '_ \| |/ _' | || |_|
		~ |  __/|_|\____|\__ (_)
		~ |_|            |__/   
		~
		~ play! 1.1.1, http://www.playframework.org
		~
		~ Usage: play cmd [app_path] [--options]
		~ 
		~ with,  new      Create a new application
		~        run      Run the application in the current shell
		~        help     Show play help
		~
	

***Remarque :*** *En ce qui me concerne, je fais toutes les manipulations sous OSX, mais globalement la logique est la même sous Linux ou Windows. Si vous avez un soucis, créez une "issue" sur le repository git du bouquin : [https://github.com/3monkeys/play.rules/issues](https://github.com/3monkeys/play.rules/issues)*

###Paramétrage de l'IDE



