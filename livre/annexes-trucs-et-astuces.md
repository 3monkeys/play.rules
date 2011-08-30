# Annexes

## L'internationalisation

Dans le cas d'une application ou d'un site multilingue, on doit être capable de traduire facilement le contenu de nos pages.
Pour le message d'accueil de notre application, on peut par exemple écrire :

	<h1>&{welcome}</h1>

Les paramètres entourés de `&{}` seront traduits à partir des clés définies dans les fichiers de configuration de Play!►.
Les clés pour la langue par défaut se trouvent dans le fichier `/conf/messages` :

	welcome=Welcome on Vote4Music!
	
On peut ensuite définir un fichier par lange supplémentaire, par exemple `messages_fr` pour le français.

Ce mécanisme peut être utilisé pour traduire toutes sorte de clés. On peut par exemple afficher les valeurs de l'énum Genre dans notre application en modifiant la casse :
	
	<h1>Top albums in &{genre} for ${year}</h1>

On renseigne ces clés dans le fichier `messages` :

	ROCK=Rock
	METAL=Metal
	HIP_HOP=Hip Hop
	WORLD=World
	POP=pop
	JAZZ=Jazz
	BLUES=Blues
	OTHER=Other	
	
	//TODO more tips to come