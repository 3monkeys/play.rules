#Introduction - Pourquoi Play!>

Play Framework dans sa version 1 a apporté un vent de révolution au monde des frameworks Web Java.

Les principaux points d'innovation étaient à l'époque 

 * Une productivité grandement améliorée (notamment via déploiement à chaud des modifications de code)
 * Une architecture simplifiée et centrée sur les modèles (tout en facilitant l'évolutivité et la maintenabilité)
 * Une "coeur" modulaire et extensible
 * Un framework basé sur REST
 * Un framework permettant de monter très facilement en charge (scalabilité)
 * Et enfin une architecture entièrement stateless côté serveur

L'architecture stateless consiste à ne garder aucun état sur le serveur. Une telle architecture propose de nombreux avantages. Si notre application se trouve derrière un load balancer, on peut ajouter un serveur, en couper un pour le mettre à jour... sans aucune conséquence pour le client qui ne risque pas de perdre sa session pendant l'opération... un utilisateur pourra être dirigé aléatoirement vers un serveur ou un autre à chaque requête, pas besoin de mettre en place une session HTTP distribuée (usine à gaz...)

Cela va de paire avec l'aspect RESTful : Prenez n'importe quelle page dont l'URL d'accès est définie par une méthode HTTP `Get`. Vous pourrez toujours mettre cette page en bookmark dans votre navigateur et y revenir plus tard. Le serveur ne conservant pas de session, vous n'aurez pas de surprise, vous obtiendrez toujours le même résultat. Si vous avez déjà utilisé des frameworks stateful comme JSF, vous avez sûrement remarqué que ce n'était pas simple avec une telle architecture. Note : une page bookmarkable sera aussi plus facile à mettre en cache et sera compatible avec le bouton "back" du navigateur (là encore je vous renvoie à JSF...).

Note : On peut bien sûr gérer des informations sur la session utilisateur côté client, via un cookie (signé et crypté) ou via le stockage local HTML5.

Play!> 2 conserve tous ces principes et en apporte de nouveaux...

* Toute requête est potentiellement asynchrone
* Tout est typé et vérifié à la compilation, même les templates de vues et les fichiers de définitions des routes HTTP (nous verrons plus loin de quoi il s'agit).

L'aspect asynchrone est particulièrement intéressant. En ce moment on parle beaucoup de "real time web applications". Certains n'y voient qu'un buzzword, mais le concept est vraiment intéressant et Play!> 2 permet de faire ce genre de choses facilement. On peut par exemple, depuis une requête HTTP, récupérer une multitude d'informations en appelant différents services externes (twitter, linkedin ...), mixer ces infos et les pousser vers le client, tout ça en mode non bloquant, c'est à dire que le navigateur ne reste pas en attente entre la demande d'informations et la réponse. Après la requête, la connexion est libérée, puis une autre connexion sera créée dans le sens inverse (server -> client) une fois que le résultat sera calculé. Nous verrons ces concepts plus en détail tout à la fin de cet ebook.
