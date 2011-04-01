# Validation c�t� client avec HTML5

La sp�cification HTML 5 pr�voit la possibilit� de valider les donn�es d'un formulaire HTML c�t� client, directement dans le navigateur avant d'envoyer les donn�es vers un serveur.
Il existe un module pour Play! qui permet de faire un mapping entre les annotations de validation du mod�le (qui servent normalement � valider les donn�es c�t� serveur) et le rendu HTML, pour int�grer cette fonctionnalit�.

Pour activer ce module, apr�s l'avoir t�l�charg� il suffit d'ajouter cette ligne dans le fichier application.conf :
	module.html5validation=modules/html5validation  

Sur une entit� du mod�le, on ajoute une annotation de validation pour indiquer qu'un des champs est obligatoire : 

	@Entity  
	public class Album extends Model {  
	  
		@Required  
		public String name;  
	}  

Dans le formulaire HTML, on peut utiliser un nouveau tag, #{input} : 

	#{input for:'album.name', type:'text', id:'name' /}  

Ce tag sera traduit en une balise input classique, avec un attribut indiquant que le champ est obligatoire : 

view plaincopy to clipboardprint?
<input type="text" name="album.name" value="album?.name" id="name" required="required"/>  

Le rendu est le suivant si on valide le formulaire sans remplir le champ obligatoire : 

![Image](/img1.png)

Le tag input supporte un grand nombre d'options et plusieurs types d'annotations de validation, comme @Match pour valider une expression régulière ou @Email. Toutes ces options sont décrites dans cette documentation.

Si votre navigateur ne supporte pas la validation HTML5, aucun soucis car la validation côté serveur sera exécutée dans tous les cas. J'ai testé avec Chrome 10 et Firefox 4 beta 12 et cela fonctionne parfaitement sur ces navigateurs.
