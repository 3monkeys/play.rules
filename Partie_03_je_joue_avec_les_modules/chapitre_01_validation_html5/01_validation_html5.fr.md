<<<<<<< HEAD
ï»¿# Validation cÃ´tÃ© client avec HTML5

La spÃ©cification HTML 5 prÃ©voit la possibilitÃ© de valider les donnÃ©es d'un formulaire HTML cÃ´tÃ© client, directement dans le navigateur avant d'envoyer les donnÃ©es vers un serveur.
Il existe un module pour Play! qui permet de faire un mapping entre les annotations de validation du modÃ¨le (qui servent normalement Ã  valider les donnÃ©es cÃ´tÃ© serveur) et le rendu HTML, pour intÃ©grer cette fonctionnalitÃ©.

Pour activer ce module, aprÃ¨s l'avoir tÃ©lÃ©chargÃ© il suffit d'ajouter cette ligne dans le fichier application.conf :
	module.html5validation=modules/html5validation  

Sur une entitÃ© du modÃ¨le, on ajoute une annotation de validation pour indiquer qu'un des champs est obligatoire : 
=======
# Validation côté client avec HTML5

La spécification HTML 5 prévoit la possibilité de valider les données d'un formulaire HTML côté client, directement dans le navigateur avant d'envoyer les données vers un serveur.
Il existe un module pour Play! qui permet de faire un mapping entre les annotations de validation du modèle (qui servent normalement à valider les données côté serveur) et le rendu HTML, pour intégrer cette fonctionnalité.

Pour activer ce module, après l'avoir téléchargé il suffit d'ajouter cette ligne dans le fichier application.conf :
	module.html5validation=modules/html5validation  

Sur une entité du modèle, on ajoute une annotation de validation pour indiquer qu'un des champs est obligatoire : 
>>>>>>> 820c7cdbb0c31f8c26b134cd31bbc93c172e516f

	@Entity  
	public class Album extends Model {  
	  
		@Required  
		public String name;  
	}  

Dans le formulaire HTML, on peut utiliser un nouveau tag, #{input} : 
view plaincopy to clipboardprint?
#{input for:'album.name', type:'text', id:'name' /}  

Ce tag sera traduit en une balise input classique, avec un attribut indiquant que le champ est obligatoire : 

view plaincopy to clipboardprint?
<input type="text" name="album.name" value="album?.name" id="name" required="required"/>  

Le rendu est le suivant si on valide le formulaire sans remplir le champ obligatoire : 
<<<<<<< HEAD
![Image](/img1.png)

Le tag input supporte un grand nombre d'options et plusieurs types d'annotations de validation, comme @Match pour valider une expression rÃ©guliÃ¨re ou @Email. Toutes ces options sont dÃ©crites dans cette documentation.

Si votre navigateur ne supporte pas la validation HTML5, aucun soucis car la validation cÃ´tÃ© serveur sera exÃ©cutÃ©e dans tous les cas. J'ai testÃ© avec Chrome 10 et Firefox 4 beta 12 et cela fonctionne parfaitement sur ces navigateurs.
=======
![Image](img1.png)

Le tag input supporte un grand nombre d'options et plusieurs types d'annotations de validation, comme @Match pour valider une expression régulière ou @Email. Toutes ces options sont décrites dans cette documentation.

Si votre navigateur ne supporte pas la validation HTML5, aucun soucis car la validation côté serveur sera exécutée dans tous les cas. J'ai testé avec Chrome 10 et Firefox 4 beta 12 et cela fonctionne parfaitement sur ces navigateurs.
>>>>>>> 820c7cdbb0c31f8c26b134cd31bbc93c172e516f
