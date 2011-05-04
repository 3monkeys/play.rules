package models;
import javax.persistence.*;

import play.data.validation.Required;
import play.db.jpa.*;

@Entity
public class Poisson extends Model{
    @Required
    public String identifiant;
    @Required
    public String nom;

    public Poisson() {
    }

    public Poisson(String identifiant, String nom) {
        this.identifiant = identifiant;
        this.nom = nom;
    }

    @Override
    public String toString() {
        return identifiant+" : "+nom;
    }
}
