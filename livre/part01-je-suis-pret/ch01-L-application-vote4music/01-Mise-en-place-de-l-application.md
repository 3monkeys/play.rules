Nous allons développer une application qui sera notre fil conducteur tout au long de cette partie.
Cette application permettra de parcourir une liste de CD, d'en ajouter de nouveaux et de voter pour vos albums préférés. 

Le code complet de l'application est disponible [ici](https://github.com/loicdescotte/vote4music)
## Le modèle de données

### La classe Album
La classe Album contient les informations suivante :
- Nom de l'album
- Référence à l'artiste
- Année de sortie
- Le genre (ou style de musique)
- Nombre de votes

	@Entity
	public class Album extends Model {
	public String name;
	@ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	public Artist artist;
	public Date releaseDate;
	@Enumerated(EnumType.STRING)
	public Genre genre;
	//...
	}

Nous verrons le code métier de cette classe plus tard.

### La classe Artist
	public class Artist extends Model{
		@Required
		@Column(unique = true)
		public String name;	
		//...
	}

### L'enum Genre

Le genre est une simple Enum, définie comme cela :
	public enum Genre {
		ROCK, METAL, JAZZ, BLUES, POP, WORLD, HIP_HOP, OTHER
	}

Vous pouvez bien sur ajouter autant que genres que vous voulez.

## Définition des routes
Les routes que nous allons définir permettront : 
- De consulter les albums, triés par popularité
- De rechercher des albums
- De consulter le top 10 par genre
- D'ajouter de nouvelles entrées dans la bibliothèque d'albums

	# User pages
	GET     /                                                       Application.index
	POST    /album                                                  Application.save
	GET     /albums                                                 Application.list
	GET     /topalbums                                              Application.listByGenreAndYear
	GET     /album/new                                              Application.form
	GET     /album/{id}                                             Admin.form
	POST	/api/album                                              Application.saveAlbumJson
	
	#Vote
	POST	/vote                                                   Application.vote

	# Map static resources from the /app/public folder to the /public path
	GET     /public/                                                staticDir:public

	# Catch all
	*       /{controller}/{action}                                  {controller}.{action}

La route "catch all" permet de résoudre automatiquement une URL à partir du nom du controlleur et d'une méthode.


## La page d'accueil

La page d'accueil permet d'accéder aux principales fonctionnalités de l'application :

- Le formulaire de création d'albums
- La liste des albums
- Le top 10 par genre
- Les fonctions d'administration (que nous verrons au chapitre 3)

Pour le top 10, vous pouvez choisir un style de musique. Pour cela, le template Play utilise l'enum Genre :

    TODO

## Le formulaire d'ajout

## Lister et rechercher des albums

## Le top 10
