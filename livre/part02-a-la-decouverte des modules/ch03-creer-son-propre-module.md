# Créer son propre module

Maintenant que nous avons vu un certain nombre de modules existants, voyons comment créer un module personnel pour répondre à nos propres besoins! 

## Exemple 1 : Créer un tag personnalisé

Dans le chapitre précédent, je vous ai présenté le module HTML5Validation, qui ajoute la validation des données côté navigateur à l'aide d'un tag, en se basant sur les annotations du modèle.
Nous allons maintenant étudier le code de ce module pour comprendre comment réaliser ce genre de tags.

### Structure du module

La structure d'un module ressemble à celle d'une application Play. Dans ce module nous trouvons les répertoires suivants :

* app
* app/tags
* documentation

Si le module avait défini des vues et des contrôleurs on les aurait retrouvé dans le répertoire app comme dans une application Play classique. Dans le cas de ce module on ne trouve qu'un tag, que l'on va étudier.

La classe `HTMLValidationTags` étend `FastTags`. Cette dernière permet de créer rapidement un tag en décrivant simplement son comportement en Java.

Le tag comporte une seule méthode publique, qui sera appelée pour effectuer le rendu :

~~~ java 	
public static void _input(final Map<?, ?> args, final Closure body, final PrintWriter out,
        final ExecutableTemplate template, final int fromLine) {
...
}
~~~ 	

Les paramètres `args` et `body` correspondent au contenu du tag dans la vue HTML. Dans notre cas, le tag est toujours fermé à la fin de sa déclaration, il n'y a donc pas de body. 
Exemple : `#{input for:'user.name', id:'YourID', class:'class1 class2' /}`
Le paramètre `out` permet d'écrire dans la sortie HTML. `FromLine` sert à spécifier la section du template dans laquelle on exécute le code. On s'en sert par exemple pour préciser la ligne d'erreur lors de la levée d'une exception.
Le nom du tag est défini par le nom de la méthode, sans le underscore.

Le corps de la méthode écrit dans le flux sortie HTML en fonction des paramètres d'entrée :

~~~ java 	
out.print("<input");

// Print standard attributes
printStandardAttributes(args, out);

// Print validation attributes
printValidationAttributes(args, out);

// Close input tag
out.println(">");
~~~ 	

Si on a un modèle comme ceci : 

~~~ java 	
@Required
@Match("[a-z]*")
public String name;
~~~ 	

Alors le template `#{input for:'user.name', id:'YourID', class:'class1 class2' /}` rendra  le code HTML suivant : `<input name="user.name" value="${user?.name}" id="YourID" class="class1 class2" required pattern="[a-z]*">`

Ce code permet de déterminer le champ que l'on est entrain de manipuler :

~~~ java 	
final String fieldname = args.get("for").toString();
    final String[] components = fieldname.split("\\.");

    // Find class
    Class<?> clazz = null;

    for (final Class<?> current : Play.classloader.getAllClasses()) {
        if (current.getSimpleName().equalsIgnoreCase(components[0])) {
            clazz = current;
        }
    }

    // Find field
    final Field field = clazz.getField(components[1]);
~~~ 	


Et voici le code utilisé pour détecter et traiter l'annotation `@Required` :

~~~ java 	
if (field.isAnnotationPresent(Required.class)) {
    printAttribute("required", "required", out);
}
~~~ 

Pour `@Match` :  
  
~~~ java 	
if (field.isAnnotationPresent(Match.class)) {
    final Match match = field.getAnnotation(Match.class);
    printAttribute("pattern", match.value(), out);
}	
~~~ 	

N.B. : Vous pouvez voir le détail des méthodes `printAttribute`, `printStandardAttributes` et `printValidationAttributes` dans le [code du module](https://github.com/oasits/play-html5-validation).

## Exemple 2 : Amélioration du module CRUD avec JQuery UI

Il y a quelques temps, [la team jQuery UI a annoncé](http://blog.jqueryui.com/2011/02/unleash-the-grid/) qu'ils avaient commencé à sérieusement et officiellement travailler sur le widget Grid de la librairie. Le développement prend place au sein de la branche grid du repository github, le répertoire nous intéressant le plus étant [grid-datamodel](https://github.com/jquery/jquery-ui/tree/grid/grid-datamodel).

Dans cette partie, nous nous intéresserons à l'implémentation grid-datamodel et son intégration dans le module CRUD de Play.
Nous nous concentrerons à configurer le widget UI Grid et adapter légèrement le CRUD généré par Play pour permettre l'utilisation du widget en mode XHR (Ajax).

### Le plan

Le module CRUD de Play comporte un ensemble de fichier de templates (views/tags) permettant de gérer et afficher les données du modèle. Dans l'exemple que nous nous apprêtons à mettre en place ici, cela signifie générer une table à partir des données de notre modèle. Le module CRUD par défaut utilise des paramètres pour permettre pagination, recherche/filtre et tri. Play génère alors la table correspondante pour une "page" unique. Ainsi, même si votre modèle comporte des milliers d'objets, Play générera la table correspondante avec seulement une vingtaine de ligne (configurable).

Dans le cadre de ce tutoriel, les étapes que l'on devra mettre en place se résumeront à:

1. Configuration d'une application exemple, le but étant de définir des données avec lesquelles travailler.
2. Création de nos contrôleurs et modification des templates utilisé par le module CRUD. Cette étape nous permettra de fournir un service dont le retour est une réponse JSON représentant les données de notre modèle.
3. La création d'un module Play très simple dont le seul but est de contenir les assets (fichiers statiques) nécessaire au widget grid et de les rendre disponible au reste de l'application via l'utilisation d'une route particulière `/grid/`
4. Configuration du widget grid et du datasource pour utiliser le service fourni par le module Play.

Le code de cet exemple est disponible ici :

		git clone git://github.com/mklabs/play-ui-grid.git


### Mise en place de l'application exemple

Nous utiliserons un exemple de gestion des fuseaux horaires (timezone locale) pour jouer avec un widget grid. Cela nous permettra d'avoir facilement plusieurs milliers d'enregistrement avec lesquels travailler.

Nous partons d'une application Play vierge pour laquelle nous activerons le module CRUD (voir partie 0 du livre).

Nous allons désormais nous occuper de la création de notre modèle. Dans notre exemple, il s'agit de timezones, le modèle est simple: timezoneId, name, language et un offset.

~~~ java 	
    @Entity
    public class LocalisedTimeZone extends Model {

       public String timeZoneId;
       public String name;
       public String language;
       public int offset;

       public LocalisedTimeZone(TimeZone zone, Locale locale) {
          this.timeZoneId = zone.getID();
          this.name = zone.getDisplayName(locale);
          this.language = locale.getDisplayLanguage();
          this.offset = zone.getRawOffset() / 3600000;
       }
    }
~~~  	

Vient ensuite la dernière partie de la mise en place de notre exemple d'application avec la définition d'un Job pour charger les données au démarrage :

~~~ java 	   
 @OnApplicationStart
    public class Bootstrap extends Job {

    	@Override
    	public void doJob() {
    		if (LocalisedTimeZone.count() == 0) {
    			for (String id : TimeZone.getAvailableIDs()) {
    				final TimeZone zone = TimeZone.getTimeZone(id);
    				new LocalisedTimeZone(zone, Locale.ENGLISH).save();
    				new LocalisedTimeZone(zone, Locale.FRENCH).save();
    				new LocalisedTimeZone(zone, new Locale("nl")).save();
    			}
    		}
    	}

    }
~~~ 	

Okay, notre modèle est prêt à être utilisé. Ils nous manque encore le contrôleur CRUD pour afficher le tout.

### Contrôleurs, et modifications des vues du module CRUD

#### Contrôleurs

Penchons nous désormais sur le code du contrôleur, la partie de l'application qui permet d'offrir à nos vue les données du modèle sous format JSON (nous voulons faire de UI Grid un consommateur de ce "service").

~~~ java 	
	public class CrudJson extends CRUD {

	    public static void listJson(int page, String search, String searchFields, String orderBy, String order) {
	        ObjectType type = ObjectType.get(getControllerClass());

	        notFoundIfNull(type);

	        if (page < 1) {
	            page = 1;
	        }

	        final List<Model> objects = type.findPage(
	            page,
	            search,
	            searchFields,
	            orderBy,
	            order,
	            (String) request.args.get("where")
	        );

	        renderJSON(objects);
	    }
	}
~~~  	

UI Grid attend simplement un tableau d'objets. Parfait, c'est exactement le format JSON renvoyé par `renderJSON`.

Cette classe `CrudJson` est conçue pour être étendue par les véritables contrôleurs de notre application. Dans cette exemple, il s'agira de `LocalisedTimeZone`.

~~~ java 	
	public class LocalisedTimeZones extends CrudJson {}
~~~ 	

Une ligne... Je sais pas vous, mais il me plaît beaucoup ce contrôleur!

Il nous reste une étape à ne pas oublier avec la configuration des routes des contrôleurs. Ici, nous ne disposons que d'un seul contrôleur. Aussi, nous pourrions nous contenter de:

	GET /localeOrWhateverName.json LocalisedTimeZone.listJson

Dans la plupart des cas, cela suffirait à répondre à nos besoin. Cela dit, dans la pratique, les applications ne disposant que d'un modèle/contrôleur ne sont pas légion, et pour chaque objet de notre modèle, une route serait nécessaire. Ceci étant, il existe également la méthode suivante, se reposant sur la convention de nommage de vos contrôleurs et permettant une approche un peu plus DRY:

	#{crud.types}
	GET /${type.controllerName}.json ${type.controllerClass.name.substring(12).replace('$','')}.listJson
	#{/crud.types}

Chacun des contrôleurs crées se verra alors attribuer une route automatiquement de la forme `/controllername.json` pointant sur l'action listJson (celle de CrudJson).

Ici, un rapide test vers [localhost:9000/localisedtimezones.json](http://localhost:9000/localisedtimezones.json) devrait nous donner quelque chose comme:

    [{"timeZoneId":"Etc/GMT+12","name":"GMT-12:00","language":"anglais","offset":-12,"id":1},{"timeZoneId":"Etc/GMT+12","name":"GMT-12:00","language":"français","offset":-12,"id":2},{"timeZoneId":"Etc/GMT+12","name":"GMT-12:00","language":"néerlandais","offset":-12,"id":3},{"timeZoneId":"Etc/GMT+11","name":"GMT-11:00","language":"anglais","offset":-11,"id":4},{"timeZoneId":"Etc/GMT+11","name":"GMT-11:00","language":"français","offset":-11,"id":5},{"timeZoneId":"Etc/GMT+11","name":"GMT-11:00","language":"néerlandais","offset":-11,"id":6},...]

A ce stade, nous avons donc de disponible les routes suivantes:

	GET       /admin/                                          	LocalisedTimeZones.index
	GET       /admin/localisedtimezones                         LocalisedTimeZones.list
	GET       /admin/localisedtimezones/new                     LocalisedTimeZones.blank
	GET       /admin/localisedtimezones/{id}                    LocalisedTimeZones.show
	GET       /admin/localisedtimezones/{id}/{field}            LocalisedTimeZones.attachment
	GET       /admin/localisedtimezones/{id}/edit               LocalisedTimeZones.edit
	POST      /admin/localisedtimezones                         LocalisedTimeZones.create
	POST      /admin/localisedtimezones/{id}                    LocalisedTimeZones.save
	DELETE    /admin/localisedtimezones/{id}                    LocalisedTimeZones.delete
	GET       /localisedtimezones.json                          LocalisedTimeZones.listJson

Vous pouvez rapidement avoir un aperçu des routes disponibles en générant une erreur 404. Par défaut (en mode dev), Play vous renverra une page 404 particulière listant toutes les routes possibles pour votre application: [localhost:9000/coucoujsuispasla](http://localhost:9000/coucoujsuispasla)

Un tour à l'adresse [localhost:9000/admin/](http://localhost:9000/admin/) devrait vous donner:

![Liste des ObjectType](https://github.com/3monkeys/play.rules/raw/master/rsrc/p02_ch03_01.png)

Page à partir de laquelle nous pouvons accéder à la liste des Timezone. Par défaut, la vue list du module crud n'affiche qu'une colonne contenant le résultat de la méthode `toString()` de l'objet.

#### Vues

Maintenant, jetons un œil à notre vue custom list.html. Il s'agit de la vue responsable de la génération de notre table HTML (`app/views/CRUD/list.html`). Le module CRUD offre un moyen simple et efficace de surcharger des composants du module comme les views ou tags avec la commande `play crud:ov --template CRUD/list`. Cela indiquera à Play de vous fournir une copie conforme de ce template dans votre propre répertoire, que l'on peut ensuite modifier à souhait. Aucune configuration supplémentaire n'est à apporter, le système de module implique que Play cherche d'abord toute ressource au sein du répertoire de votre appli, puis ensuite au sein des modules configurés. Pratique, puissant, flexible, élégant, le système de modules de Play est une petite merveille... mais je m'égare, continuons :)

Pour modifier la vue list.html, Play propose la commande `play crud:ov`:

	> play crud:ov
	~        _            _
	~  _ __ | | __ _ _  _| |
	~ | '_ \| |/ _' | || |_|
	~ |  __/|_|\____|\__ (_)
	~ |_|            |__/
	~
	~ play! 1.1.1, http://www.playframework.org
	~
	~ Specify the template to override, ex : -t Users/list
	~
	~ Use --css to override the CRUD css
	~ Use --layout to override the CRUD layout
	~

Ainsi la commande:

	play crud:ov --t CRUD/list

demandera à Play de copier le template CRUD par défaut list.html dans le répertoire `app/views/CRUD/list.html` de notre application.

    #{extends 'CRUD/layout.html' /}

    <div id="crudList" class="${type.name}">

        <div id="crudListSearch">
          #{crud.search /}
        </div>


        <table class="crud-grid">
          <caption>UI Grid integration with Play! Crud module</caption>
          <thead>
            <tr>
              <th data-field="timeZoneId">yayTimezone</th>
              <th data-field="name">Name</th>
              <th data-field="language">language</th>
              <th data-field="offset">offset</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>


        <div id="crudListPagination">
          #{crud.pagination /}
        </div>

    </div>

Concrètement dans cette vue, vous avons enlever le tag `#{crud.table}` pour utiliser le markup de UI Grid. Notez l'utilisation de [data-attributes html5](http://ejohn.org/blog/html-5-data-attributes/) sur chaque colonne, ils seront utilisés par le widget grid pour effectuer la correspondance adéquate entre la table du widget et le datasource utilisé. Vous pourrez également noter l'utilisation de `#{extends 'CRUD/layout.html' /}` indiquant l'utilisation d'un layout custom en lieu et place du layout par défaut (`play crud:ov --t CRUD/layout`).

Ensuite, nous aurons à configurer les assets (ressources statiques CSS/JS) nécessaires à UI Grid (dans `app/views/CRUD/list.html`):

    #{set 'css'}
      <link rel="stylesheet" type="text/css" media="screen" href="/grid/css/themes/base/jquery.ui.all.css">
      <link rel="stylesheet" type="text/css" media="screen" href="/grid/js/grid-datamodel/grid.css">
    #{/set}

Ceci est une fonctionnalité très puissante du système de template de Play qui permet aux sous-templates de définir du markup html (ici, import des styles) qui sera automatiquement "décoré" au sein du layout principal (pour peu qu'il définisse les tags `#{get 'css' /}` et `#{get 'js' /}`).

    #{set 'js'}
      <script src="/grid/js/ui/jquery.ui.core.js"></script>
      <script src="/grid/js/ui/jquery.ui.widget.js"></script>
      <script src="/grid/js/jquery.tmpl.js"></script>
      <script src="/grid/js/grid-datamodel/dataitem.js"></script>
      <script src="/grid/js/grid-datamodel/datasource.js"></script>
      <script src="/grid/js/grid-datamodel/datastore.js"></script>
      <script src="/grid/js/grid-datamodel/grid.js"></script>
    #{/set}

Toutes les ressources statiques nécessaires à la configuration du grid sont récupérées à partir du chemin `grid` qui est une route définie par crud-grid, module que je vous propose de créer ensemble.


### Création du module crud-grid

Ce module prendra soin de l'import des ressources statiques et de la configuration des routes correspondante pour permettre à notre application d'y avoir accès.

Cette étape n'est absolument pas nécessaire, et vous pourriez vous contenter de stocker ces fichiers au sein de votre répertoire `/public/`.

Toutes les ressources sont récupérées à partir du chemin `/grid/` qui est une route définie par le module crud-grid. Il prendra soin de faire correspondre toute ressources statiques du répertoire `/app/public/` au chemin `/grid/`. Il aura aussi pour rôle de contenir tout code relatif à l'intégration du widget grid (comme la définition du contrôleur spécial CrudJson qui nous permet de renvoyer une représentation JSON et grid-compliant de notre modèle).

    play new-module crud-grid

Cette commande vous permettra de rapidement créer la structure de départ du module que l'on s'apprête à créer. Dans cette exemple, le module sera créé à la racine de notre application.

Pour faciliter sa réutilisation, on déplace la classe CrudJson de l'application vers le répertoire app/controllers du module que l'on vient de créer.

Il nous faut maintenant importer les routes du module au sein de l'application, ceci est fait dans le fichier `conf/application.conf`:

    module.crud-grid=./crud-grid

Très bien notre application exemple utilise maintenant ce module crud-grid qui ne fait strictement rien pour l'instant. Au redémarrage de l'appli, vous devriez voir l'import du module dans votre console.

Le but ici, est de fournir un module contenant tous les fichiers nécessaires au fonctionnement de UI Grid. Ce module crud-grid contiendra alors les fichiers de la branche de jQuery UI relative au développement du widget grid (css et js) tout en fournissant une route particulière, ce qui permet à notre application de charger ces fichiers à partir de celle-ci.

Ceci est fait avec la modification du fichier route du module `crud-grid/conf/routes` avec quelque chose comme:

    # Map the static resources from the /app/public folder to the /grid path
    GET        /grid/        staticDir:app/public

Ensuite, tout comme nous avons dû le faire pour le module crud, cette route devra être explicitement importée par l'application dans son propre fichier routes `conf/routes`:

    # Grid
    *       /                                       module:crud-grid

Ceci devrait nous permettre, depuis nos vues, de charger les fichiers statiques contenus au sein du module, comme cela peut-être fait dans la vue list.html (notre vue crud custom):

    #{set 'js'}
      <script src="/grid/js/ui/jquery.ui.core.js"></script>
      <script src="/grid/js/ui/jquery.ui.widget.js"></script>
      <script src="/grid/js/jquery.tmpl.js"></script>
      <script src="/grid/js/grid-datamodel/dataitem.js"></script>
      <script src="/grid/js/grid-datamodel/datasource.js"></script>
      <script src="/grid/js/grid-datamodel/datastore.js"></script>
      <script src="/grid/js/grid-datamodel/grid.js"></script>
    #{/set}

Dans cet exemple, le module crud-grid contient également la classe controller `CrudJson`. C'est une question de choix, on pourrait très bien la placer au niveau des autres contrôleurs de l'application, mais si l'on veut être un peu plus strict au niveau découplage des responsabilités, cela semble être le plus approprié.

N.B : la plupart des modules que l'on rencontrera seront des modules que l'on peut appeller "techniques", cad permettant ou facilitant l'intégration de couche "techniques" que ne propose pas Play par défaut (gae, sienna, pdf, etc.). Mais on peut imaginer que, dans le cadre d'une application assez large pour s'y prêter, l'utilisation de module pour compartimenter "fonctionnellement" l'application est possible (un module admin, un module gestion, un module facturation, etc.).

### UI GRID!

Nous avons créé notre application exemple avec de nombreuses données à afficher, nous nous sommes occupé du contrôleur permettant de renvoyer une représentation du modèle sous format JSON et préparer nos vues pour être utilisé avec UI Grid, nous avons enfin créé un module custom permettant de contenir toutes les ressources nécessaires à UI Grid pour fonctionner. Il nous reste alors à configurer ce fameux widget.

Voici le script responsable de la configuration et de l'initialisation du widget et du datasource associé:

    <script>
      $(document).ready(function() {

        // reference to the crud search form container
        var search = $('#crudListSearch'),

        // our main table
        table = $('.grid-table'),

        // reference to the crud pagination links container
        pagination = $('#crudListPagination'),

        // The grid datasource
        datasource = $.ui.datasource({
          // The type of source we're exposing
          type: 'timezones',

          // request parameters to be sent whenever datasource.get occurs
          data: {search: 'français'},

          // remote service url
          source: '/localisedtimezones.json'
        }),

        // Now, let's create the grid widget
        grid = $('.crud-grid').grid({
          // Must match a previously defined datasource
          type: 'timezones',

          // Mapping to apply
          columns: ['timeZoneId', 'name', 'language', 'offset']
        }),


        // Bonus: Override default search behaviour to use our own
        form = search.find('form').bind('submit', function() {
          datasource.get({
            search: $.trim($(this).find('input[name="search"]').val())
          });
          return false;
        });

        // Bonus: Now deals with pagination link interception.
        pagination.delegate('a', 'click', function(e){
          var link = $(e.target),
          page = link.attr('href').match(/page=(\d+)/)[1];

          if(page) {
            datasource.get({page: page});
          }

          return false;
        });


      });
    </script>

Dans l'idéal, ce document ready devrait être externaliser dans un fichier externe, cependant, dans le cadre de cet exercice, il sera défini en inline au sein du tag `#{set 'js'}` du template `app/views/CRUD/list`

Le grid aura alors les fonctionnalités et possibilités suivantes:

* les données sont récupérées en passant par des appelx XHR (pas de rechargement de page)
* la pagination est gérée en interceptant les clicks des liens de pagination (les liens générés par le CRUD de play) pour effectuer une nouvelle requête au datasource en passant les paramètres correspondant: `datasource.get({page: page});`
* la fonctionnalité de filtre est supportée. Tout comme les liens, l'event submit du formulaire est intercepté pour demander au datasource de faire une nouvelle requête en passant une fois encore les paramètres correspondants et attendues par le module Play: `datasource.get({search: $.trim($(this).find('input[name="search"]').val())});`

Un tour à l'adresse [http://localhost:9000/admin/localisedtimezones](http://localhost:9000/admin/localisedtimezones) devrait vous donner:
![Crud UI Grid](https://github.com/3monkeys/play.rules/raw/master/rsrc/p02_ch03_00.png)

### Améliorations possibles 

Le tri me direz-vous? Et bien, ce sera une bonne occasion de continuer l'investigation! Pour le moment, nous nous arrêtons à ce niveau là de l'expérimentation. Ce module est donc encore perfectible, mais il nous a permis de mettre en évidence un bon nombre de principes qui devraient vous donner les billes pour créer de nouveaux modules. Il ne reste plus qu'à laisser parler votre imagination!


### Références

Cette expérience est grandement inspirée par ces deux excellents articles de [Lunatech Research](//www.lunatech-research.com/editorials/tags/play) parlant de l'intégration du plugin datatable avec Play:

* [Integrating Play framework with jQuery DataTables](//www.lunatech-research.com/archives/2011/01/28/playframework-jquery-datatables)
* [Ajax DataTables with the Play framework](//www.lunatech-research.com/archives/2011/02/07/ajax-datatables-playframework)

Sans oublier l'article de Tomasz Pęczek qui a été d'une aide précieuse en fournissant une introduction et des exemples clairs et concrets sur l'utilisation d'UI Grid et la définition d'un datasource, dans le contexte d'une application ASP.NET MVC.

* [An early look at jQuery UI Grid in ASP.NET MVC - Data Model](http://tpeczek.blogspot.com/2011/02/early-look-at-jquery-ui-grid-in-aspnet.html)

## Aller plus loin

Pour aller plus loin dans la création de modules, vous pouvez jeter un oeil à [ce tutoriel]() qui explique comment modifier le rendu des pages en utilisant des annotations sur le modèle.