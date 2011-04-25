# Play et Scala

Play propose d'utiliser au choix les langages Scala ou Java pour d�velopper des applications.
Scala est un langage pour la machine virtuelle Java (JVM) qui marie les caract�ristiques des langages orient�s objet et des langage fonctionnels.
C'est un langage tr�s diff�rent de Java, il demande donc un temps d'adaptation pour les d�veloppeurs Java. Cependant, nous allons voir � travers quelques exemples que c'est un langage tr�s int�ressant qui peut nous aider � am�liorer sensiblement la lisibilit� et l'expressivit� du code, gr�ce � l'approche fonctionnelle.

## Exemples de code

Pour effectuer le rendu d'un template, une seule ligne suffit. On d�clare une map contenant les attributs de la page � afficher :

	def list() = {
		Template('albums -> Albums.all.fetch(100))
	}
	
	TODO sort, filter...
  
## Installer le module Scala

Pour installer ce module, il suffit d'ajouter cette ligne dans le fichier dependencies.yml, dans la partie require : `- play -> scala 0.9`.
Ca y'est vous �tes arm�s pour d�velopper en Scala!

## Apprendre Scala

	TODO ebook gratuit