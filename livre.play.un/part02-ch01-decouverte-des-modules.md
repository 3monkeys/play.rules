# Découverte des modules

Il existe un grand nombre de modules complémentaires pour ajouter des fonctionnalités à Play!►. Nous allons en voir quelques exemples.

## Validation côté client avec HTML5

La spécification HTML 5 prévoit la possibilité de valider les données d'un formulaire HTML côté client, directement dans le navigateur avant d'envoyer les données vers un serveur.
Il existe un module pour Play!► qui permet de faire un mapping entre les annotations de validation du modèle (qui servent normalement à valider les données côté serveur) et le rendu HTML, pour intégrer cette fonctionnalité.

Pour activer ce module, après l'avoir téléchargé il suffit d'ajouter cette ligne dans le fichier dependencies.yml, dans la section `require`:

    - play -> html5validation 1.2


Sur une entité du modèle, on ajoute une annotation de validation pour indiquer qu'un des champs est obligatoire : 

~~~ java
	@Entity
	public class Album extends Model {

	    @Required
	    public String name;
	}
~~~  

Dans le formulaire HTML, on peut utiliser un nouveau tag, #{input} : 

~~~ html
	#{input for:'album.name', type:'text', id:'name' /}  
~~~

Ce tag sera traduit en une balise input classique, avec un attribut indiquant que le champ est obligatoire : 

~~~ html
    <input type="text" name="album.name" value="album?.name" id="name" required="required"/>
~~~

Le rendu est le suivant si on valide le formulaire sans remplir le champ obligatoire : 

![Alt "p03_ch01_01"](rsrc/p03_ch01_01.png)

Le tag input supporte un grand nombre d'options et plusieurs types d'annotations de validation, comme @Match pour valider une expression régulière ou @Email. Toutes ces options sont décrites dans [cette documentation](http://www.playframework.org/modules/html5validation-1.0/home).

Si votre navigateur ne supporte pas la validation HTML5, aucun soucis car la validation côté serveur sera exécutée dans tous les cas. J'ai testé avec Chrome 10 et Firefox 4 beta 12 et cela fonctionne parfaitement sur ces navigateurs.

[Home page du module HTML5 Validation](http://www.playframework.org/modules/html5validation)

## Elastic Search

Elastic Search est un framework construit au dessus de [Lucene](http://lucene.apache.org/java/docs/index.html).
Il offre la possibilité d'effectuer des recherches "à la google" sur nos entités métier. Pour que cela fonctionne il suffit de les annoter avec `@ElasticSearchable`.

Le moteur Lucene permet par exemple de faire des recherches :

- tolérantes aux fautes de frappes ou d'orthographe
- basées sur un dictionnaire de synonymes (on peut taper indifféremment 'rue' ou 'avenue' pour rechercher une adresse)
- basées sur la prononciation des mots (recherche phonétique)
- ...

Elastic Search est basé sur une architecture REST et est capable d'indexer du contenu sous plusieurs formes, notamment à partir de flux JSON. Il offre une grande souplesse d'utilisation car il ne demande de respecter un schéma pour les données, contrairement à une base de données relationnelle. En mode production il est capable de fonctionner en multi-instances. L'index est réparti sur plusieurs noeuds, qui peuvent être répliqués pour résister aux pannes. Ce genre d'architecture est particulièrement adapté aux environnements cloud et permet de répondre à de fortes charges et de grosses volumétries sans sacrifier les performances.

Avec l'API Java fournie par Elastic Search, on peut écrire ce genre de requêtes :

~~~ java
	QueryBuilder qb = filteredQuery(
	            termQuery("name", name),
	            rangeFilter("nbVotes")
	                .from(100)
	                .to(90)
	            );
~~~	

Mais il n'est pas nécessaire de maitriser l'API Elastic Search pour profiter de ce module : celui ci propose également un mode inspiré du module CRUD. En héritant de la classe `ElasticSearchController` et en utilisant l'annotation du même nom pour indiquer le type d'entité à rechercher, on peut générer tous le code et les écrans nécessaires pour la création et la recherche de nos entités :

~~~ java
	@ElasticSearchController.For(Album.class)
	public class AlbumSearch extends ElasticSearchController {

	}
~~~

Si vous souhaitez conserver le comportement par défaut du module, rien à ajouter dans cette classe! Mais comme pour le module CRUD vous pouvez surcharger ce comportement si vous le désirez.
On peut également surcharger les vues et créer de nouveaux templates en créant un répertoire ELASTIC_SEARCH sous `app/views` dans l'arborescence de notre application.

Vous pouvez voir ce module en action dans [cette vidéo](http://www.youtube.com/watch?v=pHpvNKO1mTE&feature=player_detailpage)

[Home page du module Elastic Search](http://www.playframework.org/modules/elasticsearch-0.0.3/home)
  
## Et plein d'autres modules!

Il existe un tas d'autres modules et de nouveaux arrivent fréquemment grâce à la communauté des développeurs Play!►.

On trouve par exemple :

- [GAE](http://www.playframework.org/modules/gae), pour déployer son application sur Google APP Engine, le cloud de Google
- [Morphia](http://www.playframework.org/modules/morphia), pour utiliser très simplement la base de données NoSQL MongoDB (base orientée documents)
- [Tabula Rasa](http://www.playframework.org/modules/tabularasa-0.2/home), pour intégrer le plugin DataTables de JQuery au CRUD
- [OAuth](http://www.playframework.org/modules/oauth), pour authentifier des utilisateurs auprès de fournisseurs d’identité OAuth, comme Twitter ou Google
- [Pdf](http://www.playframework.org/modules/pdf), pour générer des documents... PDF!
- [Akka](http://www.playframework.org/modules/akka), pour faciliter la programmation concurrente, en utilisant le modèle des acteurs
- Et beaucoup d'autres... 

La liste complète des modules disponibles est consultable [ici](http://www.playframework.org/modules).

