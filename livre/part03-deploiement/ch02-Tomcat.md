#Déploiement sous Tomcat

Nous allons volontairement faire "très simple". Voyez ça comme un chapitre "découverte" ou comment s'y coller sans stress. Pour rédiger ce chapitre, j'ai développé une application Play!► sous OSX et je l'ai déployée sous un Tomcat installé sur une distribution Ubuntu (après à vous de vous adapter).

**Pour information** : pour cet exemple, nul besoin d'avoir installé Play!► sur la machine de déploiement cible (il faut java tout de même).

##Installation de Tomcat (v°6) sous Linux

Nous sommes donc sous Linux (Ubuntu en ce qui me concerne).

- Passez en mode commande
- Tapez la commande `sudo apt-get install tomcat6 tomcat6-admin tomcat6-examples tomcat6-user`
- Tomcat est installé !
- Vous pouvez même tester : [http://localhost:8080/](http://localhost:8080/)
- Arrêter Tomcat : `sudo /etc/init.d/tomcat6 stop`

Pour faire plus propre, nous allons créer une instance séparée (cela va créer une instance de Tomcat dans votre répertoire Home) :

- Tapez la commande `tomcat6-instance-create ~/tools/tomcat6`
- ça c'est fait

Pour démarrer votre instance, il suffira de lancer la commande : 
`/home/k33g/tools/tomcat6/bin/startup.sh`

et pour l'arrêter :
`/home/k33g/tools/tomcat6/bin/shutdown.sh`, justement, on l'arrête avant de passer à la suite.

##Préparation du war de notre application 

Commencez par passer votre application en mode `prod` en modifiant le fichier application.conf :
`%production.application.mode=prod`

Renseignez les paramètres de votre base de données de production, par exemple :

  %production.db.url=jdbc:mysql://localhost/myDb
  %production.db.driver=com.mysql.jdbc.Driver
  %production.db.user=root
  %production.db.pass=***
  
Déroulez ensuite les étapes suivantes :  

- Placez vous dans votre répertoire de travail (un cran au dessus du répertoire de l'application que vous souhaitez déployer) et tapez la commande suivante : `play war monappli -o monappli_prod --zip`
- Vous allez obtenir une duplication de votre arborescence `monappli` nommée `monappli_prod`, ainsi qu'un fichier `monappli_prod.war`.
- **Déposez** le fichier war dans le répertoire `/tools/tomcat6/webapps/` de votre instance Tomcat (dans votre Home)
- Renommez le (ou pas) en `monappli.war`
- Démarrez Tomcat : `sudo /etc/init.d/tomcat6 start`
- Tomcat va détecter la présence du war et le déployer (allez voir dans le répertoire `webapps`)
- Vous devriez pouvoir accéder à votre appli : [http://localhost:8080/monappli/](http://localhost:8080/lyonpubs_prod/)
- Tadaaa !!! Terminé!

##Derniers réglages

Lorsque vous allez re-démarrer votre Ubuntu, Tomcat démarre automatiquement, mais ce n'est pas votre instance qui démarre, donc tapez la commande suivante : `sudo update-rc.d tomcat6 disable`, cela va annuler le démarrage automatique et vous évitera d'avoir un conflit avec votre instance (vous pouvez aussi modifier les ports).

Voilà, vous pouvez commencer à bidouiller. Si vous avez des commentaires, des ajouts, etc. ... N'oubliez pas, ayez le réflexe "pull request".

