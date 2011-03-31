# Play et les services REST

Dans cette partie nous allons voir comment exposer simplement du contenu XML (ou JSON, ou autre) avec le framework Play!.
Les URL de Play! étant RESTful par essence, il devient très facile de créer une petite API REST/XML coinjointement à l'interface Web d'une application Play!.
Voyons comment procéder.

## Exposer des données avec un service REST

Gardons l'exemple de notre bibliothèque musicale. Notre modèle comporte des albums, des artistes et des genres.
La classe Album se présente comme ceci :

	@Entity
	public class Album extends Model {
	public String name;
	@ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	public Artist artist;
	public Date releaseDate;
	@Enumerated(EnumType.STRING)
	public Genre genre;

Le genre est une simple Enum, définie comme cela :
	public enum Genre {
		ROCK, METAL, JAZZ, BLUES, POP, WORLD, HIP_HOP, OTHER
	}

Nous voulons définir une URL qui renvoie lors d'un GET la liste des albums au format XML pour un genre donné.
Pour cela nous devons modifier le fichier routes :
	GET /website/albums/{genre}       Application.list
	GET /albums/{genre}   Application.listXml(format:'xml')

La première ligne correspond à la page HTML(non présentée dans cet article) affichant la liste des albums disponibles : le format n'étant pas spécifié, le rendu se fera avec une page HTML.
Ici c'est la deuxième ligne qui nous intéresse. Le paramètre (format:'xml') indique que la méthode render() du contrôleur devra chercher un fichier nommé listXml.xml.
Le paramètre {genre} sera récupéré dans l'URL et passé au contrôleur.

NB :
Il est possible d'utiliser une seule méthode dans le contrôleur si les paramètres requis et les traitements sont identiques pour les 2 types de rendus.
Dans notre cas il se peut qu'on ajoute des paramètres à la version HTML ultérieurement, sans vouloir impacter le rendu XML, par exemple :
	GET /albums/{genre}/{first}/{count} Application.list
J'ai donc opté pour une séparation du rendu dans deux méthodes distinctes.

Le code de la méthode Application.listXml est le suivant :
public static void listXml(String genre) {
		Genre genreEnum = Genre.valueOf(genre.toString().toUpperCase());
		List&lt;Album&gt; albums= Album.find("byGenre",genreEnum).fetch();
		render(albums);
	}

Je recherche simplement les albums correspondant au genre passé en paramètre, et je demande le rendu de la liste. Au passage on voit la simplicité d'utilisation de JPA avec Play!! Le rendu sera fait dans le fichier portant le nom de la méthode et l'extension xml : listXml.xml.
Ce template, placé dans le repertoire app/views, est défini comme ceci :

    <albums>   
    #{list albums, as:'album'}
        <album>
            <artist>${album.artist.name}</artist>
            <name>${album.name}</name>
            <release-date>${album.releaseDate.format('yyyy')}</release-date>
            <genre>${album.genre.toString()}</genre>
        </album>
    #{/list}
    </albums>


Voilà, cela suffit pour exposer nos albums en XML. En respectant le pattern d'URL défini dans le fichier routes, par exemple en appelant http://localhost:9000/albums/rock, on obtient le résultat suivant :

    <albums>
       <album>
          <artist>Nirvana</artist>
          <name>Nevermind</name>
          <release-date>1991</release-date>
          <genre>ROCK</genre>
       </album>
       <album>
          <artist>Muse</artist>
          <name>Origin of Symmetry</name>
          <release-date>2001</release-date>
          <genre>ROCK</genre>
          </album>
       <album>
          <artist>Muse</artist>
          <name>Black Holes and Revelations</name>
          <release-date>2006</release-date>
          <genre>ROCK</genre>
       </album>
    </albums>


## Envoie de données à travers un service REST

Dans la première partie avons vu comment exposer des données au format XML avec Play!.
Maintenant nous allons effectuer l'opération inverse, l'envoi d'un contenu XML au contrôleur Play!, à travers une URL RESTful.

On veut par exemple envoyer le contenu suivant en POST avec un content type application/xml :

    <album>
          <artist>Metallica</artist>
          <name>Death Magnetic</name>
          <release-date>2008</release-date>
          <genre>METAL</genre>
    </album>


Pour cela on ajoute la ligne suivante au fichier routes pour autoriser l'opération POST sur l'url /album :

	POST /album  Application.saveXml

La méthode saveXml récupère le contenu de la requete dans la variable request.body .
Elle parse ensuite le contenu pour créer un album et l'enregistrer dans la base :

	public static void saveXML(){
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			Document document = null;
			try{
			//création du document XML à partir de la requête
	  DocumentBuilder builder = factory.newDocumentBuilder();
			document = builder.parse(request.body);
			}
			catch(Exception e){
			}
			//parsing du contenu XML
	  Element albumNode = document.getDocumentElement();
			//récupération de l'artiste
			NodeList artistNode = albumNode.getElementsByTagName("artist");
			//il n'existe qu'un noeud "artiste" dans un album, on prend donc l'item 0
	  String artistName = artistNode.item(0).getTextContent();
			Artist artist = new Artist(artistName);
	
			//récupération du nom
			NodeList nameNode = albumNode.getElementsByTagName("name");
			String name = nameNode.item(0).getTextContent();
			Album album = new Album(name);
	
			//récupération de la date
			NodeList dateNode = albumNode.getElementsByTagName("release-date");
			String date = dateNode.item(0).getTextContent();
			DateFormat dateFormat = new SimpleDateFormat("yyyy");
			try{
				album.releaseDate=dateFormat.parse(date);
			}
			catch(ParseException e){
			}
	
			//récupération du genre
			NodeList genreNode = albumNode.getElementsByTagName("genre");
			String genre= genreNode.item(0).getTextContent();
			Genre genreEnum = Genre.valueOf(genre.toString().toUpperCase());
			album.genre=genreEnum;
	
			//sauvegarde en base
			album.artist=artist;
			album.save();
		} 

NB: il est bien sûr possible d'obtenir un code moins verbeux en dé-sérialisant l'objet à l'aide d'un outil comme JAXB ou XStream, mais ce n'est pas l'objet de ce chapitre.

Lorsqu'on écrit le code album.artist=artist, la méthode setArtist(Artist artist) est appelée automatiquement par Play! (le code est modifié au runtime). On peut ainsi vérifier le fait que l'artiste existe ou non dans la base, pour savoir si on doit créer une nouvelle instance d'artiste ou récupérer l'artiste existant.
La méthode save() de la classe Album s'occupe alors d'enregistrer l'album en base, ainsi que l'artiste si il est inconnu dans la bibliothèque(à l'aide d'un cascade JPA).

	public void setArtist(Artist artist){
			List&lt;artist&gt; existingArtists = Artist.find("byName", artist.name).fetch();
			if(existingArtists.size()&gt;0){
				//Le nom d'artiste est unique
				this.artist=existingArtists.get(0);
			}
			else{
				this.artist=artist;
			}
		}

Notre API REST/XML nous permet donc maintenant de lire la liste des albums de note bibiothèque musicale et d'ajouter des albums.
Vous pouvez tester l'envoi de contenu XML avec le plugin Poster de Firefox ou avec l'application rest-client.
