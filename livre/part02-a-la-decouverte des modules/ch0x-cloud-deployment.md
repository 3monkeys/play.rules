# Créer son propre module

Maintenant que nous avons vu un certain nombre de modules existants, voyons comment créer un module personnel pour répondre à nos propres besoins! 

## Exemple 1 : Amélioration du module CRUD avec JQuery UI

Il y a quelques temps, [la team jQuery UI a annoncé](http://blog.jqueryui.com/2011/02/unleash-the-grid/) qu'ils avaient commencé à sérieusement et officiellement travailler sur le widget Grid de la librairie. Le développement prend place au sein de la branche grid du repository github, le répertoire nous intéressant le plus étant [grid-datamodel](https://github.com/jquery/jquery-ui/tree/grid/grid-datamodel).

Dans cet article, nous nous intéresserons à l'implémentation grid-datamodel et son intégration dans le module CRUD de Play.
Nous nous concentrerons à configurer le widget UI Grid et adapter légèrement le crud généré par Play pour permettre l'utilisation du widget en mode xhr (Ajax).

### Le plan

Le module CRUD de Play! (soit dit en passant, une petite merveille) comporte un ensemble de fichier de templates (views/tags) permettant de gérer et afficher les données du modèle. Dans l'exemple que nous nous apprêtons à mettre en place ici, cela signifie générer une table à partir des données de notre modèle. Le module CRUD par défaut utilise des paramètres pour permettre pagination, recherche/filtre et tri. Play génère alors la table correspondante pour une "page" unique. Ainsi, même si votre modèle comporte des milliers d'objets, Play générera la table correspondante avec seulement une vingtaine de ligne (configurable).

Dans le cadre de cet article, les étapes que l'on devra mettre en place se résumeront à:

1. Configuration d'une application exemple, le but étant de définir des données avec lesquelles travailler.
2. Création de nos contrôleurs et modification des templates utilisé par le module CRUD. Cette étape nous permettra de fournir un "service" dont le retour est une réponse JSON représentant les données de notre modèle.
3. La création d'un module play très simple dont le seul but est de contenir les assets (fichiers statiques) nécessaire au widget grid et de les rendre disponible au reste de l'application via l'utilisation d'une route particulière `/grid/`
4. Configuration du widget grid et du datasource pour utiliser le service fourni par Play.

Le code de cet exemple est disponible ici :

		git clone git://github.com/mklabs/play-ui-grid.git


### Mise en place de l'application exemple

Nous utiliserons un exemple de gestion des fuseaux horaires (timezone locale) pour jouer avec un widget grid. Cela nous permettra facilement d'avoir plusieurs milliers d'enregistrement avec lesquelles travailler.

Mais avant toute chose, créons une nouvelle application play:

	play new crud-grid

Bim, Bam, Boom, c'est fait. Ensuite, nous aurons à configurer la base de données et à configurer notre application pour utiliser le module CRUD. Dans le fichier `conf/application.conf`, il convient de:

* décommenter `db=mem` pour indiquer à Play d'utiliser HSQLDB en mode "in-memory" (le mode filesystem peut aussi être choisi pour garder les données aprés redémarrage de l'appli)
* ajouter la directive d'import du module au niveau du fichier `conf/application.conf`
* importer les routes du module crud au niveau du fichier `conf/routes`

Dans `conf/application.conf` en dessous de la ligne `#------ MODULES ------`:

	module.crud=${play.path}/modules/crud

Dans `conf/routes`, ajout de la directive d'import des routes du module crud:

	# Crud
	GET     /admin	                                module:crud


Nous allons désormais nous occuper de la création de notre modèle. Dans le cadre de cet article, il s'agit de timezones, le modèle est simple: timezoneId, name, language et un offset.

    // http://www.lunatech-research.com/archives/2011/01/28/playframework-jquery-datatables#application
    package models;

    import java.util.Locale;
    import java.util.TimeZone;
    import javax.persistence.Entity;
    import play.db.jpa.Model;

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

Vient ensuite la dernière partie de la mise en place de notre exemple d'application avec la définition d'une classe `Bootstrap`, étendant [Jobs](http://www.playframework.org/documentation/1.1/jobs) du framework Play et annotée avec `@OnApplicationStart`. Ceci aura pour effet au chargement de votre application d'exécuter la méthode `doJob` qui s'occupera de nous fournir un ensemble conséquent de données avec lesquelles travailler.

	// http://www.lunatech-research.com/archives/2011/01/28/playframework-jquery-datatables#application
    package controllers;

    import java.util.Locale;
    import java.util.TimeZone;
    import models.LocalisedTimeZone;
    import play.jobs.Job;
    import play.jobs.OnApplicationStart;

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

Okay, notre modèle est prêt à être utilisé. Ils nous manque encore le contrôleur CRUD pour afficher le tout.

### Contrôleurs, et modifications des vues du module CRUD

#### Contrôleurs

Penchons nous désormais sur le code du contrôleur, la partie de l'application qui permet d'offrir à nos vue les données du modèle sous format JSON (nous voulons faire de UI Grid un consommateur de ce "service").

Encore une fois, cette exemple est fortement inspiré du travail de Lunatech. Cependant, dû à l'utilisation de jQuery UI Grid en lieu et place de datatable, le code du contrôleur est devenue bien plus simple:

	package controllers;

	import java.util.List;

	import play.db.Model;

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

En effet, UI Grid ou Datatable n'attendent pas exactement le même retour JSON, la même "enveloppe" autour de vos données. Et UI Grid sur ce point est beaucoup (beaucouuuuuuup) plus simple dans son approche qui attend un tableau d'objets. Parfait, c'est exactement le format JSON renvoyé par `renderJSON`.

Cette classe `CrudJson` est conçus pour être étendue par les véritables contrôleurs de notre application. Dans cette exemple, il s'agira de `LocalisedTimeZone`.

	package controllers;
	public class LocalisedTimeZones extends CrudJson {}

Deux lignes... Je sais pas vous, mais il me plaît beaucoup ce contrôleur!

Il nous reste une étape à ne pas oublier avec la configuration des routes des contrôleurs. Ici, nous ne disposons que d'un seul contrôleur. Aussi, nous pourrions nous contenter de:

	GET /localeOrWhateverName.json LocalisedTimeZone.listJson

Dans la plupart des cas, cela suffirait à répondre à nos besoin. Ceci dit, dans la pratique, les applications ne disposant que d'un modèle/contrôleur ne sont pas légion, et pour chaque objet de notre modèle, une route serait nécessaire. Ceci étant dit, il existe également la méthode suivante, se reposant sur la convention de nommage de vos contrôleurs et permettant une approche un peu plus DRY:

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

Vous pouvez rapidement avoir un aperçu des routes disponibles en générant une erreur 404. Par défaut, Play vous renverra une page 404 particulière listant toutes les routes possibles pour votre application: [localhost:9000/coucoujsuispasla](http://localhost:9000/coucoujsuispasla)

Un tour à l'adresse [localhost:9000/admin/](http://localhost:9000/admin/) devrait vous donner:

![Liste des ObjectType](/play/adminpage.png)

Page à partir de laquelle nous pouvons accéder à la liste des Timezone. Par défaut, la vue list du module crud n'affiche qu'une colonne contenant le résultat de la méthode `toString()` de l'objet.

#### Vues

Maintenant, jetons un œil à notre vue custom list.html. Il s'agit de la vue responsable de la génération de notre table HTML (`app/views/CRUD/list.html`). Le module CRUD offre un moyen simple et efficace de "surcharger" des composants du module comme les views ou tags avec la commande `play crud:ov --template CRUD/list`. Cela indiquera à Play de vous fournir une copie conforme de ce template dans votre propre répertoire, que l'on peut ensuite modifier à souhait. Aucune configuration supplémentaire n'est à apporter, le système de module implique que Play cherche d'abord toute ressource au sein du répertoire de votre appli, puis ensuite au sein des modules configurés. Pratique, puissant, flexible, élégant, le système de module de play est une petite merveille mais sort un peu du sujet de l'article ici présent :)

Pour modifier la vue list.html, play propose la commande `play crud:ov`:

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

Toutes les ressources sont récupérées à partir du chemin `/grid/` qui est une route définie par le module crud-grid. Il prendra soin de faire correspondre toute ressources statiques du répertoire `/app/public/` au chemin `/grid/`. Il aura aussi pour rôle de contenir tout code relatif à l'intégration du widget grid (comme la définition du contrôleur special CrudJson qui nous permet de renvoyer une représentation JSON et grid-compliant de notre modèle).

    play new-module crud-grid

Cette commande vous permettra de rapidement créer la structure de départ du module que l'on s'apprête à créer. Dans cette exemple, le module sera créé à la racine de notre application.

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

Personnellement, je trouve le système de module de play particulièrement brillant et permettant vraiment de modulariser notre développement. Bien sûr, la plupart des modules que l'on rencontrera seront des modules que l'on peut appeller "techniques", cad permettant ou facilitant l'intégration de couche "techniques" que ne propose pas Play par défaut (gae, sienna, pdf, etc.). Mais on peut imaginer que, dans le cadre d'une application assez large pour s'y prêter, l'utilisation de module pour compartimenter "fonctionnellement" l'application est possible (un module admin, un module gestion, un module facturation, etc.).

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

Dans l'idéal, ce document ready devrait être externaliser dans un fichier externe, cependant, dans le cadre de cet exercice, il sera défini en inline au sein du tag `#{set 'js'}` du template `àpp/views/CRUD/list`

Le grid aura alors les fonctionnalités et possibilités suivantes:

* Les données sont récupérées en passant par des appelx xhr (pas de rechargement de page)
* la pagination est gérée en interceptant les clicks des liens de pagination (les liens générés par le CRUD de play) pour effectuer une nouvelle requête au datasource en passant les paramètres correspondant: `datasource.get({page: page});`
* la fonctionnalité de filtre est supportée. Tout comme les liens, l'event submit du formulaire est intercepté pour demander au datasource de faire une nouvelle requête en passant une fois encore les paramètres correspondants et attendues par le module Play: `datasource.get({search: $.trim($(this).find('input[name="search"]').val())});`

Un tour à l'adresse [http://localhost:9000/admin/localisedtimezones](http://localhost:9000/admin/localisedtimezones) devrait vous donner:
![Crud UI Grid](/play/crud-grid.png)

Le tri me direz-vous? Et bien, ce sera sûrement l'occasion de faire un second article sur ce sujet. Je me suis arrêté à ce niveau là au niveau de l'expérimentation. De même, les fonctionnalités de pagination et filtre ne sont gérées que partiellement car cela demanderait un peu plus de travail pour gérer le tout correctement. Les liens de pagination ne sont pas mis à jour à chaque changement de page par exemple. Quoi qu'il en soit, cela représente une bonne occasion de voir ce que peut apporter une couche d'abstraction des données au niveau JS: On ne manipule pas directement $.ajax pour effectuer les changements de page ou prise en compte du filtre, on ne fait que demander au datasource (`datasource.get({page: page})`) de le faire pour nous, la table étant automatiquement mis à jour par le widget. Big win.

![Crud UI Grid filtered](/play/crud-grid-filtered.png)


Il faut savoir que UI Grid est prévue par la team jQuery pour sortir pour ou aprés la version 2.0, donc ce n'est pas encore pour tout de suite. Mais on peut faire confiance à la team jQuery UI pour nous sortir un super widget. Ils sont vraiment en train de faire les choses bien. Pour ceux souhaitant en savoir plus, je vous invite à vous attarder sur le [wiki consacré au développement de jQuery UI](http://wiki.jqueryui.com/) et aux parties concernant [UI Grid](http://wiki.jqueryui.com/w/page/34246941/Grid). La roadmap est très encourageante, et le travail de spécification est impressionnant. Ils n'en sont pour l'instant qu'à la toute première itération (grid-markup, grid-datamodel, grid-type), mais le résultat est prometteur.

Je suis très enthousiaste concernant cette annonce et ce nouveau widget en développement. non pas que, datatable ou jqGrid soient mauvais.. Loin de là, ils sont par ailleurs utilisés et analysés pour la conception d'UI Grid, mais la perspective d'avoir un widget officiel, complétement intégré dans la librairie et disposant d'une API claire et bien foutue ne me laisse pas indifférent...

### Références
Cette expérience est grandement inspirée par ces deux excellents articles de [Lunatech Research](//www.lunatech-research.com/editorials/tags/play) parlant de l'intégration du plugin datatable avec Play:

* [Integrating Play framework with jQuery DataTables](//www.lunatech-research.com/archives/2011/01/28/playframework-jquery-datatables)
* [Ajax DataTables with the Play framework](//www.lunatech-research.com/archives/2011/02/07/ajax-datatables-playframework)

Sans oublier l'article de Tomasz Pęczek qui a été d'une aide précieuse en fournissant une introduction et des exemples clairs et concrets sur l'utilisation d'UI Grid et la définition d'un datasource, dans le contexte d'une application ASP.NET MVC.

* [An early look at jQuery UI Grid in ASP.NET MVC - Data Model](http://tpeczek.blogspot.com/2011/02/early-look-at-jquery-ui-grid-in-aspnet.html)

Je ne m'étend pas dans ce chapitre sur l'utilité ou non de récupérer les données à afficher en passant par des appels xhr, ou simplement en appliquant un widget grid (datatable, jQGrid, etc.) à une table contenant l'ensemble des données à afficher (permettant au widget de gérer pagination, recherche et tri de façon autonome - sans aller retour serveur). Dans la plupart des cas, la dernière solution est sûrement la meilleure. Tout dépend de la taille de votre modèle et de son "évolutivité". Si les données à afficher se comptent en plusieurs milliers, alors la solution xhr semble être plus appropriée. Je vous laisse lire [le premier article](http://www.lunatech-research.com/archives/2011/01/28/playframework-jquery-datatables) de Lunatech Research, il y est fait une très bonne analyse concernant ce point.