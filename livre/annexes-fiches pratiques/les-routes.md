# Les routes

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
On peut aussi modifier l'accès aux ressources statiques en positionnant l'annotation `@ServerStatic` au niveau de classe du contrôleur :

	@ServeStatic(value = "/public/", directory = "public")
	public class Application extends Controller {...}

Pour spécifier plusieurs routes statiques on utilise l'annotation `@StaticRoutes` :
	
	@StaticRoutes({
		@ServeStatic(value = "/public/", directory = "public"),
		@ServeStatic(value = "/images/", directory = "images")
	})

## Configuration dev/prod

On peut également limiter certaines URL au développement ou à la production dans le fichier routes :

%{ if (play.mode.isProd()) { }%
#mes routes de prod
...
%{ } }%

%{ if (play.mode.isDev()) { }%
#mes routes de dev
...
%{ } }%