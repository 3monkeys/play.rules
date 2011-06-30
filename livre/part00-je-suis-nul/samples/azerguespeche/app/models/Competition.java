package models;

import javax.persistence.*;

import play.data.validation.Required;
import play.db.jpa.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
public class Competition extends Model {
    @Required
    public String nom;
    @Required
    public Date date;

    /*Il y a plusieurs prises dans une compétition
      on fait le lien avec la propriété competition de la classe Prise
    */
    @OneToMany(mappedBy="competition", cascade=CascadeType.ALL)
    public List<Prise> prises = new ArrayList();


    public Competition() {
    }

    public Competition(String nom, Date date) {
        this.nom = nom;
        this.date = date;
    }

    @Override
    public String toString() {
        return nom + " : " + date;
    }
}

