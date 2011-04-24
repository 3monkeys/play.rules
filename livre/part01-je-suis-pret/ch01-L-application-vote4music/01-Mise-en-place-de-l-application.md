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

	private static SimpleDateFormat formatYear = new SimpleDateFormat("yyyy");

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
    
La méthode _em()_ de classe _Model_ de Play permet d'accéder à l'entity manager de JPA (Java Persistence API). Ceci peut être utile dans certains cas, notamment lorsque l'on veut ramener autre chose que des objets du modèle (ici une date).

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

Ce script utilise jQuery, comme tous les exemples de code JavaScript que nous verrons dans ce chapitre.

Enfin, définissons la méthode du contrôleur qui va nous permettre d'enregistrer un album dans la base : 

	public static void save(@Valid Album album, @Valid Artist artist, File cover) {
        if (Validation.hasErrors()) {
            render("@form", album);
        }
        album.artist = artist;
        //recherche des doublons
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
			<td>
	            <span id="nbVotes${album.id}">${album.nbVotes}</span>
	            <a id="${album.id}-clickVote" class="voteLink" href="#">Vote for it!</a>
	        </td>
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

Cette fonction de l'application permet d'afficher 10 les albums ayant reçu le plus de votes, pour une année et un genre donnés :

	public static void listByGenreAndYear(String genre, String year) {
        notFoundIfNull(genre);
        notFoundIfNull(year);
        List<Album> albums = Album.findByGenreAndYear(genre, year);
        render(genre, year, albums);
    }

Les paramètres _genre_ et _year_ sont obligatoires. Cela veut dire que si on appelle ce contrôleur dans ces paramètres, il renverra une erreur 404 (not found).
 
La classe Album définie les méthodes nécessaires à cette recherche :

 public static List<Album> findByGenreAndYear(String genre, String year) {
        
	List<Album> albums;
        Genre genreEnum = Genre.valueOf(genre.toString().toUpperCase());
        albums = Album.find("byGenre", genreEnum).fetch(10);
        //LabmdaJ example
        albums = filterByYear(albums, year);
        return sortByPopularity(albums);
    }

La librairie lambdaj nous aide à filtrer l'ensemble des albums récupérés pour une année donnée. Grâce à elle, nous pouvons écrire nos filtres comme dans un langage fonctionnel, en évitant de créer des boucles pour parcourir la collection d'albums dans le but de la trier. Dans cet exemple, on utilise les fonctions _sort_ et _select_ :


    private static List<Album> sortByPopularity(List<Album> albums) {
        List sortedAlbums = sort(albums, on(Album.class).nbVotes);
        //tri descendant
		Collections.reverse(sortedAlbums);
        return sortedAlbums;
    }

    public static List<Album> filterByYear(List<Album> albums, String year) {
        return select(albums, having(on(Album.class).getReleaseYear(), equalTo(year)));
    }	
	
	
Pour que Play puisse bénéficier de lambdaj, on ajoute cette ligne à la section _require_ du fichier dependencies.yml :
    - com.googlecode.lambdaj -> lambdaj 2.2


## La fonction de votes

Voyons maintenant une fonctionnalité clé de cette application, le vote!

Cette méthode du contrôleur permet d'enregistrer un vote pour un album :

	public static void vote(String id) {
        Album album = Album.findById(Long.parseLong(id));
        album.vote();
        renderText(album.nbVotes);
    }

La classe Album définie cette méthode pour mettre à jour le compteur des votes d'une instance d'album:

	public void vote() {
        nbVotes++;
        save();
    }

Les entités du modèle pouvant auto-gérer leur état dans la base de données, on peut directement appeler la méthode _save_ pour sauvegarder ce nouvel état.

La méthode du contrôleur renvoie directement le nouveau score de l'album au format texte. On récupérera cette réponse dans notre client HTML pour mettre à jour les informations affichées à l'écran. 
Le bouton de vote est accessible dans la liste des albums :

	<td>
        <span id="nbVotes${album.id}">${album.nbVotes}</span>
        <a id="${album.id}-clickVote" class="voteLink" href="#">Vote for it!</a>
    </td>

On créer aussi une _div_ pour afficher un message en cas de succès :

	<div id="voteInfo" class="info">One vote added!</div>

Cette section sera masquée par défaut, à l'aide de CSS : 

.info {
  display: none;
}

Ce code JavaScript permet d'intercepter les clicks et de rafraîchir l'écran :
	
		//On récupère les span dont l'id commence par "nbVotes" pour trouver la zone à mettre à jour
		var nbvotes = $('span[id^="nbVotes"]');
		clickVote = function() {
			//Récupération de l'id de l'album sur lequel on a cliqué
        	var id = t.attr('id').split('-')[0],
			//Zone à zone à mettre à jour pour cet id : les spans commençant par "nbVotes" et finissant par l'id
        	voteTarget = nbvotes.filter("[id$=" + id + "]");
        
        	// un seul vote possible par album : on cache le bouton
	        $(this).hide();
                    
	        $.ajax({
	            url: '/vote',
	            type: "POST",
	            data: {id: id},
	            complete: function(req) {      
	                var newTotal = req.responseText;
					//si la réponse est OK
	                if (req.status === 200) {
						//rafraichissement de l'écran
	                    voteTarget.text(newTotal);
						//Animation pour afficher le message
	                    voteInfo.slideDown("slow").delay(3000).slideUp("slow");
	                }
	            }
	        });
	    };

	$('a.voteLink').click(clickVote);
		
## Gestion des pochettes d'albums
	
On veut maintenant ajouter la possibilité d'attacher l'image d'une pochette aux albums.	
On enrichit la classe Album avec d'un nouveau champ :

	public boolean hasCover = false;

Ce booléen nous permettra de savoir si l'album possède une pochette ou non.
On ajoute une colonne à la liste des albums. Lors de l'affichage, on effectue le test suivant : 

	<td>
        #{if album?.hasCover}
        <span class="cover"><a href="#">Show cover</a></span>
        #{/if}
    </td>

Lors du survol de ce lien, on affiche une miniature de la pochette avec un peu de JavaScript :

	$('.cover').each(function(i, val) {
        var t = $(this); 
		//Récupération de l'id courant
        var album = t.closest('tr').attr("id");
        var id = album.match(/album-(\d)/)[1];
        displayCover(id, t);
    });

	//Affichage de l'image
	displayCover = function(id, albumMarkup){
        var root = '/public/shared/covers';
        var markup = '<img src="' + root + '/' + id + '" width="200" height="200">';
        albumMarkup.bt(markup, {
            width: 200,
            fill: 'white',
            cornerRadius: 20,
            padding: 20,
            strokeWidth: 1,
            trigger: ['mouseover', 'click']
        });
    };
	
Ce code récupère une image dans un répertoire du serveur et effectue son rendu à l'aide du plugin jQuery bt (BeautyTips).

Voyons maintenant comment enregistrer l'image dans ce répertoire lors de la création d'un album.
		
### Upload et sauvegarde d'une image

On ajoute un champ dans le formulaire de création (et d'édition) de l'album :

	<p class="field">
	    <label for="cover">Cover</label>
	    <input type="file" id="cover" name="cover" accept="image/*"/>
	     #{if album?.hasCover}
	     <br/>
	     <img src="@{'/public/shared/covers'}/${album?.id}" alt="no cover" widht="50px" height="50px"/>
	     #{/if}
	</p>

Ce champ permet d'uploader une image. En mode édition, si une image est enregistrée elle sera affichée.

On modifié également la méthode _save_ du contrôleur pour traiter cet upload :

	public static void save(@Valid Album album, @Valid Artist artist, File cover) {
        if (Validation.hasErrors()) {
            render("@form", album);
        }
        album.artist = artist;
        //recherche des doublons
        album.replaceDuplicateArtist();
        album.save();

        //pochette
        if (cover != null) {
            String path = "/public/shared/covers/" + album.id;
            album.hasCover = true;
            File newFile = Play.getFile(path);
            //suppression des anciennes pochettes si elles existent
            if (newFile.exists())
                newFile.delete();
            cover.renameTo(newFile);

            album.save();
        }

        //return to album list
        list();
    }

Comme vous pouvez le voir il suffit d'ajouter un paramètre de type _File_ à la méthode _save_ puis de le traiter avec les méthodes _Play.getFile_ (pour déterminer le chemin de destination du fichier) et _renameTo_.