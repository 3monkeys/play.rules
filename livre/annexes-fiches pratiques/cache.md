# Utilisation d'un cache

## Mise en cache des méthodes du contrôleur

Si une méthode d'un contrôleur dont le résultat varie peu est souvent appelée, on peut mettre en cache son résultat pour économiser des ressources machine :

~~~ java
	@CacheFor("10mn")
	public static void superMethod() {
		List<Album> albums = Album.findAll();
		render(albums);
	}
~~~

Le code ci dessus produira le même résultat à chaque appel pendant 10 minutes.

On peut faire la même chose en appellant `response.cacheFor` : 
	
~~~ java       
	public static void proxyCache() {
		List<Album> albums = Album.findAll();
			if(iWant==true){
				response.cacheFor("1h");
			}
		render(albums);	}
~~~


## Utilisation d'un cache devant la base de données

Si on fait beaucoup de lectures consécutives dans la base de données, on peut s’appuyer sur l’API de caching de Play pour soulager la base sans sacrifier l’aspect stateless du serveur : le fait qu’une donnée soit présente en cache ou non ne changera pas le comportement de l’application, seulement sa réactivité.

Cet exemple montre le chargement d'une liste de produits. Si la liste est en cache, on la récupère directement. Sinon on fait une requête en base de données et on dépose la liste des produits dans le cache pour une durée de 30 minutes.

~~~ java
	public static void allProducts() { 
		List<Product> products = Cache.get("products", List.class);                     
		if(products == null) { 
	        	products = Product.findAll(); 
	        	Cache.set("products", products, "30mn"); 
	     	}
			render(products); 
	} 
~~~

Pour invalider le cache, il suffit de supprimer les données de cette manière :

~~~ java
	Cache.delete("products");
~~~
	
Pour être sur que l'objet soit supprimé avant la fin de la requête, on peut utiliser la méthode `safeDelete` :

~~~ java
	Cache.safeDelete("products");
~~~

## Choisir une implémentation de cache

Play fournit une implémentation de cache par défaut pour le développement et pour les environnements mono-serveur. Il également possible d'utiliser `Memcached` pour les "plus gros" besoins en environnements distribués.
Pour cela, on modifie le fichier `application.conf` pour renseigner les paramètres d'installation du cache :

	memcached=enabled
	memcached.host=127.0.0.1:11211

Pour utiliser plusieurs instances de cache (cache distribué) : 

	memcached=enabled
	memcached.1.host=127.0.0.1:11211
	memcached.2.host=127.0.0.1:11212