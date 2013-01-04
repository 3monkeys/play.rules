#Charger des données au démarrage

>*Qu'allons nous voir ?*

>	- *Comment pré-charger des données au démarrage de l'application ?*

>*... Très pratique à l'usage*


A chaque fois que vous allez modifier vos modèles, vous allez perdre vos données. Donc nous allons voir comment charger un jeu de données au démarrage pour éviter d'avoir à tout re-saisir à chaque fois.

Dans le répertoire `/conf`, créez un fichier `initial-data.yml` avec les données suivantes :

	# Categories

	categories:

	    - &category1 !!models.Category
	        label:   Javascript

	    - &category2 !!models.Category
	        label:   Java

	    - &category3 !!models.Category
	        label:   Coffeescript

	# Bookmarks

	bookmarks:

	    - !!models.Bookmark
	        title:    CoffeeBean
	        url:      http://coffeebean.loicdescotte.com/
	        category: *category2

	    - !!models.Bookmark
	        title:    K33g_org
	        url:      http://k33g.github.com/
	        category: *category1


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
		            
		            Map<String,List<Object>> all = 
		            	(Map<String,List<Object>>)Yaml.load("initial-data.yml");

		            // Insert categories first
		            Ebean.save(all.get("categories"));

		            Ebean.save(all.get("bookmarks"));
		            
		        }
		    }
		    
		}
		
	}
```

Enfin, modifier le fichier `conf/application.conf` et décommenter la ligne suivante, ie :

    # global=Global

devient

    global=Global

Cette manipulation permet d'activer votre nouvelle classe au démarrage de l'application.

Vous pouvez maintenant rafraîchir votre page pour vérifier que les données sont bien chargées au démarrage de votre application.



