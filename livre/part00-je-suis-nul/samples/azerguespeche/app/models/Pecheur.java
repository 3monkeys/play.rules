package models;
import javax.persistence.*;

import play.data.validation.Email;
import play.data.validation.Required;
import play.db.jpa.*;

@Entity
public class Pecheur extends Model{
    @Required
    public String identifiant;
    @Required
    public String nom;
    @Required
    public String prenom;

    @Email
    public String email;

    public Integer departement;

    public Pecheur(){

    }

    public Pecheur(String identifiant, String nom, String prenom) {
        this.identifiant = identifiant;
        this.nom = nom;
        this.prenom = prenom;
    }

    @Override
    public String toString() {
        return identifiant+" : "+nom+" "+prenom;
    }
}
