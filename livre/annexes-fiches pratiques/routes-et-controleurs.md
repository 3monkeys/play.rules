# Routes et contrôleurs

## Gérer les routes avec les annotations

Par défaut, les points d'entrée de l'application sont définis par leurs URLs dans le fichier `conf/routes` :
Exemple :

	POST    /new                                    Application.create
	GET	    /api/stuff/{id}                  		Application.getById(format:'xml')

Si vous voulez voir ces points d'entrée directement dans votre code Java, il est également possible de les définir dans les contrôleurs en installant le module `router`.
Pour bénéficier de ce module, ajoutez cette ligne au fichier dependencies.yml :

	- play -> router head

On peut ensuite modifier un contrôleurs de cette façon :

	@Post("/new")
	public static void create(){
		...
	}

	@Get(value="/api/stuff/{id}", format="xml")
	public static void getById(int id){
	 	...
	}
	
On peut bien sur utiliser également les annotations correspondant aux autres méthodes HTTP (`@Put`, `@Delete`, `@Head`), ainsi que `@WS` pour les Web Sockets et enfin `@Any` pour mapper une méthode vers n'importe quelle verbe HTTP.
On peut aussi modifier l'accès aux ressources statiques(images, fichiers CSS et JS...) en positionnant l'annotation `@ServerStatic` au niveau de classe du contrôleur :

	@ServeStatic(value = "/public/", directory = "public")
	public class Application extends Controller {...}

Pour spécifier plusieurs routes statiques on utilise l'annotation `@StaticRoutes` :
	
	@StaticRoutes({
		@ServeStatic(value = "/public/", directory = "public"),
		@ServeStatic(value = "/images/", directory = "images")
	})

## Configuration dev/prod des routes

On peut également limiter certaines URL au développement ou à la production dans le fichier routes :

%{ if (play.mode.isProd()) { }%
#mes routes de prod
...
%{ } }%

%{ if (play.mode.isDev()) { }%
#mes routes de dev
...
%{ } }%

## Les hooks

### @Before et @After

Dans les contrôleurs, il est possible de définir des interceptions pour réaliser des traitements spécifiques.

L'annotation @Before permet de définir une action à exécuter avant chaque méthode du contrôleur :
	
	@Before
	static void checkAuthentification() {
		if(session.get("user") == null){
			//authentification code
		}
	}
	
Parfois, on ne veut pas intercepter les appels de toutes les méthodes. Dans ce cas, on liste les méthodes à prendre en compte : 

	@Before(only={"myMethod1","myMethod2"})

Ou alors on on spécifie celles à ne pas intercepter : 

	@Before(unless={"myMethod3","myMethod4"})
	
@After fonctionne exactement de la même manière que @Before, mais s'exécute **après** les actions du contrôleur (really??? :0 ).

### @With

Si on veut hériter des comportements @Before et @After d'un ou plusieurs contrôleurs, on peut utiliser l'annotation @With qui simule l'héritage multiple (inexistant dans le langage Java) :

	@With(SuperController.class)
	public class Application extends Controller {...}
	
	@With(value={SuperController1.class,SuperController2.class})
	public class Application2 extends Controller {...}
