Note pour le chargement du module CRUD :
Je propose d'utiliser la nouvelle méthode de chargement des modules avec le fichier dependencies.yml.
En effet, le chargement du module CRUD par le fichier application.conf semble déprécié depuis la version 1.2.1 de play et provoque l'affichage du message suivant:
`19:40:30,726 WARN ~ Declaring modules in application.conf is deprecated. Use dependencies.yml instead (module.crud)`

Cela donnerai donc pour activer le module CRUD :

* aller dans `/azerguespeche/conf/dependencies.conf`
* ajouter ceci sur une nouvelle ligne à la suite de `- play` :

        - play -> crud

* aller dans le fichier routes `/azerguespeche/conf/routes`
        
* Ajouter ceci : juste après `GET /   Application.index`

        # Import CRUD routes
        * /admin module:crud

*Note : on vient d'expliquer à Play!► que l'on utilise le module CRUD lorsque l'on utilise l'url [http://localhost:9000/admin/](http://localhost:9000/admin/)*

**Avant de continuer, arrêtez votre application :**

En ligne de commande, taper : `play dependencies`

Cette commande permet d'installer les modules et/ou bibliothèques externes déclarés dans le fichier dependencies.yml.
Donc si tout se passe bien vous devriez voir un message indiquant que le module CRUD a été installé.
