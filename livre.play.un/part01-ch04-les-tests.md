#Tester notre application

Play intègre un framework de tests permettant de lancer différents types de tests.
	
##Tests unitaires

Les tests unitaires testent une partie précise du code de notre application.
Voici un exemple de test unitaire :

~~~ java 
	public class CoreTest extends UnitTest {

	    @Test
	    public void filterByYearTest() {
	        //Création de 2 albums
	        List<Album> albums = new ArrayList<Album>();
	        Album album1 = new Album("album1");
	        Calendar c1 = Calendar.getInstance();
	        c1.set(2010, 1, 1);
	        album1.releaseDate= c1.getTime();
	        albums.add(album1);
	        Album album2 = new Album("album1");
	        Calendar c2 = Calendar.getInstance();
	        c2.set(2009, 1, 1);
	        album2.releaseDate= c2.getTime();
	        albums.add(album2);

	        //Test de la méthodefilter by year
	        albums = Album.filterByYear(albums, "2010");

	        //Un seul album a la date 2010
	        assertTrue(albums.size()==1);
	    }
	}
~~~  

Cette classe hérite de la classe UnitTest fournie par Play!►. La méthode `filterByYearTest` permet de tester la méthode `filterByYear` de la classe Album.

## Tests fonctionnels
	
Les tests fonctionnels permettent de tester l'application à partir de son contrôleur en se basant sur le fichier `routes` pour résoudre les URL d'appel.
Ce test permet par exemple d'utiliser un service REST et valider la réponse obtenue : 

~~~ java
	public class ApplicationTest extends FunctionalTest {

	    @Before
	    public void setUp() {
	        Fixtures.deleteAll();
	    }

	    @Test
	    public void testYML() {
	    Response response = GET("/api/albums.xml");
	    assertIsOk(response);

	    //On récupère la réponse
	    String xmlTree = response.out.toString();
	    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
	    Document document = null;
	    try {
	        DocumentBuilder builder = factory.newDocumentBuilder();
	        document = builder.parse(new ByteArrayInputStream(xmlTree.getBytes()));
	    } catch (Exception e) {
	        Logger.error(e.getMessage());
	    }
	    Element rootNode = document.getDocumentElement();

	    //On vérifie qu'on a le bon nombre d'éléments dans le fichier XML
	    assertTrue(rootNode.getElementsByTagName("album").getLength() == 2);
	}
~~~

La méthode setUp permet de réinitaliser les données avant chaque méthode de test.

Avec les méthodes GET et POST, on peut facilement tester le comportement de nos pages web.
On peut également vérifier le bon fonctionnement de nos services REST : 

~~~ java
	@Test
    public void testJsonApi() {
        //preconditions
		Response artists = GET("/api/artists.json");
        assertFalse(artists.out.toString().contains("john"));

		Response albums = GET("/api/albums.json");
        assertFalse(albums.out.toString().contains("album1"));

		//insertion de données au format JSON
		String album1 = "{ \"name\":\"album1\", \"artist\":{ \"name\":\"john\" }, \"releaseDate\":\"12 sept. 2010 00:00:00\", \"genre\":\"ROCK\" }";
        POST("/api/album", "application/json", album1);

		//vérification des données
        artists = GET("/api/artists.json");
        assertTrue(artists.out.toString().contains("john"));

		albums = GET("/api/albums.json");
        assertTrue(albums.out.toString().contains("album1"));
    }

	@Test
    public void testXmlApi() {
		//preconditions
        Response artists = GET("/api/artists.xml");
        assertFalse(artists.out.toString().contains("john"));

		Response albums = GET("/api/albums.xml");
        assertFalse(albums.out.toString().contains("album1"));

		//insertion de données au format XML
		String album1 = "<album><artist><name>john</name></artist><name>album1</name><release-date>2010</release-date><genre>ROCK</genre><nvVotes>0</nvVotes></album>";
        POST("/api/album", "application/xml", album1);
        
		//vérification des données
		artists = GET("/api/artists.xml");
        assertTrue(artists.out.toString().contains("john"));

		albums = GET("/api/albums.xml");
        assertTrue(albums.out.toString().contains("album1"));
    }
~~~

## Tests Selenium

Ces tests permettent de simuler des clicks dans l'application à l'aide de l'outil Selenium.
Ce code permet de déclencher la création d'un album, puis de vérifier sa présence dans la liste des albums :

	#{fixture delete:'all', load:'data.yml' /}
	#{selenium}
	// Ouverture de la page d'accueil
	open('/')
	waitForPageToLoad(3000)
	assertNotTitle('Application error')
	
	// Ouverture de la liste des albums
	open('/albums')
	waitForPageToLoad(3000)
	assertTextPresent('coolAlbum')
	
	//Création d'un album
	click('link=New album')
	waitForPageToLoad('3000')
	type('name', 'black album')
	type('artist', 'metallica')
	click('release-date')
	type('release-date', '1990-01-01')
	click('saveAlbum')
	waitForPageToLoad('3000')
	assertTextPresent('metallica')
	
	#{/selenium}

La directive `fixture delete:'all', load:'data.yml'` vide la base de données puis charge le fichier `data.yml`. Ce fichier se présente comme ceci :

	Artist(joe) :
	name: joe

	Album(coolAlbum) :
	name: coolAlbum
	artist: joe
	releaseDate: 2010-11-12 00:00:00
	genre: ROCK
	
## Lancer les tests
	
Pour lancer les tests, entrez la commande suivante dans votre terminal : `play test`
Puis tapez l'URL `http://localhost/@tests` dans votre navigateur.

Vous verrez apparaître cette page : 

![Tests](http://www.playframework.org/documentation/1.0/images/test-runner)

A partir de cet écran, vous pouvez lancer les tests et obtenir un rapport d'erreur (si il y en a)! 
Plutôt pratique non?

**Remarque** : Si vous désirez connaître la couverture de tests de votre application, il existe un module Play!► pour ça!
Le module [Cobertura](http://www.playframework.org/modules/cobertura) est capable de générer un rapport de couverture en analysant votre code. Quand le module est actif, il génère automatiquement ce rapport dans le répertoire `test-result` de l'application.

Pour installer ce module, ajoutez cette ligne au fichier `dependencies.yml` :

    require:
        - play -> cobertura 2.1
