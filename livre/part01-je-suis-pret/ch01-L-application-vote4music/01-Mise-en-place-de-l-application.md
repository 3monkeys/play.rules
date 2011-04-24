Nous allons développer une application qui sera notre fil conducteur tout au long de cette partie.
Cette application permettra de parcourir une liste de CD, d'en ajouter de nouveaux et de voter pour vos albums préférés. 

Le code complet de l'application est disponible [ici](https://github.com/loicdescotte/vote4music)

## Le modèle de données

### La classe Album
La classe Album contient les informations suivante :
- Nom de l'album (obligatoire)
- Référence à l'artiste (obligatoire)
- Année de sortie (obligatoire)
- Le genre (ou style de musique)
- Le nombre de votes que cet album a reçu

	@Entity
	public class Album extends Model {
	@Required
	public String name;
	@Required
	@ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	public Artist artist;
	@Required 
	public Date releaseDate;
	@Enumerated(EnumType.STRING)
	public Genre genre;
	//...
	}

Nous verrons le code métier de cette classe dans la suite du chapitre.

### La classe Artist
La classe Artist est définie comme ceci :
	
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

	<label for="genre">Genre:</label>
	<select id ="genre" name="genre">
	    #{list models.Genre.values(), as:'genre'}
	    <option  value="${genre}">${genre.toString().toLowerCase()}</option>
	    #{/list}
	</select>

On peut également choisir l'année durant laquelle sont sortis les albums. Pour proposer les dates disponibles, on calcule un intervalle de dates allant de l'album le plus récent à l'album le plus ancien.
Si la base est vide on donne des valeurs par défaut :

	public static List<String> getYearsToDisplay() {
        List<String> years = new ArrayList<String>();
        for (int i = Album.getFirstAlbumYear(); i <= Album.getLastAlbumYear(); i++) {
            years.add(String.valueOf(i));
        }
        Collections.reverse(years);
        return years;
    }

La classe Album implémente les méthodes getFirstAlbumYear et getLastAlbumYear, qui récupèrent ces valeurs dans la base de données :

	public static int getFirstAlbumYear() {
        // get a single result via play-jpa gives the wrong result
        Date result = (Date) em().createQuery("select min(a.releaseDate) from Album a").getSingleResult();
        if (result != null)
            return Integer.parseInt(formatYear.format(result));
        //if no album is registered return 1990
        return 1990;
    }

    public static int getLastAlbumYear() {
        Date result = (Date) em().createQuery("select max(a.releaseDate) from Album a").getSingleResult();
        if (result != null)
            return Integer.parseInt(formatYear.format(result));
        //if no album is registered return current year
        return Integer.parseInt(formatYear.format(new Date()));
    }
    

## Le formulaire d'ajout

On utilise le verbe HTTP GET pour obtenir le formulaire :

    public static void form() {
        render();
    }

 On utilise ensuite POST pour envoyer les données au contrôleur (voir le fichier de routes plus haut) Voici le code du formulaire :
	
	#{extends 'main.html' /}
	#{set title:'Album form' /}

	<h1>Please write information about your favorite album</h1>

	#{form @Application.save(), id:'form', method:'POST', enctype:'multipart/form-data'}
	<input type="hidden" name="album.id" value="${album?.id}"/>

	<p class="field">
	    <label for="name">Album Name:</label>
	    <input type="text" name="album.name" id="name" value="${album?.name}"/>
	    <span class="error">${errors.forKey('album.name')}</span>
	</p>
	<p class="field">
	    <label for="artist">Artist:</label>
	    <input type="text" name="artist.name" id="artist" value="${album?.artist?.name}"/>
	    <span class="error">${errors.forKey('artist.name')}</span>
	</p>
	<p class="field">
	    <label for="genre">Genre:</label>
	    <select id="genre" name="album.genre">
	        #{list models.Genres.values(), as:'genre'}
	        #{if album?.genre == genre}
	        <option value="${genre}" selected="selected">${genre.toString().toLowerCase()}</option>
	        #{/if}
	        #{else}
	        <option value="${genre}">${genre.toString().toLowerCase()}</option>
	        #{/else}
	        #{/list}
	    </select>
	</p>
	<p class="field">
	    <label for="release-date">Release date</label>
	    <input type="text" name="album.releaseDate" id="release-date" value="${album?.releaseDate?.format('yyyy-MM-dd')}"/>
	    <span class="error">${errors.forKey('album.releaseDate')}</span>
	</p>
	<p class="field">
	    <label for="cover">Cover</label>
	    <input type="file" id="cover" name="cover" accept="gif,jpg,jpeg,png,bmp"/>
	    #{if album?.hasCover}
	    <br/>
	    <img src="@{'/public/shared/covers'}/${album?.id}" alt="no cover" widht="50px" height="50px"/>
	    #{/if}
	</p>


	<p class="buttons">
	    <a href="/albums" class="button">Cancel</a>
	    <span>or</span>
	    <input type="submit" class="button" value="Save this album"  id="saveAlbum"/>
	</p>

	#{/form}
	
Ce formulaire nous permettra aussi bien de créer des utilisateurs que de les mettre à jour. C'est pour cette raison que nous utilisons une syntaxe comme `album?.name` pour la valeur des champs : si l'album existe déjà on affiche son nom. Sinon, on n'affiche rien. On retrouve également la sélection des genres à partir de l'Enum, comme sur la page d'accueil.

Pour permettre à l'utilisateur de sélectionner une date à l'aide d'un widget, on ajoute ce code JavaScript à notre template :
	
	#{set 'moreScripts'}
	<script src="@{'public/javascripts/jquery.validate.js'}"></script>
	<script>
	    $(document).ready(function() {
	        $("#form").validate();
	    });
	    $(function() {
	        // those stuff needs to be wrapped in a dom-ready callback. (same as $(document).ready)
	        $("#release-date").datepicker({dateFormat:'yy-mm-dd', showAnim:'fadeIn'});
	    });
	</script>
	#{/set}

Enfin, définissons la méthode du contrôleur qui va nous permettre d'enregistrer un album dans la base : 

	public static void save(@Valid Album album, @Valid Artist artist, File cover) {
        if (Validation.hasErrors()) {
            render("@form", album);
        }
        // set the album
        album.artist = artist;
        //look for duplicates
        album.replaceDuplicateArtist();
        album.save();

        //return to album list
        list();
    }

La première ligne de cette méthode vérifie que les valeurs envoyées au contrôleur sont conformes au modèle défini dans les classes Album et Artist (par exemple le nom obligatoire pour l'album).
Dans le cas contraire, on retourne au formulaire, qui affichera les erreurs grâce aux balises d'erreur que l'on écrit, comme 	

	<span class="error">${errors.forKey('album.name')}</span>
	
La méthode replaceDuplicateArtist de la classe Album permet d'éviter les doublons de nom d'artistes dans la base de données :

	public void replaceDuplicateArtist() {
        Artist existingArtist = Artist.findByName(artist.name);
        if (existingArtist!=null) {
            artist = existingArtist;
        }
    }

A la fin de l'action _save_, on retourne à la liste d'albums pour voir apparaître le nouvel élément enregistré. 

## Lister et rechercher des albums

On utilise jQuery et le plugin datatables pour améliorer le rendu du tableau des résultats. Ce plugin permet d'afficher des liens pour trier le tableau, et ajoute la pagination des données.
Ce plugin est très simple à utiliser, il suffit d'écrire ces quelques lignes pour l'activer : 

	$(document).ready(function(){
		$('#albumList').dataTable();
      });

Ceci suffit à ajouter des fonctions de pagination et de tri à un simple tableau HTML. Notre tableau est défini comme ceci :  

	<table id="albumList">
	    <thead>
	        <tr>
	            <th>Artist</th>
	            <th>Album</th>
	            <th>Release date</th>
	            <th>Genre</th>
	            <th>Number of votes</th>
	        </tr>
	    </thead>
	    #{list _albums, as:'album'}
	    <tr id="album-${album.id}">
	        <td>${album.artist.name}</td>
	        <td>${album.name}</td>
	        <td>${album.releaseDate.format('yyyy-MM-dd')}</td>
	        <td>${album.genre.toString()}</td>
	    </tr>
	    #{/list}    
	</table>

Nous plaçons ce code dans un fichier _tag_ séparément du reste de notre page, afin de pouvoir de réutiliser dans d'autres contextes : 

Pour intégrer ce tag Play à notre page, on écrit la directive suivante :

	#{albumtable albums:albums/}

Par défaut, on affiche les 100 derniers résultats trouvés dans la base de données : 
	
	public static void list() {
        List<Album> albums = Album.all().fetch(100);
        render(albums);
    }
 
	
Au dessus de notre tableau, nous définissons un champ de recherche qui permettra d'envoyer des filtres au serveur :
	
	#{form @list()}
	<input type="text" id="filter" name="filter"/>
	<input type="submit" value="Filter" class="button" id="submitFilter">
	#{/form}

La variable _filter_ est récupérée dans le contrôleur. Elle permet de trouver des noms d'albums ou d'artistes correspondant à la saisie de l'utilisateur.
Comme dans le cas précédent, on ne ramène que 100 résultats à la fois côté client. Si l'utilisateur a besoin de parcourir plus de résultats pour trouver ce qu'il cherche, on l'incite à utiliser le formulaire de recherche pour affiner les résultats.
Cette solution est plus simple pour nous du point de vue du code, par rapport à l'option qui consisterait à rappeler le serveur lors des clics sur les liens de pagination pour aller au delà de 100 résultats.

Le contrôleur intercepte l'appel de cette manière: 

	public static void list(String filter) {
        List<Album> albums = Album.findAll(filter);
        render(albums);
    }

La classe Album définie la méthode de recherche par filtre :

	public static List<Album> findAll(String filter) {
        List<Album> albums;
        if (filter != null) {
            String likeFilter = "%" + filter + "%";
            //limit to 100 results
            albums = find("select a from Album a where a.name like ? or a.artist.name like ?", likeFilter, likeFilter).fetch(100);
        } else albums = Album.find("from Album").fetch(100);
        return sortByPopularity(albums);
    }


## Le top 10

La librairie lambdaj nous aide à filtrer l'ensemble des albums récupérés pour une année donnée :

    TODO ...

Grace à cette librairie, nous pouvons écrire notre filtre comme dans un langage fonctionnel, en évitant de créer des boucles pour parcourir la collection d'albums dans le but de la trier.
Pour que Play puisse bénéficier de lambdaj, on ajoute cette ligne à la section _require_ du fichier dependencies.yml :
    - com.googlecode.lambdaj -> lambdaj 2.2

    TODO ...

## La fonction de votes


## Gestion des pochettes d'albums

	TODO ...
