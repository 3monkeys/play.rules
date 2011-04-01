= Authentification et sécurité

Nous avons étudié ici et là le fonctionnement de l’authentification et de la sécurité avec Wicket.
Voyons aujourd’hui comment cela fonctionne avec Play, notamment ce que le framework nous propose avec son module Secure.
Nous allons étudier le cas suivant : notre application est publique, on peut y naviguer sans être authentifié. Mais elle possède également des fonctions d’administrations, affichées lorsque l’on s’identifie comme admin. Pour accéder à ces fonctions, il existe une URL qui permet d’accéder à un formulaire d'authentification. 

Play permet d’écrire les informations de session utilisateur dans un cookie. Ce cookie est signé, il n’est donc pas modifiable côté client, par contre il n’est pas crypté, il ne faut donc pas écrire d’informations sensible à l’interieur (pas de mot de passe par exemple). Dans notre exemple, on souhaite utiliser le cookie de session pour stocker le fait que l’utilisateur soit identifié comme un administrateur ou non.

Une des choses que l’on souhaite ajouter à l’application web si l’utilisateur est admin est un lien “Supprimer” dans le tableau html qui liste nos entités métiers (on liste des albums de musique pour reprendre les exemples précédents). On pourrait donc utiliser le code suivant:

	#{if session.get("username").equals("admin")}    
	<a href="@{Application.form(album.id)}"</a>  
	#{/if}  

Mais on se retrouve vite confronté à un problème, un clic sur ce lien mène à une URL comme celle ci :
/admin/delete?id=11
Même si le lien est masqué, n’importe qui peut entrer cette URL dans son browser pour supprimer l’entité de son choix. Nous devons donc aussi protéger la méthode delete côté serveur.
Le module Secure de Play va nous permettre de faire ça de manière élégante. Il propose également un formulaire de login prêt à l’emploi qui permet de mettre les informations dont on a besoin dans le cookie de session.

== Mise en oeuvre du module Secure

Le module secure est livré en standard avec la distribution Play.
Pour l'activer on commence par modifier le fichier de configuration application.conf.
Décommenter la ligne suivante :
	module.secure=${play.path}/modules/secure

Dans le même fichier ajouter la ligne suivante pour configurer les routes :
	# Import Secure routes
	* / module:secure
	Toujours dans ce fichier, on ajout les indentifiants d’admin :
	# Admin tokens
	application.admin=admin
	application.adminpwd=admin

On déclare ensuite un contrôleur d’administration pour toutes les actions que l’on veut restreindre. On ajoute l’annotation @With à ce controlleur pour lui dire qu’il doit s’appuyer sur le contrôleur du module Secure :

	@With(Secure.class)  
	public class Admin extends Controller {  
	....  
	}  

On ajoute ensuite un contrôle sur l'action delete en utilisant l'annotation @Check :

	Check("admin")  
	public static void delete(Long id) {  
	...  
	}  

On redefinie également la méthode check en creéant une nouvelle classe dans le package controller, héritant de la classe Secure.Security :
	static boolean check(String profile) {  
		 if(profile.equals("admin"))  
		   return session.get("username").equals("admin");  
		 return false;  
		}  

Ce code permet de demander au module Secure de vérifier que l’utilisateur en session est bien “admin” lorsque l’annotation @check(“admin”) est trouvée. 

Dans la même classe, on redéfinie la méthode authentify. C'est sur cette méthode que le formulaire d’autentification du module Secure s'appuie pour laisser passer ou non l'utilisateur.
	static boolean authentify(String username, String password) {  
	return Play.configuration.getProperty("application.admin").equals(username)&& Play.configuration.getProperty("application.adminpwd").equals(password);  
	}  


Avec cette configuration, si on essaie d’entrer l’URL /admin/delete?id=11, on arrivera directement sur le formulaire d’autentification pour prouver que l’on est bien administrateur.
Et bien sur si le mot de passe et l’utilisateur entrés ne sont pas les bons, on ne passe pas.

On aimerait maintenant pouvoir aller directement sur ce formulaire pour mettre en session utilisateur les informations concernant notre identité.

Il suffit d’ajouter le code suivant dans le contrôleur Admin pour exposer le formulaire de login à l’URL /admin/login :

	public static void login() {  
	  Application.list();  
	 }  
Toutes les méthodes que l’on définit dans ce controlleur étant soumises à un contrôle de l’utilisateur en session, vous vous retrouverez directement sur le formulaire d’authentification.

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