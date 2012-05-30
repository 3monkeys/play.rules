#Charger des données au démarrage

	/* --- Qu'allons nous voir ? ---

		- Comment pré-charger des données au démarrage de l'application ?

		... Très pratique à l'usage
	*/

A chaque fois que vous allez modifier vos modèles, vous allez perdre vos données. Donc nous allons voir comment charger un jeu de données au démarrage pour éviter d'avoir à tout re-saisir à chaque fois.

Dans le répertoire `/conf`, créez un fichier `initial-data.yml` avec les données suivantes :

	# Categories

	categories:

	    - !!models.Category
	        label:   Javascript

	    - !!models.Category
	        label:   Java

	    - !!models.Category
	        label:   Coffeescript

Puis à la racine de `/app`, créez une classe `Global.java` avec le code suivant :


```java

	import play.*;
	import play.libs.*;

	import java.util.*;

	import com.avaje.ebean.*;

	import models.*;

	public class Global extends GlobalSettings {
		
		public void onStart(Application app) {
		    InitialData.insert(app);
		}
		
		static class InitialData {
		    
		    public static void insert(Application app) {
		        if(Ebean.find(Category.class).findRowCount() == 0) {
		            
		            Map<String,List<Object>> all = (Map<String,List<Object>>)Yaml.load("initial-data.yml");

		            // Insert categories first
		            Ebean.save(all.get("categories"));
		            
		        }
		    }
		    
		}
		
	}
```

Vous pouvez rafraîchir votre page pour vérifier.



