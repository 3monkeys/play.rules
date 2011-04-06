# Validation côté client avec HTML5

La spécification HTML 5 prévoit la possibilité de valider les données d'un formulaire HTML côté client, directement dans le navigateur avant d'envoyer les données vers un serveur.
Il existe un module pour Play qui permet de faire un mapping entre les annotations de validation du modèle (qui servent normalement à valider les données côté serveur) et le rendu HTML, pour intégrer cette fonctionnalité.

Pour activer ce module, après l'avoir téléchargé il suffit d'ajouter cette ligne dans le fichier application.conf :
	module.html5validation=modules/html5validation  

Sur une entité du modèle, on ajoute une annotation de validation pour indiquer qu'un des champs est obligatoire : 

	@Entity  
	public class Album extends Model {  
	  
		@Required  
		public String name;  
	}  

Dans le formulaire HTML, on peut utiliser un nouveau tag, #{input} : 

	#{input for:'album.name', type:'text', id:'name' /}  

Ce tag sera traduit en une balise input classique, avec un attribut indiquant que le champ est obligatoire : 

    <input type="text" name="album.name" value="album?.name" id="name" required="required"/>

Le rendu est le suivant si on valide le formulaire sans remplir le champ obligatoire : 

<!--![Alt "p03_ch01_01"](../rsrc/p03_ch01_01.png?raw=true)-->
![Alt "p03_ch01_01"](https://github.com/3monkeys/play.rules/raw/master/rsrc/p03_ch01_01.png)

Le tag input supporte un grand nombre d'options et plusieurs types d'annotations de validation, comme @Match pour valider une expression régulière ou @Email. Toutes ces options sont décrites dans [cette documentation](http://www.playframework.org/modules/html5validation-1.0/home).

Si votre navigateur ne supporte pas la validation HTML5, aucun soucis car la validation côté serveur sera exécutée dans tous les cas. J'ai testé avec Chrome 10 et Firefox 4 beta 12 et cela fonctionne parfaitement sur ces navigateurs.
