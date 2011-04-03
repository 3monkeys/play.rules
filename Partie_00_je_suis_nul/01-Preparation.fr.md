#On se met en jambes

Tout ce qui va se dire ici doit être oublié une fois que vous passerez au chapitre 1. Le chapitre "zéro" n'est là que pour désacraliser la bête. Vous ne vous sentez pas à l'aise avec le développement web en java, le pattern MVC vous donne des boutons (faut reconnaître qu'une indigestion de Struts c'est moyen), écrire des requêtes SQL vous angoisse, vous êtes débutant etc. ... Mais vous voulez vous y coller tout de suite (l'est-y pas tout plein de motivation !). Et bien, ce chapitre est pour vous (vous allez très vite comprendre pourquoi)

##Play! c'est quoi ?

On l'a déjà dit dans l'intro ! Mais je vous donne ma définition : *"c'est le moyen de se la jouer rapidement en java-web, alors que l'on n'est pas forcément le meilleur de l'équipe"*

Lorsque vous aurez lu les chapitres du niveau supérieur et passé tous les boss de fin de niveau, vous verrez aussi que c'est un excellent framework qui vous permet de pondre des applications web de qualité, robustes, maintenables, "scalables" ... (Oh p... j'ai l'impression de répondre à un appel d'offre).
Mais ça c'est pour mes petits camarades [@loic_d](@loic_d) et [@mklabs](@mklabs). Du coup vous aurez compris que c'est moi qui ne suis pas le meilleur de l'équipe ;)

##Bon on s'y colle ?

Nous allons voir comment :

- installer Play!
- définir le cahier des charges de notre 1ère application
- générer le squelette de l'application
- paramétrer votre IDE préféré (en fait je vais vous dire quel IDE utiliser)

###Pré-requis

Vous devez avoir installé Java sur votre joujou préféré.

*Si vous ne savez pas faire, créez une "issue" sur le repository git du bouquin : [https://github.com/3monkeys/play.rules/issues](https://github.com/3monkeys/play.rules/issues), ça veut dire que c'est utile à rajouter dans le bouquin.*

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
	

***Remarque :*** *En ce qui me concerne, je fais toutes les manipulations sous OSX, mais globalement la logique est la même sous Linux ou Windows. Si vous avez un soucis, créez une "issue" sur le repository git du bouquin : [https://github.com/3monkeys/play.rules/issues](https://github.com/3monkeys/play.rules/issues).*

###L'Appel d'Offres

*Ou comment je vais être hors sujet pendant quelques minutes ... Imaginons ...*

Vous êtes Philou, chef de projet technique dans une cht'ite SSII parisienne, plutôt orienté (vous) technologies .Net. Pour des raisons personnelles (Dulcinée, marre de Panam, du RER, ...) vous décidez de retourner à la campagne (euh en province pardon) et intégrez une agence régionale d'une grande SSII nationale.

####1er jour : confrontation avec votre chef d'agence

**Lui :** *Tu sais, Philou, chez nous on est tous ingés, car on doit savoir tout faire, et on est tour à tour Chef de projet, architecte, développeur, ...*

**Vous :** *Ah c'est pour ça que sur mon contrat de travail il y a marqué ingénieur d'études ?*

**Lui :** *Exactement ! Je suis content que tu adhères à notre façon de penser, c'est très corporate, notre collaboration va être particulièrement entrichissante.*

**Vous :** *...*

**Lui :** *Par contre en ce moment nous n'avons pas de missions .Net, tu sais ce qui est porteur chez nos clients, c'est Java. Et à ce titre, je souhaiterais que tu sois formé à Java. Tu n'y vois pas d'inconvénient ?*

**Vous :** *Bien au contraire !* `[Motivation mal dissimulée]` *Et chez vous, les formations sont faites en interne ou par le biais d'un organisme ?*

**Lui :** *Philou, par expérience, la formation la plus efficace, c'est l'autoformation, c'est de cette manière que tu retiendras le mieux les choses.*

**Vous :** *...* `[je suis un lapin de 6 semaines et j'aime ça]`

**Lui :** *Allez pas de chichi entre nous, je vais être sympa, tu peux faire ton intercontrat chez toi, tu seras plus tranquille, tu as un PC bien sûr ? Au fait tu pourrais poser des jours de congés par anticipation ? Genre je te permet de faire 5 jours en interco à la maison et toi tu fais le 2ème pas, tu poses 5 jours supplémentaires ?*

**Vous :** *Non. Je vous demande même pas si vous avez des bouquins sur Java ?*

**Lui :** *Non, ne demande pas. Allez, je t'appelle dès qu'une mission en adéquation avec ton profil se présente.*

Et les semaines, mois, ... passent à apprendre Java à la terrasse du café en face de chez vous, le tout entrecoupé de quelques missions à forte valeur ajoutée autour de technologies d'avenir telles MS Access, Delphi, ...

*Toute ressemblance avec des personnages existants serait totalement fortuite.*

####Pétage de plombs

Bon, apprendre Java tout seul, bof ... C'est le printemps, vous êtes dans une région magnifique où le réseau halieutique (les rivières, les étangs, ...) est très riche. Grande décision : vous avez décidez de vous mettre à la pêche "sportive" et f#%$ Java ! C'est parti pour les grandes balades au bord de l'eau.

Après quelques jours sur le même spot, vous faites la connaissance de Julo qui fait partie de l'amicale des pêcheurs de l'Azergues. Quelques canettes de bières plus tard, vous tentez d'expliquer à Julo ce qu'est un ingénieur informaticien. C'est à ce moment là qu'il sort "La Poire Maison" de sa besace car ça y'est vous êtes "potes de pêche". 
1 heure après vous êtes LA PERSONNE qui va faire le site web de gestion des prises de pêches des concours de l'amicale des pêcheurs de l'Azergues et *en PLAY!Framework* bien sûr. 
Rendez-vous, donc, dimanche au local de l'amicale pour établir les spécifications, capturer les besoins, définir les exigences utilisateurs (eh oui, moi la poire ça me rend loquace)

####Le Cahier des Charges

Plusieurs fois par an, l'amicale des pêcheurs de l'Azergues organise un concours de pêche. L'amicale souhaiterait pouvoir gérer les inscrits et leurs prises lors de chacun des concours.
C'est court (eh oui le client n'est pas mature dans l'expression de ses besoins), mais ça sera suffisant pour la création de notre application.

Maintenant, j'arrête de délirer et nous repassons à la technique.


###Créer le squelette de l'application

Nous avons donc installé Play, nous allons commencer à bosser :

- Créer un workspace (le répertoire qui hébergera tes applications), et "aller dedans"

> sous OSX :

            mkdir play_projects
            cd play_projects

> sous Windows :

            md c:\play_projects
            cd c:\play_projects


- Créer le squelette de l'application

> * En mode commande, taper `play new azerguespeche` où "azerguespeche" est le nom de notre application
si tout va bien, ceci devrait s'afficher :

		~        _            _ 
		~  _ __ | | __ _ _  _| |
		~ | '_ \| |/ _' | || |_|
		~ |  __/|_|\____|\__ (_)
		~ |_|            |__/   
		~
		~ play! 1.1.1, http://www.playframework.org
		~
		~ The new application will be created in /Users/k33g_org/Dropbox/play_projects/azerguespeche
		~ What is the application name? [azerguespeche] 

> * Valider. Si tout va bien, ceci devrait s'afficher :

		~
		~ OK, the application is created.
		~ Start it with : play run azerguespeche
		~ Have fun!
		~

- Lancer l'application : `play run azerguespeche', vous allez obtenir dans la console :

		~        _            _ 
		~  _ __ | | __ _ _  _| |
		~ | '_ \| |/ _' | || |_|
		~ |  __/|_|\____|\__ (_)
		~ |_|            |__/   
		~
		~ play! 1.1.1, http://www.playframework.org
		~
		~ Ctrl+C to stop
		~ 
		Listening for transport dt_socket at address: 8000
		05:44:38,610 INFO  ~ Starting /Users/k33g_org/Dropbox/play_projects/azerguespeche
		05:44:40,219 WARN  ~ You're running Play! in DEV mode
		05:44:40,357 INFO  ~ Listening for HTTP on port 9000 (Waiting a first request to start) ...

- lancer le navigateur : [http://localhost:9000/](http://localhost:9000/)

<!--![Alt "ch00_01"](/3monkeys/play.rules/blob/master/rsrc/ch00_01.png?raw=true)-->
![Alt "ch00_01"](https://github.com/3monkeys/play.rules/raw/master/rsrc/ch00_01.png)

**Wouaaoo ! Vous êtes trop forts, on va bientôt pouvoir commencer.**

###Paramétrage de l'IDE

En ce qui concerne l'IDE, vous pouvez très bien utiliser un simple éditeur de code avec colorisation syntaxique (Vous avez par exemple KomodoEdit qui fonctionne sur toutes les plateformes qui est assez sympa ... et open-source), mais c'est vraiment si vous voulez vous la jouer en démo ou que vous connaissez Java par coeur ou que vous codez sur un eeepc 701.

Play! propose les commandes nécessaires pour transformer votre projet en projet Eclipse, NetBeans ou IntelliJ. Je suis particulièrement accro à NetBeans, mais pour avoir utilisé la version Community d'IntelliJ (Win, Tux, OSX), je vous conseille fortement de choisir cet IDE, étant donné que la version open source suffit largement pour faire du Play!, pourquoi se priver ?

Voyons donc comment faire pour transformer notre squelette d'application en projet IntelliJ (bien sûr vous avez téléchargé IntelliJ : [http://www.jetbrains.com/idea/](http://www.jetbrains.com/idea/)) :

- Tout d'abord, nous devons arrêter notre application : faire `Control+c` dans la console pour quitter
- En mode commande : `play idealize azerguespeche` (pour NetBeans ça serait `play netbeansify links`)

		~        _            _ 
		~  _ __ | | __ _ _  _| |
		~ | '_ \| |/ _' | || |_|
		~ |  __/|_|\____|\__ (_)
		~ |_|            |__/   
		~
		~ play! 1.1.1, http://www.playframework.org
		~
		~ OK, the application is ready for Intellij Idea
		~ Use File/New Module/Import Existing module
		~

**Puis on lance IntelliJ et on fait les manipulations suivantes :**

- Créer un nouveau projet :

<!--![Alt "ch00_02"](/3monkeys/play.rules/blob/master/rsrc/ch00_02.png?raw=true)-->
![Alt "ch00_02"](https://github.com/3monkeys/play.rules/raw/master/rsrc/ch00_02.png)

- Saisir le nom du projet `Azergues` et l'endroit où vous souhaitez le sauvegarder, puis clickez sur `Finish` :

<!--![Alt "ch00_03"](/3monkeys/play.rules/blob/master/rsrc/ch00_03.png?raw=true)-->
![Alt "ch00_03"](https://github.com/3monkeys/play.rules/raw/master/rsrc/ch00_03.png)

- Ensuite une fenêtre s'affiche, vous permettant d'ajouter un module
- Sélectionnez `Modules`
- Clickez sur le `+` en haut (un peu) à gauche

<!--![Alt "ch00_04"](/3monkeys/play.rules/blob/master/rsrc/ch00_04.png?raw=true)-->
![Alt "ch00_04"](https://github.com/3monkeys/play.rules/raw/master/rsrc/ch00_04.png)

- Sélectionnez le choix `Import existing module`
- Précisez le chemin du fichier module `azerguespeche.iml` (qui a été généré par Play! lors de la commande `play idealize azerguespeche`)
- Puis clickez sur `Finish`

<!--![Alt "ch00_05"](/3monkeys/play.rules/blob/master/rsrc/ch00_05.png?raw=true)-->
![Alt "ch00_05"](https://github.com/3monkeys/play.rules/raw/master/rsrc/ch00_05.png)

- La fenêtre se réactualise avec un onglet `Sources`
- Dans l'onglet, clickez sur `Add Content Root`. Nous allons ajouter les dépendances à certains modules embarqués dans Play!.

<!--![Alt "ch00_06"](/3monkeys/play.rules/blob/master/rsrc/ch00_06.png?raw=true)-->
![Alt "ch00_06"](https://github.com/3monkeys/play.rules/raw/master/rsrc/ch00_06.png)

- Précisez le répertoire du module `CRUD` (présent dans le répertoire d'installation de Play!). Ce module nous permettra de générer automatiquement des écrans de saisie et de visualisation.

<!--![Alt "ch00_07"](/3monkeys/play.rules/blob/master/rsrc/ch00_07.png?raw=true)-->
![Alt "ch00_07"](https://github.com/3monkeys/play.rules/raw/master/rsrc/ch00_07.png)

- Précisez le répertoire du module `Secure` (présent dans le répertoire d'installation de Play!). Ce module nous permettra de gérer facilement l'authentification.

<!--![Alt "ch00_08"](/3monkeys/play.rules/blob/master/rsrc/ch00_08.png?raw=true)-->
![Alt "ch00_08"](https://github.com/3monkeys/play.rules/raw/master/rsrc/ch00_08.png)

- Votre projet est paramétré
- Clickez sur OK (ça va mouliner quelques secondes)

<!--![Alt "ch00_09"](/3monkeys/play.rules/blob/master/rsrc/ch00_09.png?raw=true)-->
![Alt "ch00_09"](https://github.com/3monkeys/play.rules/raw/master/rsrc/ch00_09.png)

- Et hop! Vous arrivez dans l'arborescence de votre projet :

<!--![Alt "ch00_10"](/3monkeys/play.rules/blob/master/rsrc/ch00_10.png?raw=true)-->
![Alt "ch00_10"](https://github.com/3monkeys/play.rules/raw/master/rsrc/ch00_10.png)

**Voilà, nous sommes prêts à démarrer, nous pouvons passer à l'étape suivante.**
**Rendez-vous donc au chapitre suivant :** [02-Premiere_application.fr.md](02-Premiere_application.fr.md).







