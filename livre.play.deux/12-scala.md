#Coder son application Play!> en Scala

##Intro

Il s'agit pas de refaire un tuto entier sur Scala ou de redétailler toute l'api Play en version Scala... 

Par contre nous allons expliquer ce que ça apporte d'utiliser Scala à travers quelques exemples, les différences avec la version Java et surtout "pourquoi Scala colle à l'esprit de Play". 
Ce chapitre peut donc être vu comme un chapitre bonus, sans lien avec le tuto "Bookmarks", pour vous donner envie de découvrir Scala.

##Liens entre Stateless et programmation fonctionnelle

Si vous avez lu cet ebook depuis le début, vous savez que Play!> est basé sur une architecture sans état côté serveur.

La programmation fonctionnelle permet de pousser ce concept à un niveau maximum en évitant d'utiliser des variables mutables.
Les variables mutables sont des variables dont la valeur peut changer au cours du temps. Prenez l'exemple d'un compteur que l'on incrémente.

Play!> ne conserve aucun état entre 2 requêtes HTTP. Cependant, au niveau d'une requête, une variable mutable dans une méthode constitue quelque chose qui se rapproche d'un état. 
Techniquement on ne parle pas du même type d'état, mais on peut rapprocher les 2 concepts...
Si les accès concurrents (sur plusieurs threads) sont mal gérés, une variable mutable peut être source d'erreur. Si un client A et un client B accèdent en même temps à une telle variable et que l'un d'entre eux la modifie, que se passe-t-il? La programmation fonctionnelle permet d'éviter ce genre de soucis.

Exemple du calcul de la somme des chiffres d'une liste en programmation itérative :

```scala
val numbers: List(1, 2, 4)
var total = 0

for(i <- xs){
	total +=  i
}		

//total = 7
```

Si le total est un membre de classe susceptible d'être lu et modifié par plusieurs personnes en même temps, on va devoir jouer avec les locks pour éviter les problèmes... en plus de perdre en performance (les traitements seront bloquants) le code risque de devenir très vite compliqué pour pas grand chose.

Voici un exemple du calcul de la somme des chiffres d'une liste en programmation fonctionnelle :

```scala
val numbers: List(1, 2, 4)

val total = sum(0, numbers) //total = 7

def sum(total: Int, xs: List[Int]) : Int ={
  if(xs.isEmpty) total
  else sum(total+xs.head, xs.tail)
}

```

On dit d'un code basé uniquement sur des données immutables qu'il est sans effet de bords : aucun risque de fausser un résultat en affectant une valeur non désirée, ou en inversant l'ordre des affectations... Ici on calcule la somme de manière récursive (head renvoie le premier élément de la liste, tail tous les autres).
Le total intermédiaire n'est jamais stocké dans une variable, il est local à chaque itération de la fonction.

Scala pousse bien sur à utiliser la deuxième solution.

Les ordinateurs possèdent un nombre toujours croissants de coeurs, les programmes optimisés utilisent donc de plus en plus d'accès concurrents. L'API Scala étant basée sur ces principes, elle permet d'en bénéficier directement de la force de la programmation parallèle.

Voici comment on filtre une liste en Scala :

```scala
	val result = data.filter(line => line.contains("keyword"))
```

Pour faire la même avec un traitement parallèle il suffit d'ajouter `.par` après la référence à notre liste de données :

```scala
	val result = data.par.filter(line => line.contains("keyword"))
```


##Iteratee 

Aujourd’hui on voit de plus de plus de sites web dont les données affichées se rafraîchissement en temps réel. Plutôt que de lancer des requêtes au serveur toutes les x secondes, il est possible de d'envoyer des données en "push", du serveur vers le navigateur. Pour cela il existe plusieurs solutions dont Comet, WebSocket et SSE. WebSocket et SSE (Server Sent events) font partie de la spécification HTML5 et nécessitent donc un navigateur récent. Comet (ou long polling) permet via différentes techniques de pousser des données vers le navigateur à partir d'une première connexion (une requête du navigateur) dont la durée est infinie.

Pour cela on utilise HTTP de manière asynchrone. Pour ce type de requêtes, Play!> va traiter la demande, libérer les threads de connexion, puis rappeler le client lorsque les données seront disponibles. Ceci a 2 avantages : tout est traité de manière non bloquante (le navigateur n'est pas bloqué en attente d'un résultat si on utilise les WebSockets par exemple) et on y gagnes en consommation de ressources (moins de threads utilisés sur le serveur).

Play propose une API nommée Iteratee qui permet de manipuler des flux de données de manière totalement asynchrone afin de répondre à ces problématiques.

###Un exemple avec Comet

Dans cet exemple nous allons voir commencer mixer 2 flux Twitter pour les afficher en temps réeel, à l'aide de l'API Iteratee.

Vous pouvez voir la solution complète en récupérant ce [mini project](https://github.com/loicdescotte/Play2-MixedTweets)

###Controleur

Définissons une méthode `comet` dans notre controleur :

```scala
def comet(query1: String, query2: String) = Action {

  lazy val results1 = getStream(query1)

  lazy val results2 = getStream(query2)

  //pipe result 1 and result 2 and push to comet socket	
  Ok.stream(results1 >- results2 &> Comet(callback = "parent.messageChanged"))
  
}
```

`query1` et `query2` sont de simples chaînes de caractères utilisées pour lancer une recherche, comme "java" ou "ruby".

`results1` et `results2` vont contenir les résultats des recherches Twitter correspondant.

Dans la dernière ligne, `Ok.stream` va envoyer une réponse HTTP au client sous forme de chunks, c'est à dire par morceaux. Cela signifie qu'au lieu d'une réponse complète, la navigateur va recevoir des morceaux de réponse progressivement.

`results1 >- results2` va effectuer un "pipe", pour mixer les réponses des 2 recherches. `&> Comet(callback = "parent.messageChanged")` va pousser le tout sur une socket Comet.

Voyons maintenant comment récupérer les résultats de Twitter. Pour cela nous utiliserons des `enumerators`.
Les enumerators font partie de l'API Iteratee de Play!>. 

Il est important de savoir que dans cette API de manipulation des données  

 * Iteratee représente un consommateur de données asynchrone
 * Enumerator représente un fournisseur de données asynchrone

Les enumerators permettent donc de fournir des données à un iteratee qui va les consommer de manière asynchrone et non bloquante.
Cela peut paraître compliqué mais ne vous inquiétez pas, le framework fera tout ce travail pour vous lorsque vous combinerez les enumeratos avec l'objet Comet.

```scala
private def getStream(query: String) = {
	Enumerator.fromCallback[String](() => 
		Promise.timeout(WS.url("http://search.twitter.com/search.json?q="+query+"&rpp=1").get(), 1000 milliseconds).flatMap(_.map { response =>
			(response.json \\ "text").headOption.map(query + " : " + _.as[String])
		})
	)
}
```

Ce code dit que toutes les secondes, on va demander les nouveaux tweets correspondant à nos requêtes.
`Enumerator.fromCallback` attend une fonction qui retourne une "promesse" de réponse. Quand cette réponse sera prête, elle sera poussée (de manière asynchrone) à la socket comet. On combine ceci avec `Promise.timeout` pour demander les nouveaux résultats à Twitter toutes les secondes. Nous obtenons alors une promesse de réponse, et pas une réponse! C'est pour ça qu'on utilise `flatMap` pour récupérer directement la réponse contenue dans la promesse (si elle existe).

Un autre trick, `response.json \\ "text"` aide à parser la réponse JSON envoyée par Twitter à en extraire le contenu.

#### Adapter le contenu avec un enumeratee

Un enumeratee est une sorte d'adaptateur dans l'API Iteratee. Nous allons utiliser ce concept pour transformer les résultats envoyés au navigateur. Voyons un exemple très simple : envoyer tous les tweets en majuscule.

```scala
val upperCase = Enumeratee.map[String] {
    tweet => tweet.map(_.toUpperCase)
}
```
Note : En scala, '_'permet de représenter un élément courant. On aurait aussi pu écrire `tweet.map((tweet :String) => tweet.toUpperCase)`
}

Pour insérer cette transformation dans le pipe juste avant d'envoyer le contenu à notre socket Comet, nous devons simplement modifier notre code comme ceci :

```scala
Ok.stream(results1 >- results2 &> upperCase &> Comet(callback = "parent.messageChanged"))
```

Note : `&>` est juste un alias pour la méthode "through".

Enfin on a plus qu'à utiliser la technique "iframe hack" to démarrer le streaming dans le navigateur (voir `index.scala.html` dans le projet).

Enjoy!!

Si vous voulez en savoir plus sur les iteratees je vous conseille [cet article](https://gist.github.com/3727850) (en français). 

### D'autres exemples intéressants 

* [Un jeu d'échecs](http://en.lichess.org/games) "real time" codé avec Play!> 
* [Affichage d'une carte en streaming](http://wiki-growth.herokuapp.com) - [Explicitations et code](http://yannexpress.blogspot.de/2012/08/handling-data-streams-with-play2-and.html)
* [ReactiveMongo](http://reactivemongo.org/), un driver MongoDB asynchrone et non bloquant

Note : ces API [existent en Java](http://www.playframework.org/documentation/2.0.4/JavaAsync) mais apportent moins de souplesse et de lisibilité que leur équivalent Scala à cause des faiblesses du langage Java. Elles sont donc plus souvent utilisées en Scala.
