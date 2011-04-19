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

    TODO  ...

On peut également choisir l'année durant laquelle sont sortis les albums. Pour proposer les dates disponibles, on calcule un intervalle de dates ...
    TODO

## Le formulaire d'ajout

On utilise GET pour obtenir le formualire, POST pour envoyer les données au controlleur (voir le fichier de routes plus haut).

    TODO ...

## Lister et rechercher des albums

On utilise jQuery et le plugin datatables pour améliorer le rendu du tableau des résultats. Ce plugin permet d'afficher des liens pour trier le tableau, et ajoute la pagination des données.
Le tableau contient un formulaire de recherche :

La variable search est récupérée dans le controlleur. Elle permet de trouver des noms d'albums ou d'artistes correspondant à la saisie de l'utilisateur.
On ne rammène que 100 résultats à la fois côté client. Si l'utilisateur a besoin de parcourir plus de résultats pour trouver ce qu'il cherche, on l'incite à utiliser le formulaire de recherche pour affiner les résultats.s
Cette solution est plus simple pour nous du point de vue du code, par rapport à l'option qui consisterait à rappeler le serveur lors des clics sur les liens de pagination pour aller au delà de 100 résultats.
    TODO ...

## Le top 10

La librairie lambdaj nous aide à filtrer l'ensemble des alubms récupérés pour une année donnée :

    TODO ...

Grace à cette librairie, nous pouvons écrire notre filtre comme dans un langage fonctionnel, en evitant de créer des boucles pour parcourir la collection d'albums dans le but de la trier.
Pour que Play puisse bénéficier de lambdaj, on ajoute cette ligne à la section _require_ du fichier dependencies.yml :
    - com.googlecode.lambdaj -> lambdaj 2.2

    TODO ...


