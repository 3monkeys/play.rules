# Authentification et sécurité

Maintenant que nous savons comment développer une application Web avec Play!►, voyons comment gérer la sécurité et l'authentification à l'aide du module Secure.
Nous allons étudier le cas suivant : notre application est publique, on peut y naviguer sans être authentifié. Mais elle possède également des fonctions d’administrations, affichées lorsque l’on s’identifie comme admin. Pour accéder à ces fonctions, il existe une URL qui permet d’accéder à un formulaire d'authentification. 

Play!► permet d’écrire les informations de session utilisateur dans un cookie. Ce cookie est signé, il n’est donc pas modifiable côté client, par contre il n’est pas crypté, il ne faut donc pas écrire d’informations sensible à l’intérieur (pas de mot de passe par exemple). Dans notre exemple, on souhaite utiliser le cookie de session pour stocker le fait que l’utilisateur soit identifié comme un administrateur ou non.

Une des choses que l’on souhaite ajouter à l’application web si l’utilisateur est admin est un lien “Supprimer” dans le tableau html qui liste nos entités métiers (on liste des albums de musique pour reprendre les exemples précédents). On peut donc utiliser le code suivant:

	#{if session.get("username").equals("admin")}    
	<a href="@{Application.delete(album.id)}">Supprimer</a>  
	#{/if}  

Mais on se retrouve vite confronté à un problème, un clic sur ce lien mène à une URL comme celle ci :

	/admin/delete?id=11

Même si le lien est masqué, n’importe qui peut entrer cette URL dans son browser pour supprimer l’entité de son choix. Nous devons donc aussi protéger la méthode delete côté serveur.
Le module Secure de Play!► va nous permettre de faire ça de manière élégante. Il propose également un formulaire de login prêt à l’emploi qui permet de mettre les informations dont on a besoin dans le cookie de session.


## Mise en oeuvre du module Secure

Pour activer le module secure, on commence par modifier le fichier `dependencies.yml` pour y ajouter la ligne suivante dans la section `require` :

        - play -> secure

Dans le fichier application.conf, ajouter la ligne suivante pour configurer les routes :

	# Import Secure routes
	* / module:secure
	Toujours dans ce fichier, on ajoute les identifiants d’admin :
	# Admin tokens
	application.admin=admin
	application.adminpwd=admin

Remarque : cette configuration est donnée à titre d'exemple, il est bien sur déconseillé de laisser des mots passe dans un fichier non crypté!

On déclare ensuite un contrôleur d’administration pour toutes les actions que l’on veut restreindre. On ajoute l’annotation @With à ce contrôleur pour lui dire qu’il doit s’appuyer sur le contrôleur du module Secure :

~~~ java 	
	@With(Secure.class)
	public class Admin extends Controller {
		....
	}
~~~  

On ajoute ensuite un contrôle sur l'action delete en utilisant l'annotation @Check :

~~~ java 
	Check("admin")
	public static void delete(Long id) {
		...
	}
~~~ 

On redefinie également la méthode check en créant une nouvelle classe dans le package contrôler, héritant de la classe Secure.Security :

~~~ java 
	static boolean check(String profile) {
	    if(profile.equals("admin"))
	        return session.get("username").equals("admin");
	    return false;
	}
~~~ 
  
Ce code permet de demander au module Secure de vérifier que l’utilisateur en session est bien “admin” lorsque l’annotation @check(“admin”) est trouvée. 

Dans la même classe, on redéfinie la méthode authentify. C'est sur cette méthode que le formulaire d’authentification du module Secure s'appuie pour laisser passer ou non l'utilisateur :

~~~ java 
	static boolean authentify(String username, String password) {
	    return Play.configuration.getProperty("application.admin").equals(username)&& Play.configuration.getProperty("application.adminpwd").equals(password);
	}
~~~  

Avec cette configuration, si on essaie d’entrer l’URL /admin/delete?id=11, on arrivera directement sur le formulaire d’authentification pour prouver que l’on est bien administrateur.
Et bien sur si le mot de passe et l’utilisateur entrés ne sont pas les bons, on ne passe pas.

On aimerait maintenant pouvoir aller directement sur ce formulaire pour mettre en session utilisateur les informations concernant notre identité.

Il suffit d’ajouter le code suivant dans le contrôleur Admin pour exposer le formulaire de login à l’URL /admin/login :

~~~ java 
	public static void login() {
	  Application.list();
	 }
~~~ 

Toutes les méthodes que l’on définit dans ce contrôleur étant soumises à un contrôle de l’utilisateur en session, vous vous retrouverez directement sur le formulaire d’authentification.

L’utilisateur sera ensuite redirigé vers l’écran principal de l’application (la liste des albums dans cet exemple).

On peut maintenant modifier notre template pour masquer les liens relatifs à des actions d'administration à l'aide du tag `secure.check` (inclus dans le module secure) :  
	
	#{secure.check 'admin'}
            <a href="@{Admin.delete(album.id)}">Delete</a>
        #{/secure.check}

Pour terminer, on souhaite permettre à un utilisateur identifié en tant qu’admin de se déconnecter.
Pour cela rien de plus simple, il suffit d’ajouter un lien au template `main.html`, dont toutes les pages héritent.

On ajoute le code suivant :

	<body>
 	    #{secure.check 'admin'}
	      <div align="right">
	       <a href="@{Secure.logout()}">Logout</a>
	      </div>
	    #{/secure.check}
	 #{doLayout /}
	 </body>

Et voilà, vous savez maintenant comment ajouter des fonctions d’administration et de la sécurité à un site public avec Play!►.
