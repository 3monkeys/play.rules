# Play et Scala

Play propose d'utiliser au choix les langages Scala ou Java pour développer des applications.
Scala est un langage pour la machine virtuelle Java (JVM) qui marie les caractéristiques des langages orientés objet et des langage fonctionnels.
C'est un langage très différent de Java, il demande donc un temps d'adaptation pour les développeurs Java. Cependant, nous allons voir à travers quelques exemples que c'est un langage très intéressant qui peut nous aider à améliorer sensiblement la lisibilité et l'expressivité du code, grâce à l'approche fonctionnelle.

## Exemples de code

Pour effectuer le rendu d'un template, une seule ligne suffit. On déclare une map contenant les attributs de la page à afficher :

	def list() = {
		Template('albums -> Albums.all.fetch(100))
	}
	
	TODO sort, filter...
  
## Installer le module Scala

Pour installer ce module, il suffit d'ajouter cette ligne dans le fichier dependencies.yml, dans la partie require : `- play -> scala 0.9`.
Ca y'est vous êtes armés pour développer en Scala!

## Apprendre Scala

	TODO ebook gratuit