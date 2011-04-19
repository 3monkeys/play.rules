# Pourquoi Play

Play framework est une vraie révolution dans le monde des application Web écrites en Java. Il vous fera oublier toutes les souffrances que vous avez pu vivre avec la pile Java EE classique, des frameworks comme Spring.
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

Avec Play, il est extrêmement facile de faire correspondre des URL simples, lisibiles et _bookmarkables_ aux actions du controlleur.

Par exemple, pour afficher toutes les personnes habitant à Paris dans un annuaire, on pourra utiliser une URL comme

    /annuaire/personnes/paris

Ceci est renforcé par l'aspect _stateless_ du framework. Le serveur ne stockant pas d'état, on n'aura pas de mauvaise surprise quant au rendu correspondant à une URL : Play effectuera toujours le même traitement quelque soit le contexte (voir paragraphe suivant).

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
Si vous ajoutez une nouvelle ligne de code, un simple "refresh" dans votre navigateur vous permettra de la voir en action. Et si jamais votre code contient une erreur, vous verrez un message clair et explicite dans votre navigateur, bien plus simple à comprendre que les traditionnelles _stack trace_ que l'on rencontre habituellement lorsque l'on fait du développement JEE.

Enfin, Play propose nativement un module _CRUD_ permettant de générer les écrans, les traitements et les requêtes pour gérer les opération basiques relatives à une entité métier (création, lecture/recherche, mise à jour, suppression). 

## Modulaire et extensible

Il existe un grand nombre de modules pour ajouter des fonctionnalités au framework : déploiement sous Google APP Engine, authentification avec OAuth, validation des données côté client avec HTML5...
La communauté est très active et de nouveaux plugins arrivent régulièrement dans le dépot officiel.

De plus le framework, bien que _full stack_, n'est pas monolithique,  il est possible de n'utiliser que les parties de Play qui nous intéresse et de l'utiliser conjointement à d'autres technologies. On pourrait par exemple imaginer n'utiliser que la partie contrôleur de Play pour exposer des services REST à un front end écrit en HTML/JavaScript et s'appuyer sur des services Spring pour la partie métier. 

## Pur Java

Play est écrit en Java et il est compatible avec toutes vos librairies Java préférées.
De plus Play facilite l'utilisation de Java grâce à un certain nombre d'astuces.Il génére par exemple automatiquement les accesseurs (getters et setters) dans les classes Java dans le but d'améliorer la lisibilité du code.

## 5 trucs cool que l'on peut faire avec Play

Les exemples suivants sont tirés [du site officiel de Play](http://www.playframework.org/documentation/1.0/5things) et montrent en quelques lignes l'esprit et la simplicité du framework.

### 1. Mapper des paramètres HTTP et une méthode Java

L'URL suivante
    /articles/archive?date=08/01/08&page=2

permettra de consulter les articles que vous avez demandé en ajoutant des paramètres ayant le même nom dans une méthode Java :

    public static void archive(Date date, Integer page) {
        List<Article> articles = Article.fromArchive(date, page);
        render(articles);
    }

Le _biding_ intelligent fonctionne avec n'importe quelle classe :

    public class Person {
        public String name;
        public Integer age;
    }

Une simple action dans le controlleur permet d'ajouter une personne :

    public static void add(Person p) {
        p.save();
    }


Ce formulaire HTML définie les champs correspondant à la classe Person et permet d'appeler notre méthode _add_.

    <form action="/Directory/add" method="POST">
        Name: <input type="text" name="p.name" />
        Age: <input type="text" name="p.age" />
    </form>

### 2. Redirection vers une action, en appelant simplement une méthode Java


Play n'a pas besoin de l'équivalent de la directive _forward_ de Servlet pour la redirection vers d'autres actions. Il suffit d'appeler la bonne méthode dans le code Java :

    public static void show(Long id) {
        Article article = Article.findById(id);
        render(article);
    }

    public static void edit(Long id, String title) {
        Article article = Article.findById(id);
        article.title = title;
        article.save();
        show(id);
    }

Comme vous le vooyez, à la fin de l'action edit, on se redirige vers l'action show!

Dans les templates, on peut utiliser une syntaxe équivalente pour générer un lien :

    <a href="@{Article.show(article.id)}">${article.title}</a>
    That will generate the following HTML:

    <a href="/articles/15">My new article</a>

### 3. Ne vous répetez pas en passant des paramètres aux templates

Dans la plupart des frameworks Java, pour passer des objets au moteur de template vous devrez utiliser une syntaxe comme :

    Article article = Article.findById(id);
    User user = User.getConnected();
    Map<String, Object> model = new HashMap<String,Object>();
    model.put("article", article);
    model.put("user", user);
    render(model);

Avec Play, il suffit d'écrire :

    Article article = Article.findById(id);
    User user = User.getConnected();
    render(article, user);

Et vous pourrez récupérer les objets à partir de leur nom dans le template. Encore des lignes de code gagnées!

### 4. JPA sous steroids

Il est incroyablement facile d'utiliser l'API de mapping objet/relationnel JPA avec Play. Rien à configurer, Play synchronisera la base (également configurée et démarrée automatiquement en mode développement) avec vos objets.

En plus, si vous utilisez la classe Model de Play, le code sera encore simplifié :

    public void messages(int page) {
        User connectedUser = User.find("byEmail", connected());
        List<Message> messages = Message.find(
            "user = ? and read = false order by date desc",
            connectedUser
        ).from(page * 10).fetch(10);
        render(connectedUser, messages);
    }


### 5. Uploadez facilement des fichiers

    Le formulaire HTML :

    <form action="@{Article.uploadPhoto()}" method="POST" enctype="multipart/form-data">
        <input type="text" name="title" />
        <input type="file" id="photo" name="photo" />
        <input type="submit" value="Send it..." />
    </form>

    Et le code Java :

    public static void uploadPhoto(String title, File photo) {
       ...
    }

Comment faire plus simple?
