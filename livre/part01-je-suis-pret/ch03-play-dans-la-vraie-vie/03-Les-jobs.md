# TODO

##Charger des données au démarrage de l'application

Le code suivant permet de charger un jeu de données au démarrage de l'application :

	@OnApplicationStart
	public class PopulateOnStart extends Job {
 
    	public void doJob() {
        	// Check if the database is empty
        	if(Album.count() == 0) {
            	Fixtures.load("init-data.yml");
        	}
    	}
 	}

Pour que ça fonctionne il suffit de déposer le fichier init-data.yml dans le répertoire conf/

Voici un exemple de fichier yml :

	Artist(joe) :
	    name: joe

	Album(coolAlbum) :
	    name: coolAlbum
	    artist: joe
	    releaseDate: 2010-11-12 00:00:00
	    genre: ROCK
    
	Album(superAlbum) :
	    name: superAlbum
	    artist: joe
	    releaseDate: 2011-10-09 00:00:00
	    genre: ROCK

##Effectuer des traitements périodiques
