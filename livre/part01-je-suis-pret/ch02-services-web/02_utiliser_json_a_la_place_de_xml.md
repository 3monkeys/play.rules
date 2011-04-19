# Utiliser JSON à la place de XML 

Dans le chapitre précédent nous avons vu comment créer des services REST envoyant et consommant des messages au format XML.
Voyons maintenant comment faire la même chose avec JSON.

## Exporter ses objets en JSON

### Le format JSON

Définition de wikipedia : 

	JSON (JavaScript Object Notation) est un format de données textuel, générique, dérivé de la notation des objets du langage ECMAScript. Il permet de représenter de l’information structurée.
	
L'avantage de JSON par rapport à XML être d'être un peu moins verbeux et directement interprétable dans un navigateur à l'aide de JavaScript.

Si on écrit cette ligne dans le fichier routes :

	GET /api/albums.json            Application.listAlbumsInJson  

Et cette méthode dans le contrôleur :

	public static void listAlbumsInJson(){  
			List<Album> albums = Album.findAll();  
			renderJSON(albums);  
	}  

L'appel de l'URL http://monappli/albums.json renverra directement notre liste d'objets albums au format JSON. Difficile de faire plus simple!

Autre astuce (que j'ai découvert grâce site zengularity.com) : pour déterminer directement le format de données à partir de l'URL, il est possible d'utiliser cette syntaxe dans le fichier routes :

	GET /api/albums.{<json|xml>format} Application.listAlbums  

En appelant /albums.xml , Play appelera la méthode listAlbums() avec le paramètre 'format' initialisé à 'xml', et en appelant /albums.json ce même paramètre aura la valeur 'json'. 

On peut ensuite s'en servir dans le contrôleur : 

	public static void listAlbums() {  
		List<Album> albums = Album.all().fetch();  
		if(request.format.equals("json"))  
		renderJSON(albums);  
		render(albums);  
	}  

Si vous tapez l'URL /albums.xml, Play cherchera un fichier de template XML nommé listAlbums.xml (une autre extension fonctionnerait aussi) pour effectuer le rendu.

## Recevoir un message JSON
