package models;

import javax.persistence.*;


import play.data.validation.Required;
import play.db.jpa.*;

@Entity
public class Prise extends Model {

    /* une prise est faite par un seul pêcheur */
    @OneToOne
    @Required
    public Pecheur pecheur;

    /* on ne prend qu'un seul poisson à la fois */
    @OneToOne
    @Required
    public Poisson poisson;

    /* plusieurs prises dans une compétition
       cette prise appartient à 1 seule compétition
    */
    @ManyToOne
    @Required
    public Competition competition;

    public Prise() {
    }

    public Prise(Pecheur parQui, Poisson poissonPris, Competition pendantCompetition) {
        this.pecheur = parQui;
        this.poisson = poissonPris;
        this.competition = pendantCompetition;
    }


    @Override
    public String toString() {
        return "Prise{" +
                "par : " + pecheur.nom +" " + pecheur.prenom +
                ", poisson : " + poisson.nom +
                ", pendant : " + competition.toString() +
                '}';
    }



}