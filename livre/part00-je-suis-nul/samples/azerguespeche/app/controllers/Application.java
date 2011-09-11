package controllers;

import play.*;
import play.mvc.*;

import java.util.*;

import models.*;

public class Application extends Controller {

    public static void index() {

        List<Pecheur> listePecheurs = Pecheur.findAll();
        List<Poisson> listePoissons = Poisson.findAll();
        List<Competition> listeCompetitions = Competition.findAll();

        Version version = new Version();

        render(listePecheurs, listePoissons, listeCompetitions, version);

    }

}