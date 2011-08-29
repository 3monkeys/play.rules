# Jobs et traitements asynchrones

## Les jobs

Play!► propose un système de jobs qui permet de programmer des traitements sans qu'ils soient explicitement demandés par le navigateur.

### Au démarrage de l'application

Le code suivant permet de charger un jeu de données au démarrage de l'application :

~~~ java
@OnApplicationStart
public class PopulateOnStart extends Job {

    public void doJob() {
        // Check if the database is empty
        if(Album.count() == 0) {
            Fixtures.load("init-data.yml");
        }
    }
}
~~~

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

### Effectuer des traitements périodiques

Dans cet exemple, on souhaite recharger les albums toutes les heures à partir de notre fichier yml :

~~~ java 	
@Every("1h")
public class ReloadData extends Job {
    public void doJob() {
        Fixtures.deleteAll();
        Fixtures.load("data.yml");
    }
}
~~~ 

On peut imaginer beaucoup d'applications possibles pour ce genre de traitements périodiques. On pourrait par exemple envoyer un résumé d'activité par mail tous les lundi à l'ensemble des utilisateurs.

Pour définir finement la périodicité on peut utiliser la syntaxe CRON avec l'annotation `@On`. Par exemple, `@On("0 0 8 * * ?")` déclenchera le traitement tous les jours à 8h.
	

## Traitements asynchrones : WebSockets

Il arrive que l'on doive effectuer des traitements longs dans une application web : génération d'un gros rapport PDF, contact d'un serveur distant pour obtenir des informations... 
Lors d'un traitement long, on ne veut pas que le navigateur reste en suspension en attendant la réponse HTTP après qu'on ait lancé la requête. Il pourrait déclencher une erreur de timeout si le temps d'attente était trop long.
Pour résoudre cette problématique, on peut utiliser des traitements asynchrones. Le plus simple pour implémenter ce genre de fonctionnement avec Play!► est d'utiliser les WebSocket HTML5.

Ce procédé crée un mode de communication bidirectionnel entre le navigateur et le serveur. Dès que le serveur aura fini son action, il notifiera le navigateur sans que celui-ci soit obligé de garder une connexion HTTP ouverte pendant toute la durée du traitement. Le serveur est alors capable de pousser une information au client dès qu'il en a besoin ("push" de données).

Un autre cas d'usage habituel pour les communications client-serveur bilatérales et asynchrones est l'implémentation d'applications de 'chat' : lorsqu'on envoie un message à un correspondant, on ne sait pas à quel moment on va recevoir une réponse. Il faut donc que le serveur soit capable de pousser un nouveau message vers notre client à n'importe quel moment. 

Voyons comment implémenter un exemple très simple de communication asynchrone avec cette API :

### Déclaration de la WebSocket dans le navigateur

On crée une nouvelle page dans le dossier app/views. On l'appelle par exemple firstWebSocket.html.

On ajoute cette méthode au contrôleur principal de notre application : 

~~~ java 
public static void firstWebSocket() {
        render();
    }
~~~ 

Ce code javascript utilise l'API WebSocket HTML5 pour ouvrir la communication entre le navigateur et le serveur :

~~~ javascript 
var socket = new WebSocket('@@{AsyncController.asyncMessage()}');
	
    socket.onmessage = function(event) {
        display(event.data);
    }

    var display = function(event) {
       //traitement de l'évenement
    }
~~~

Voici le code complet de notre page :

~~~ html
#{extends 'main.html' /}

<h1>Test</h1>

<div id="message"></div>

#{set 'moreScripts'}
<script>
    var socket = new WebSocket('@@{AsyncController.asyncMessage()}');

    socket.onmessage = function(event) {
        display(event.data);
    }

	var display = function(event) {
        $('#message').append('' + event + '');
    }
</script>
#{/set}
~~~

Lorsqu'un message est reçu, il est affiché dans la div `#message`


### Implémentation côté serveur

On crée l'objet liveStream qui sera une sorte de file d'attente de messages. Dès que la file reçoit un message, l'objet outboud (hérité de la classe `WebSocketController`) est invoqué pour envoyer ce message au client :

~~~ java 
public class AsyncController extends WebSocketController {

    public static EventStream<String> liveStream = new EventStream<String>();

    public static void asyncMessage() {
        while (inbound.isOpen()) {
            String message = await(liveStream.nextEvent());
            if (message != null) {
                outbound.send(message);
            }
        }
    }
}
~~~

On met à jour les routes pour spécifier l'utilisation du protocole `WS` (WebSocket) au lieu de `HTTP` : 

	WS      /asyncTest                                              AsyncController.asyncMessage
	

### Push de données depuis le serveur

Voici le code de notre traitement long (on simule une longue durée avec un sleep): 

~~~ java 
public static void publishEvent(String message) throws IOException {
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Logger.error(e.getMessage());
        }
        AsyncController.liveStream.publish(message);
    }
~~~

On ajoute cette méthode au contrôleur principal de notre application.

Une fois le traitement terminé, on publie un message dans notre file d'attente. 

### Mise en action

Pour tester le fonctionnement de notre WebSocket, on ouvre la page `http://localhost:9000/Application/firstWebSocket`

Pour l'instant la zone de messages est vide.

Dans une console, on peut envoyer un message à l'aide du client HTTP cURL :

	curl -d message=coucou http://localhost:9000/Application/publishEvent

Ceci va déclencher l'action de "push" que l'on a écrit. Si on revient 5 secondes après sur notre page Web, le message "coucou" est apparu!

On voit qu'il est tout à fait possible de pousser des données vers une page, même si celle ci n'a effectué aucune requête. Pas mal non?
Ce mode de fonctionnement peut être utile par exemple dans le cas où on lance des traitements programmés à l'avance à l'aide de jobs (voir le chapitre 3 de cette partie).
Imaginons un job qui mette à jour les données de l'application une fois par jour à heure fixe. A la fin de ce traitement, on pourrait notifier le client que les données ont été modifiées.

Mais il est également possible de lancer l'action depuis la page courante. On ajoute ce lien : 

~~~ html
<a id="longTask" href="#">Long task</a> 
~~~ 

Un clic sur ce lien lance la tache asynchrone :

~~~ javascript 
$(document).ready(function() {
        $('#longTask').click(
            function() {
                $.post('@@{Application.publishEvent()}', { message: 'Ok it works!!! ' } );
            }
        );
    });
~~~
