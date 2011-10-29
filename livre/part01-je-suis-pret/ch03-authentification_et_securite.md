# Authentification et sécurité

Maintenant que nous savons comment développer une application Web avec Play!►, voyons comment gérer la sécurité et l'authentification à l'aide du module Secure.
Nous allons étudier le cas suivant : notre application est publique, on peut y naviguer sans être authentifié. Mais elle possède également des fonctions d’administrations, affichées lorsque l’on s’identifie comme admin. Pour accéder à ces fonctions, il existe une URL qui permet d’accéder à un formulaire d'authentification. 

Play!► permet d’écrire les informations de session utilisateur dans un cookie. Ce cookie est signé, il n’est donc pas modifiable côté client, par contre il n’est pas crypté, il ne faut donc pas écrire d’informations sensible à l’intérieur (pas de mot de passe par exemple). Dans notre exemple, on souhaite utiliser le cookie de session pour stocker le fait que l’utilisateur soit identifié comme un administrateur ou non.

Une des choses que l’on souhaite ajouter à l’application web si l’utilisateur est admin est un lien “Supprimer” dans le tableau html qui liste nos entités métiers (on liste des albums de musique pour reprendre les exemples précédents). On peut donc utiliser le code suivant:

	#{if session.get("username").equals("admin")}    
	<td><a href="@{Admin.delete(album.id)}">Supprimer</a></td>  
	#{/if}  

Mais on se retrouve vite confronté à un problème, un clic sur ce lien mène à une URL comme celle ci :

	/admin/delete?id=11

Même si le lien est masqué, n’importe qui peut entrer cette URL dans son browser pour supprimer l’entité de son choix. Nous devons donc aussi protéger la méthode delete côté serveur.
Le module Secure de Play!► va nous permettre de faire ça de manière élégante. Il propose également un formulaire de login prêt à l’emploi qui permet de mettre les informations dont on a besoin dans le cookie de session.


## Mise en oeuvre du module Secure

Pour activer le module secure, on commence par modifier le fichier dependencies.yml pour y ajouter la ligne suivante dans la section `require` :

        - play -> secure

Dans le fichier `routes`, ajouter la ligne suivante pour configurer les routes :

	# Import Secure routes
	* / module:secure

Puis dans le fichier `application.conf`, on ajout les identifiants d’admin :

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
	@Check("admin")
	public static void delete(Long id) {
		...
	}
~~~ 

On redefinie également la méthode check en créant une nouvelle classe `Security` dans le package `controllers`, héritant de la classe Secure.Security :

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

## Authentification avec certificat et openssl

### Création d'une autorité de certification

Nous allons baser cet paragraphe sur la création de notre propre autorité de certification (AC). L'autorité de certification va nous permettre de signer les certificats que nous allons générer.En déploiement de production, vous pourrez utiliser l'autorité CACert (www.cacert.org) qui délivre des certificats gratuits et qui commence à être une autorité reconnue.

Si ce n'est déjà fait installez openssl (commande ubuntu ou debian) : 

	sudo apt-get install openssl

Il faut ensuite créer l'arborescence accueillant l'autorité de certification et initier les fichiers de départ.  

	sudo mkdir /home/ac /home/ac/private /home/ac/certs /home/ac/conf
	cd /home/ac
	sudo touch index.txt

Et rentrer la valeur 01 dans le fichier serial 

	sudo gedit serial


La première étape consiste à créer le fichier de configuration de l'AC : `sudo vi /home/ac/conf/ac.conf`. La configuration ci-dessous permet de se créer les éléments de base de l'AC. 
	
	[ ca ]
	default_ca = AC_3monkeys
	[ AC_3monkeys ]
	dir = /home/ac
	serial = $dir/serial
	database = $dir/index.txt
	new_certs_dir = $dir/certs
	certificate = $dir/certs/cacert.pem
	private_key = $dir/private/cakey.pem
	default_days = 365
	default_md = md5
	preserve = no
	email_in_dn = no
	nameopt = default_ca
	certopt = default_ca
	policy = policy_match
	[ policy_match ]
	countryName = match
	stateOrProvinceName = match
	organizationName = match
	organizationalUnitName = optional
	commonName = supplied
	emailAddress = optional
	[ req ]
	default_bits = 2048 # Size of keys
	default_keyfile = key.pem # name of generated keys
	default_md = md5 # message digest algorithm
	string_mask = nombstr # permitted characters
	distinguished_name = req_distinguished_name
	req_extensions = v3_req
	[ req_distinguished_name ]
	# Variable name Prompt string
	#------------------------- ----------------------------------
	0.organizationName = Organization Name (company)
	organizationalUnitName = Organizational Unit Name (department, division)
	emailAddress = Email Address
	emailAddress_max = 40
	localityName = Locality Name (city, district)
	stateOrProvinceName = State or Province Name (full name)
	countryName = Country Name (2 letter code)
	countryName_min = 2
	countryName_max = 2
	commonName = Common Name (hostname, IP, or your name)
	commonName_max = 64
	# Default values for the above, for consistency and less typing.
	# Variable name Value
	#------------------------ ------------------------------
	0.organizationName_default = PlayRules
	localityName_default = Paris
	stateOrProvinceName_default = IleDeFrance
	countryName_default = FR
	emailAddress_default = ac_admin@3monkeys.github.com
	[ v3_ca ]
	basicConstraints = CA:TRUE
	subjectKeyIdentifier = hash
	authorityKeyIdentifier = keyid:always,issuer:always
	[ v3_req ]
	basicConstraints = CA:FALSE
	subjectKeyIdentifier = hash

L'étape suivante consiste à créer l'autorité racine (root), avec ses clés et son certificat : 

	sudo openssl req -new -x509 -extensions v3_ca -keyout private/cakey.pem -out certs/cacert.pem -days 365 -config conf/ac.conf

Il faut rentrer une passphrase, puis répondre à une série de question, dont les valeurs par défaut ont été saisies dans le fichier de configuration. Nous garderons donc ces valeurs par défaut. Le common name est l'identifiant d'un certificat, il n'est donc par renseigné par défaut. La capture ci-dessous présente la liste des questions-réponses de la commande.

	Organization Name (company) [PlayRules]:
	Organizational Unit Name (department, division) []:3monkeys 
	Email Address [ac_admin@3monkeys.github.com]:
	Locality Name (city, district) [Paris]:
	State or Province Name (full name) [IleDeFrance]:
	Country Name (2 letter code) [FR]:
	Common Name (hostname, IP, or your name) []:ac_root@3monkeys.github.com

### Création du certificat client

A partir de là, nous allons créer un certificat client, qui sera signé par notre AC, pour chaque utilisateur à autoriser sur l'application. De même que pour l'AC il faudra renseinger le common name, cette fois ci avec le nom complet de l'utilisateur. L'utilisateur devra ensuite l'installer dans son navigateur pour s'authentifier auprès de notre site : 

	sudo openssl req -new -nodes -out user1.req.pem -keyout private/user1.key.pem -days 365 -config conf/ac.conf	

Les questions-réponses :

	Organization Name (company) [PlayRules]:
	Organizational Unit Name (department, division) []:3monkeys
	Email Address [ac_admin@3monkeys.github.com]:user1@3monkeys.github.com
	Locality Name (city, district) [Paris]:
	State or Province Name (full name) [IleDeFrance]:
	Country Name (2 letter code) [FR]:
	Common Name (hostname, IP, or your name) []:user1

Cette requête a créé un fichier privé de clé `user1.key.pem` et une requête de création de certificat `user1.req.pem`. Il faut maintenant signer cette requête pour obtenir un certificat délivré par l'autorité de certification (La passphrase de l'AC est demandée pour effectuer la signature) : 

	sudo openssl ca -out certs/user1.cert.pem -days 365 -config conf/ac.conf -infiles user1.req.pem

Il faut ensuite exporter le certificat au format pkcs12 par la commande ci-dessous : 

	sudo openssl pkcs12 -export -inkey private/user1.key.pem -in certs/user1.cert.pem -out user1.cert.p12

Cette commande vous demandera de créer une passphrase pour votre certificat, afin de protéger l'utilisation de votre certificat par une autre personne. Il faut ensuite l'importer dans le navigateur.

En fonctionnement normal, l'utilisateur crée lui-même ses fichiers de clés et de requête. Il transmet la requête à une autorité de certification qui lui renvoie son certificat.

### Configuration du projet Play!

Nous allons baser la configuration de notre projet sur un entrepôt de clé (keystore) java, dans le répertoire `conf`. Ce keystore sera généré avec un mot de passe.

	keytool -genkey -keystore conf/truststore.jks

Afin de reconnaître les utilisateurs, il faut importer le certificat de l'AC qui a généré les certificats de nos utilisateurs, avec l'option `-trustcacerts` pour indiquer qu'il s'agit d'une autorité que nous reconnaissons :

	keytool -import -trustcacerts -alias "root" -file /home/ac/certs/cacert.pem -keystore conf/truststore.jks 

La configuration du projet associée est la suivante (fichier `application.conf`), où nous indiquons l'utilisation du protocole https ainsi que le mot de passe du keystore.

	https.port=443
	play.netty.clientAuth=need
	keystore.algorithm=jks
	keystore.file=conf/truststore.jks
	keystore.password=mykeystorepassword

### Création du certificat serveur

Nous pouvons maintenant nous connecter sur le site de façon sécurité et en étant authentifié de façon forte. Par contre, un message d'alerte prévient l'utilisateur que la connexion au serveur n'est pas certifiée (le certificat présenté pour l'instant est celui de notre AC et est auto-signé). Il faut donc créer un certificat serveur que présentera le site lors des connexions ssl. Afin que le navigateur reconnaisse le certificat exposé par le serveur comme étant celui du site, le common name à utiliser est le 'hostname' de l'url du site. Nous allons donc utiliser l'url de site `www.vote4music.net`. Générons la clé du serveur dans le keystore :

	keytool -genkey -alias server -keyalg RSA -keysize 2048 -keystore conf/truststore.jks

L'ordre de la liste des question-réponse est légèrement différente de openssl, mais les éléments demandés sont les mêmes:

	Tapez le mot de passe du Keystore :  
	Quels sont vos prénom et nom ?
	  [Unknown] :  www.vote4music.net
	Quel est le nom de votre unité organisationnelle ?
	  [Unknown] :  3monkeys
	Quelle est le nom de votre organisation ?
	  [Unknown] :  PlayRules
	Quel est le nom de votre ville de résidence ?
	  [Unknown] :  Paris
	Quel est le nom de votre état ou province ?
	  [Unknown] :  IleDeFrance
	Quel est le code de pays à deux lettres pour cette unité ?
	  [Unknown] :  FR
	Est-ce CN=www.vote4music.net, OU=3monkeys, O=PlayRules, L=Paris, ST=IleDeFrance, C=FR ?
	  [non] :  oui

Maintenant, comme pour un certificat client, nous générons la demande de certificat à adresser à l'AC:
 
	keytool -certreq -alias server -keyalg RSA -file www.vote4music.net.csr -keystore conf/truststore.jks 

Nous signons cette demande à partir de notre AC avec openssl :

	sudo openssl ca -out www.vote4music.net.crt -config /home/ac/conf/ac.conf -infiles www.vote4music.net.csr

Nous extrayons la fin du fichier généré (`www.vote4music.net.crt`) pour extraite le certificat au format attendu par le keystore, la partie comprise entre les balise suivantes (incluses) : 

	-----BEGIN CERTIFICATE-----
	.
	.
	.
	-----END CERTIFICATE-----

Bous importons ce certificat dans le keystore (avec le même alias souso lequel nous avons généré la clé).

	keytool -import -alias "server" -file exrtait.crt -keystore conf/truststore.jks

Rédémarrons le projet pour prendre en compte le certificat. Raffraîchissons le site (http://localhost:443). Nous avons un message d'alerte vous affiche que le certificat n'est valide que pour www.vote4music.net. Nous allons donc éditer le fichier `/etc/hosts` pour ajouter la ligne ci-dessous et nous connecter avec l'url `https://www.vote4music.net` : 

	127.0.0.1      www.vote4music.net

A partir de ce moment, le message d'alerte est toujours présent avec cette fois-ci le message d'alerte que le certificat n'est pas vérifié par une autorité reconnue. Affichez le certificat et vous verrez qu'il n'

Il faut donc installer le certificat de l'AC dans le navigateur dans la liste des autorités reconnues

Sous FF : Edition - Préférences - Avancé (onglet chiffrement) : 
Afficher les certificats, onglet Autorité : Importer (le fichier /home/ac/certs/cacert.pem) et cocher l'option Confirmer cettte AC pour identifier des sites WEB.

### Habilitation

Maintenant que les utilisateurs sont authentifier de manière forte, il convient de vérifier leur habilitation, en se basant sur un annuaire LDAP par exemple.

## Conclusion
Et voilà, vous savez maintenant comment ajouter des fonctions d’administration et de la sécurité à un site public avec Play!►.
