= Déploiement d'une application dans le cloud avec Heroku =

Heroku est une plateforme de cloud computing qui supporte les applications Java depuis peu. Cette entreprise, renommée dans le monde Ruby, propose désormais une offre de PaaS (Plateform as a Service) capable d'exécuter nativement des applications Play!►.
L'inscription à ce service est gratuite. Par défaut, il propose une infrastructure suffisante pour une application à faible affluence. Pour des besoins plus conséquents, on peut passer sur une formule payante "scalable", fournissant une montée à charge automatique en fonction de la demande (en fonction du nombre d'utilisateurs, du nombre de requêtes par secondes etc.).
 
== Installation de l'environnement ==

On commence par créer un compte sur le site d'Heroku.

	http://www.heroku.com/signup

On crée une nouvelle application Play :

	play new myHerokuApp
	
On crée maintenant un fichier nommé `Procfile` à la racine de l'application. Ce fichier sera utilisé pour la configuration d'Heroku.

On entre ce contenu dans le fichier :

	web: play run --http.port=$PORT $PLAY_OPTS
	
Heroku s'appuie sur Git pour le déploiement de l'application dans le Cloud. On crée donc un nouveau dépôt git :

	git init
	git add .
	git commit -m 'nouveau depot'
	
Au passage on a donc un dépôt git gratuit pour versionner notre code. Plutôt sympa!
	
Pour les étapes suivantes nous aurons besoin d'installer les outils Heroku sur notre machine.
Pour cela nous avons besoin du gestionnaire de paquets `gem` fourni avec l'environnement Ruby.
Si vous utilisez un Mac, ces outils sont installés par défaut. Dans le cas contraire, suivez [ce lien](http://docs.rubygems.org/read/chapter/3) 

Cette commande installera Heroku sur votre ordinateur : 

	gem heroku
	
Celle ci va mettre en place l'infrastructure nécessaire pour faire tourner une application web :
 
	heroku create --stack cedar
	
On peut ensuite déployer notre application :
	
	git push heroku master
	
C'est tout? Et oui Heroku est vraiment extrêmement simple à configurer. 
Dans la console vous devriez voir cette réponse apparaître :

	iMac-de-Loic-Descotte:heroku Loic$ git push heroku master
	Counting objects: 30, done.
	Delta compression using up to 2 threads.
	Compressing objects: 100% (22/22), done.
	Writing objects: 100% (30/30), 35.95 KiB, done.
	Total 30 (delta 1), reused 0 (delta 0)

	-----> Heroku receiving push
	-----> Play! app detected
	-----> Installing Play!..... done
	-----> Building Play! application...
	       ~        _            _ 
	       ~  _ __ | | __ _ _  _| |
	       ~ | '_ \| |/ _' | || |_|
	       ~ |  __/|_|\____|\__ (_)
	       ~ |_|            |__/   
	       ~
	       ~ play! 1.2.3, http://www.playframework.org
	       ~
	       1.2.3
	       Play! application root found at ./
	       Resolving dependencies: .play/play dependencies ./ --forceCopy --sync --silent -Duser.home=/tmp/build_29cbfyfiq22co 2>&1
	       ~ Resolving dependencies using /tmp/build_29cbfyfiq22co/conf/dependencies.yml,
	       ~
	       ~
	       ~ No dependencies to install
	       ~
	       ~ Done!
	       ~
	       Precompiling: .play/play precompile ./ --silent 2>&1
	       Listening for transport dt_socket at address: 8000
	       12:32:24,198 INFO  ~ Starting /tmp/build_29cbfyfiq22co
	       12:32:24,948 INFO  ~ Precompiling ...
	       12:32:28,939 INFO  ~ Done.

	-----> Discovering process types
	       Procfile declares types -> web
	-----> Compiled slug size is 26.2MB
	-----> Launching... done, v5
	       http://vivid-water-232.herokuapp.com deployed to Heroku

En copiant la dernière ligne, vous obtenez l'URL de production de votre application. 
Vous voilà avec votre première application déployée dans le Cloud!

	
== Mise à jour de l'application == 

Pour mettre à jour son appli, rien de plus simple. 
Une fois les modifications effectuées, on fait un `commit` avec git suivi de la commande `git push heroku master`

== Configuration d'une base de données ==

Heroku propose par défaut sur les comptes gratuits une base de données PostGreSQL partagée avec une capacité de 5 Mo. Pour activer cette base tapez cette commande dans votre terminal :

	heroku addons:add shared-database

Dans le fichier application.conf, on peut demander l'utilisation de cette base de données :

	db=${DATABASE_URL}

Heroku remplacera cette valeur au démarrage de l'application par la base de données que vous aurez choisi.

En mode développement, quand vous lancez votre application en local vous pouvez surcharger cette définition en lançant l'application de cette manière :

	play run -Ddb=mem

== Logs ==

Si on rencontre une erreur lors de l'exécution de l'application, Heroku affichera un numero d'erreur que l'on peut retrouver dans les logs. 
Pour voir les derniers logs on tape cette commande dans notre terminal :

	heroku logs
	
Si tout se passe bien et que vous n'avez aucune erreur, vous verrez par exemple les logs de démarrage de votre application :

	2011-09-08T19:17:21+00:00 heroku[api]: Deploy 5d4e88b by xxx
	2011-09-08T19:17:21+00:00 heroku[api]: Release v23 created by xxx
	2011-09-08T19:17:21+00:00 heroku[web.1]: State changed from up to bouncing
	2011-09-08T19:17:21+00:00 heroku[web.1]: State changed from bouncing to created
	2011-09-08T19:17:21+00:00 heroku[web.1]: State changed from created to starting
	2011-09-08T19:17:21+00:00 heroku[slugc]: Slug compilation finished
	2011-09-08T19:17:41+00:00 heroku[web.1]: Starting process with command `play run --http.port=51522 --%prod -Dprecompiled=true`
	2011-09-08T19:17:42+00:00 app[web.1]: 19:17:42,424 INFO  ~ Starting /app
	2011-09-08T19:17:42+00:00 app[web.1]: 19:17:42,513 INFO  ~ Application is precompiled
	2011-09-08T19:17:43+00:00 app[web.1]: 19:17:43,406 INFO  ~ Connected to jdbc:postgresql://ec2-107-20-254-136.compute-1.amazonaws.com/egfkyydtmm
	2011-09-08T19:17:44+00:00 app[web.1]: 19:17:44,321 WARN  ~ Defaults messsages file missing
	2011-09-08T19:17:44+00:00 app[web.1]: 19:17:44,332 INFO  ~ Application 'heroku' is now started !
	2011-09-08T19:17:44+00:00 app[web.1]: 19:17:44,399 INFO  ~ Listening for HTTP on port 51522 ...
	2011-09-08T19:17:44+00:00 heroku[web.1]: State changed from starting to up
	
== Redis == 

Redis est une base de données NoSQL et un cache clé/valeur. 
Bonne nouvelle, Heroku propose l'utilisation de Redis dans son catalogue de services. 
Il existe [un module Play](https://github.com/tkral/play-redis) pour faire fonctionner Play Framework avec Redis. Ce module permet d'utiliser Redis pour la persistance ou comme implémentation de cache par défaut.