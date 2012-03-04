# Gestion de la session utilisateur
Avec une architecture stateless, vous vous demandez sûrement comment stocker les informations relatives à la session utilisateur. 
Pour les données peu volumineuses, le framework propose une gestion de la session côté client à travers un cookie (crypté et signé).
Pour des données de taille plus conséquentes, il existe plusieurs solutions.
La solution à priviliégier pour une application moderne est celle qui consiste à stocker ces informations dans le navigateur via les API Web Storage apportées par HTML5.

Cette solution est parfaite lorsque l’on utilise un navigateur moderne. Si on souhaite cibler un ensemble de plateformes plus large, il existe des librairies (JavaScript ou basées sur Flash) qui pallient cette difficulté en permettent de stocker localement des données importantes, même dans les navigateurs plus anciens.
Enfin, si on a réellement besoin d’enregistrer plus d’informations dans la base de données, on pourra s’appuyer sur l’API de caching de Play, qui permet de soulager la base sans sacrifier l’aspect stateless du serveur (le fait qu’une donnée soit présente en cache ou non ne changera pas le comportement de l’application, seulement sa réactivité).

