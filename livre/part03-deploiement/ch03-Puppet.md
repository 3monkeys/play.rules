#Deploiment avec Puppet

Ce chapitre est une traduction de l'article [Deploying Play Framework Applications with Puppet](http://blog.akquinet.de/2011/10/25/deploying-play-framework-applications-with-puppet/).

Puppet est un outil de gestion de configuration permettant de gérer facilement une infrastructure et particulièrement son déploiement. Il permet entre-autre de rendre la gestion de l'infrastructure (serveur, applications, configurations...) traçable et plus facile a comprendre et donc a maintenir. Il adhère au mouvement _infrastructure as code_, une tendance majeure pour réduire la complexité impliquée dans la gestion de l'infrastructure. 

L'intérêt d'utiliser Puppet pour déployer des applications Play est simple: reposer sur des outils d'administration éprouvés qui vont permettre de déployer et configurer nos applications sur des infrastructures complexes. 

Ce chapitre explique comment on peut déployer des applications Play avec Puppet afin de développer des applications web de manière efficace et de la déployer de manière fiable. 

##Traiter votre infrastructure comme du code 

Infrastructure as code est une tendance majeure dans la gestion de ‘infrastructure aujourd’hui. C’est un ensemble de techniques et d’outils permettant de rendre la gestion de l’infrastructure plus pérenne, traçable et facile à maintenir. On peut résumer ce mouvement part : « Traiter votre infrastructure comme du code : Programmable, Testable, Déployable »

Il y a aujourd’hui beaucoup d’outils permettant de transformer votre infrastructure en du code, tel que [Chef](http://wiki.opscode.com/display/chef/Home), [Vagrant](http://vagrantup.com/) et [Puppet](http://puppetlabs.com/). Il y a de très nombreuses ressources disponibles comparant ces outils. Dans ce chapitre nous utilisons Puppet.

Puppet est un gestionnaire de configuration libre et open source. Puppet suit une philosophie : « Décris ce que tu veux et non pas comment ». En d’autres termes, avec Puppet, nous décrivons notre configuration finale et non pas comment l’atteindre. Cette description est stockée dans un manifeste, spécifiant les ressources nécessaires et leurs états finaux. Puppet analyse l’état actuel et compile le manifeste en un catalogue contenant la liste de ressources et leurs dépendances entre elles. Si ces ressources n’ont pas l’état désiré, elles seront modifiées afin de l’obtenir. (Ceci permet entre autre de réappliquer un manifeste plusieurs fois consécutivement sans effet de bord). 

Avec Puppet, tout est ressource : utilisateur, exécution d’une ligne de commande, un fichier, un serveur, un service… Afin de nous permettre de déployer des applications Play avec Puppet, il nous suffit de définir de nouvelles ressources.

##Playing with Puppet

Nous avons définis un module Puppet (c’est a dire une extension) pour Ubuntu, définissant 3 types de ressources : module, application et service.

Mais avant de regarder en détails ces ressources, analysons la class Play. Cette classe initialise le framework Play, c’est a dire vérifie qu’il est installé sur le système, et l’installe si besoin. Ainsi, nous sommes sûr que Play est installé. 

Regardons maintenant les ressources définit par la module Puppet pour Play :

* _play::module_ gère un [module Play](http://www.playframework.org/modules). Cette ressource assure la disponibilité d’un module. Si le module n’est pas installé, cette ressource l’installera.
* _play::application_ gère une application Play. Elle assure que l’application spécifiée est démarré (ou stoppée). Si besoin, elle démarrera l’application (ou la stoppera). Durant la phase de démarrage, les dépendances de l’application seront résolues. Cette ressource permet la configuration du _framework id_  ainsi que des options passées à la JVM. (plus d'info sur le frameowrk id sur le [site de Play](http://www.playframework.org/documentation/1.2.3/ids))
* _play::service_ gère une application Play démarré comme un service système. Elle assure qu’un script démon (service) est bien présent dans /etc/init.d et qu’il est démarré. Tout comme play::application, cette ressource permet la configuration du _framework id_  ainsi que des options passées à la JVM.

##Less conversation, more action Please

Bon, assez parlé. Regardons maintenant comme l’on peut déployer notre application Play avec Puppet. Tout d’abord vous avez besoin d’un serveur Ubuntu avec Puppet, git et Java. A part Puppet, les autres logiciels peuvent être déployé avec Puppet. 

Nous pouvons choisir d’installer le module Puppet dans _/etc/puppet/modules_ ou dans n’importe quel répertoire du moment que l’on modifie le _modulepath_ de Puppet. Afin d’obtenir le plugin, cloner le module Puppet pour Play :

    git clone git://github.com/cescoffier/puppet-play.git play

Vérifiez que le répertoire que vous avez choisit soit bien dans me modulepath (définie dans _/etc/puppet/puppet.conf_).

Le module ne définit pas comment l’application est copiée sur votre serveur. Vous pouvez utiliser scp, wget, git ou bien maven/nexus. Nous allons faire l’hypothèse que l’application est dans _/var/data-www/bilderverwaltung_. 

Maintenant que nous avons notre application et le module, regardons le manifest (généralement appelé site.pp).

	Exec {
	    path => ["/bin", "/sbin", "/usr/bin", "/usr/sbin"],
	}
	# Install mongoDB
	include mongodb
	#Install Play and define our Play service
	include play
	play::module {"mongodb module" :
	 	module => "mongo-1.3",
		require => [Class["play"], Class["mongodb"]]
	}
	play::module { "less module" :
	 	module => "less-0.3",
		require => Class["play"]
	}
	play::application { "bilderverwaltung" :
		path => "/var/data-www/bilderverwaltung ",
		require => [Play::Module["mongodb module"], Play::Module["less module"]
	}

Ce manifeste installe MongoDB, définie 2 modules Play (less et mongodo) et démarre notre application. Les ‘require’ sont utilisés afin de définir les dépendances entre ressource et ainsi orchestrer la résolution des ressources.  Ainsi, lors que nous appliquons ce manifeste, il installera Play, les 2 plugins et démarrera notre application (dans cet ordre).

	sudo puppet apply --modulepath=/my/puppet/modules site.pp
	
C’est tout ! Grace a Puppet, toute la configuration nécessaire est masquée. Nous pouvons stocker notre manifeste dans in gestionnaire de source et ainsi tracer les changements, revenir a une version précédente, réappliquer les même manifestes sur différentes cibles…

Nous pouvons utiliser ce module dans une configuration serveur-client. Nous pouvons également étendre ce manifeste afin de configurer un hôte virtuel (Apache). 

##Conclusion

Ce chapitre a brièvement introduit les avantages d’utiliser une solution ‘infrastructure as code’ et comment gérer des applications Play avec Puppet. Le [site web](https://github.com/cescoffier/puppet-play) du module Play pour Puppet contient tous les détails nécessaires afin de mettre en place efficacement Puppet et Play ensemble. 
