# Pourquoi Play

Play framework est une vraie révolution dans le monde des application Web écrites en Java. Il vous fera oublier toutes les souffrances que vous avez pu vivre avec la pile Java EE classique, des frameworks comme Spring ou pire, J2EE.
Architectures techniques opaques, gestion chaotique des dépendances, longues phases de compilation, redémarrage du serveur à chaque modification du code... tout ça ne sera bientôt pour vous que de mauvais souvenirs :)

## Architecture simple

Play se base sur une architecure extrêmement simple en suivant le design pattern MVC. A côté de ça il ne rajoute pas de notions de couches service, couches DAO etc.

Tout le code métier est porté par les objets du modèle, afin d'éviter le phénonème appelé [Anemic Domain Model](http://en.wikipedia.org/wiki/Anemic_Domain_Model), qui résulte en l'écriture de classes métier contenant uniquement des champs et des accesseurs (getters et setters), donc sans traitements ni intelligence. C'est ce qui arrive dès que l'on commence à implémenter le code métier de l'application dans des couches techniques (couches service, EJB...)

Comme en Ruby On Rails, les objets du modèle sont conçus selon le pattern Active Record : ils ont la capacité de gérer eux même leur persistence dans la base de données.

On peut par exemple écrire le code suivant pour manipuler une entité "Personne" : 

    //Si on voulait récupérer toutes les personnes
    //List<Personne> personnes = find("byName","Dupont");
    //Récupérer la personne ayant l'id 1
    Personne p1 = Personne.findById(1);
    //Modification de l'entité
    p1.firstName = "paul";
    //Mise à jour dans la base de données
    p1.save();

## Orienté REST

    TODO URL "bookmarkables" et explicites : chaque page est une ressource 

## Stateless et scalable

Play se veut respectueux de l'architecture du Web et donc des architectures REST. Guillaume Bort a fait le choix de ne rien stocker côté serveur.
Cela signifie qu'il n'existe pas de session utilisateur sur la partie serveur du framework. 
Ceci peut sembler déstabilisant lorsque l'on a l'habitude de travailler des frameworks comme JSF ou Wicket. Mais finalement ce mode de fonctionnement simplifie vraiment lec choses.
En effet on n'a pas besoin de gérer l'état du serveur, il ne fait que traiter les requêtes qui arrivent et renvoyer la réponse. Ceux qui ont déjà eu des problèmes avec Wicket et sa manie de tout garder en session, même les objets "ou of date" comprendront ce queje veux dire.
Play propose un objet "session" qui permet de stocker un identifiant de session utilisateur en écrivant dans un cookie côté client (dans le navigateur).
Pour stocker des volumes plus importans de données côté client, vous serez incité à utiliser les API de stockage de HTML 5 (web storage).
Si pour des raisons de performances vous ne voulez pas répeter trop souvent les mêmes requêtes vers la base de données, il est également possible d'utiliser un cache distribué. Play fournit une implémentation de cache par défaut.
    
Une autre conséquence de ce mode stateless est bien sur la capacité à monter en charge (scalabilité). Si le trafic de votre application augmente, il suffira de rajouter un serveur derrière un load balancer pour tenir la charge.
Ceci prend tout son sens dans les environnements de type cloud ou des neouds de serveurs peuvent être ajoutés et retirés dynamiquement selon la demande.
Autre avantage : la tolérance aux pannes. Si un serveur tombe en panne, les appels pourront passer sur un autre serveur sans que l'utilisateur s'en rende compte.
Avec des framework stateful, vous seriez obligé de dupliquer les sessions utilisateurs d'un serveur à l'autre pour que les utilisateurs ne perdent pas leur contexte de travail.

  
##Productif

Toute la pile est pré-configurée, de la vue à la base de données. Play suit la logique de "convention over configuration". Ainsi, si le paramétrage par défaut vous convient, vous pourrez commencer à développer dès que vous aurez dézippé l'archive du framework! Ce principe sera également appliqué lors du développement de nos applications Play afin d'économiser des lignes de code tout au long du développement.

Play embarque son propre serveur qui est capable de compiler lui même les fichiers source et de récupérer à chaud toutes les modifications de code.
Vous n'aurez donc jamais à vous soucier des phases de compilation ou de déploiement de votre application.
Si vous ajoutez une nouvelle ligne de code, un simple "refresh" dans votre navigateur vous permettra de la voir en action.

De plus, Play propose nativement un module "CRUD" permettant de générer les écrans, les traitements et les requêtes pour gérer les opération basiques relatives à une entité métier (création, lecture/recherche, mise à jour, suppression). 

## Extensible (modules)

Il existe un grand nombre de modules pour ajouter des fonctionnalités au framework : déploiement sous Google APP Engine, authentification avec OAuth, validation des données côté client avec HTML5...
La communauté est très active et de nouveaux plugins arrivent régulièrement dans le dépot officiel.

## Pur Java

Play est écrit en Java et il est compatible avec toutes vos librairies Java préférées.
De plus Play facilite l'utilisation de Java grâce à un certain nombre d'astuces.Il génére par exemple automatiquement les accesseurs (getters et setters) dans les classes Java dans le but d'améliorer la lisibilité du code.

## 5 trucs cool que l'on peut faire avec Play

    TODO détailler ces exemples http://www.playframework.org/documentation/1.0/5things