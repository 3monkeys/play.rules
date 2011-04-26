# Play dans la vraie vie

## Authentification et sécurité

Maintenant que nous savons comment développer une application Web avec Play, voyons comment gérer la sécurité et l'authentification à l'aide du module Secure.
Nous allons étudier le cas suivant : notre application est publique, on peut y naviguer sans être authentifié. Mais elle possède également des fonctions d’administrations, affichées lorsque l’on s’identifie comme admin. Pour accéder à ces fonctions, il existe une URL qui permet d’accéder à un formulaire d'authentification. 

Play permet d’écrire les informations de session utilisateur dans un cookie. Ce cookie est signé, il n’est donc pas modifiable côté client, par contre il n’est pas crypté, il ne faut donc pas écrire d’informations sensible à l’intérieur (pas de mot de passe par exemple). Dans notre exemple, on souhaite utiliser le cookie de session pour stocker le fait que l’utilisateur soit identifié comme un administrateur ou non.

Une des choses que l’on souhaite ajouter à l’application web si l’utilisateur est admin est un lien “Supprimer” dans le tableau html qui liste nos entités métiers (on liste des albums de musique pour reprendre les exemples précédents). On peut donc utiliser le code suivant:

	#{if session.get("username").equals("admin")}    
	<a href="@{Application.delete(album.id)}">Supprimer</a>  
	#{/if}  

Mais on se retrouve vite confronté à un problème, un clic sur ce lien mène à une URL comme celle ci :

	/admin/delete?id=11

Même si le lien est masqué, n’importe qui peut entrer cette URL dans son browser pour supprimer l’entité de son choix. Nous devons donc aussi protéger la méthode delete côté serveur.
Le module Secure de Play va nous permettre de faire ça de manière élégante. Il propose également un formulaire de login prêt à l’emploi qui permet de mettre les informations dont on a besoin dans le cookie de session.


### Mise en oeuvre du module Secure

Pour activer le module secure, on commence par modifier le fichier dependencies.yml pour y ajouter la ligne suivante dans la section `require` :

        - play -> secure

Dans le fichier application.conf, ajouter la ligne suivante pour configurer les routes :

	# Import Secure routes
	* / module:secure
	Toujours dans ce fichier, on ajout les identifiants d’admin :
	# Admin tokens
	application.admin=admin
	application.adminpwd=admin

On déclare ensuite un contrôleur d’administration pour toutes les actions que l’on veut restreindre. On ajoute l’annotation @With à ce contrôleur pour lui dire qu’il doit s’appuyer sur le contrôleur du module Secure :

	@With(Secure.class)  
	public class Admin extends Controller {  
	....  
	}  

On ajoute ensuite un contrôle sur l'action delete en utilisant l'annotation @Check :

	Check("admin")  
	public static void delete(Long id) {  
	...  
	}  

On redefinie également la méthode check en créant une nouvelle classe dans le package contrôler, héritant de la classe Secure.Security :

	static boolean check(String profile) {  
		 if(profile.equals("admin"))  
		   return session.get("username").equals("admin");  
		 return false;  
		}  

Ce code permet de demander au module Secure de vérifier que l’utilisateur en session est bien “admin” lorsque l’annotation @check(“admin”) est trouvée. 

Dans la même classe, on redéfinie la méthode authentify. C'est sur cette méthode que le formulaire d’authentification du module Secure s'appuie pour laisser passer ou non l'utilisateur :

	static boolean authentify(String username, String password) {  
	return Play.configuration.getProperty("application.admin").equals(username)&& Play.configuration.getProperty("application.adminpwd").equals(password);  
	}  


Avec cette configuration, si on essaie d’entrer l’URL /admin/delete?id=11, on arrivera directement sur le formulaire d’authentification pour prouver que l’on est bien administrateur.
Et bien sur si le mot de passe et l’utilisateur entrés ne sont pas les bons, on ne passe pas.

On aimerait maintenant pouvoir aller directement sur ce formulaire pour mettre en session utilisateur les informations concernant notre identité.

Il suffit d’ajouter le code suivant dans le contrôleur Admin pour exposer le formulaire de login à l’URL /admin/login :

	public static void login() {  
	  Application.list();  
	 }

Toutes les méthodes que l’on définit dans ce contrôleur étant soumises à un contrôle de l’utilisateur en session, vous vous retrouverez directement sur le formulaire d’authentification.

L’utilisateur sera ensuite redirigé vers l’écran principal de l’application (la liste des albums dans cet exemple).

Pour terminer, on souhaite permettre à un utilisateur identifié en tant qu’admin de se déconnecter.
Pour cela rien de plus simple, il suffit d’ajouter un lien au template main.html, dont toutes les pages héritent.

On ajoute le code suivant :

	<body>  
		 #{if session.get("username").equals("admin")}  
		  <div align="right">  
		   <a href="@{Secure.logout()}">Logout</a>  
		  </div>  
		 #{/if}  
	 #{doLayout /}  
	 </body>

Et voilà, vous savez maintenant comment ajouter des fonctions d’administration et de la sécurité à un site public avec Play!

## Tester notre application

Play intègre un framework de tests permettant de lancer différents types de tests.
	
### Tests unitaires

Les tests unitaires testent une partie précise du code de notre application.
Voici un exemple de test unitaire :

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

Cette classe hérite de la classe UnitTest fournie par Play. La méthode `filterByYearTest` permet de tester la méthode `filterByYear` de la classe Album.

### Tests fonctionnels
	
Les tests fonctionnels permettent de tester l'application à partir de son contrôleur en se basant sur le fichier `routes` pour résoudre les URL d'appel.
Ce test permet par exemple d'utiliser un service REST et valider la réponse obtenue : 

	public class ApplicationTest extends FunctionalTest {
	
		@Before
		public void setUp() {
			Fixtures.deleteAll();
			Fixtures.load("data.yml");
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
	
La méthode setUp permet de charger un fichier yml contenant des données de test. Le fichier se présente comme cela :

	Artist(joe) :
	name: joe

	Album(coolAlbum) :
	name: coolAlbum
	artist: joe
	releaseDate: 2010-11-12 00:00:00
	genre: ROCK
	
### Tests Selenium
	
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
	
### Lancer les tests
	
Pour lancer les tests, entrez la commande suivante dans votre terminal : `play test`
Puis tapez l'URL `http://localhost/@tests` dans votre navigateur.

Vous verrez apparaître cette page : 

![Tests](http://www.playframework.org/documentation/1.0/images/test-runner)

A partir de cet écran, vous pouvez lancer les tests et obtenir un rapport d'erreur (si il y en a)! 
Plutôt pratique non?
	
## Les jobs

### Charger des données au démarrage de l'application

Le code suivant permet de charger un jeu de données au démarrage de l'application :

	@OnApplicationStart
	public class PopulateOnStart extends Job {

    	public void doJob() {
        	// Check if the database is empty
         	if(Album.count() == 0) {
            	Fixtures.load("init-data.yml");
        	}
    	}
 	}

Pour que ça fonctionne il suffit de déposer le fichier init-data.yml dans le répertoire conf/

Voici un exemple de fichier yml :

	Artist(joe) :
	    name: joe

	Album(coolAlbum) :
	    name: coolAlbum
	    artist: joe
	    releaseDate: 2010-11-12 00:00:00
	    genre: ROCK

	Album(superAlbum) :
	    name: superAlbum
	    artist: joe
	    releaseDate: 2011-10-09 00:00:00
	    genre: ROCK

### Effectuer des traitements périodiques

Dans cet exemple, on souhaite recharger les albums toutes les heures à partir de notre fichier yml :

	@Every("1h")
	public class ReloadData extends Job {
		public void doJob() {	
			Fixtures.deleteAll();
			Fixtures.load("data.yml");		
		}
} 

On peut imaginer beaucoup d'applications possibles pour ce genre de traitements périodiques.
On pourrait par exemple envoyer un résumé d'activité par mail tous les lundi à l'ensemble des utilisateurs.
Pour définir finement la périodicité on peut utiliser la syntaxe CRON avec l'annotation `@On`.
Par exemple, `@On("0 0 8 * * ?")` déclenchera le traitement tous les jours à 8h.
	
## L'internationalisation

Dans le cas d'une application ou d'un site multilingue, on doit être capable de traduire facilement le contenu de nos pages.
Pour le message d'accueil de notre application, on peut par exemple écrire :

	<h1>&{welcome}</h1>

Les paramètres entourés de `&{}` seront traduits à partir des clés définies dans les fichiers de configuration de Play.
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

## Traitements asynchrones

	TODO