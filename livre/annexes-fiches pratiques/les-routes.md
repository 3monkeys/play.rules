## Les routes

Par défaut, les points d'entrée de l'application sont définis par leurs URLs dans le fichier `conf/routes` :
Exemple :

	POST    /album                                                  Application.save
	GET     /albums                                                 Application.list

Si vous voulez voir ces points d'entrée directement dans votre code Java, il est également possible de les définir dans les contrôleurs : 