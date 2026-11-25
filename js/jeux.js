"use strict";

const boutonsJeux = document.querySelectorAll("[data-jeu-select]");
const panneauxJeux = document.querySelectorAll("[data-jeu-panel]");

boutonsJeux.forEach(function (bouton) {
  bouton.addEventListener("click", function () {
    const jeuChoisi = bouton.dataset.jeuSelect;

    boutonsJeux.forEach(function (autreBouton) {
      autreBouton.setAttribute(
        "aria-pressed",
        String(autreBouton === bouton)
      );
    });

    panneauxJeux.forEach(function (panneau) {
      panneau.hidden = panneau.dataset.jeuPanel !== jeuChoisi;
    });
  });
});

const lignesGagnantesMorpion = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const grilleMorpion = document.querySelector(".morpion-grille");
const statutMorpion = document.querySelector("[data-morpion-statut]");
const casesMorpion = Array.from(
  grilleMorpion.querySelectorAll("[data-case]")
);
let plateauMorpion = Array(9).fill(0);
let joueurMorpion = 1;
let partieMorpionTerminee = false;

function afficherStatutMorpion(message, joueur) {
  statutMorpion.textContent = message;
  statutMorpion.dataset.joueur = joueur ? String(joueur) : "termine";
}

function rejouerMorpion() {
  plateauMorpion = Array(9).fill(0);
  joueurMorpion = 1;
  partieMorpionTerminee = false;

  casesMorpion.forEach(function (caseMorpion, index) {
    const ligne = Math.floor(index / 3) + 1;
    const colonne = (index % 3) + 1;

    caseMorpion.textContent = "";
    caseMorpion.disabled = false;
    caseMorpion.className = "morpion-case";
    caseMorpion.setAttribute("aria-label", `Ligne ${ligne}, colonne ${colonne}`);
  });

  afficherStatutMorpion("Tour du joueur 1 — X", 1);
}

grilleMorpion.addEventListener("click", function (evenement) {
  const caseMorpion = evenement.target.closest("[data-case]");

  if (!caseMorpion || partieMorpionTerminee || caseMorpion.disabled) {
    return;
  }

  const index = Number(caseMorpion.dataset.case);
  const symbole = joueurMorpion === 1 ? "X" : "O";
  plateauMorpion[index] = joueurMorpion;
  caseMorpion.textContent = symbole;
  caseMorpion.classList.add(
    joueurMorpion === 1 ? "morpion-case--x" : "morpion-case--o"
  );
  caseMorpion.disabled = true;
  caseMorpion.setAttribute(
    "aria-label",
    `Ligne ${Math.floor(index / 3) + 1}, colonne ${(index % 3) + 1}, ${symbole}, joueur ${joueurMorpion}`
  );

  const ligneGagnante = lignesGagnantesMorpion.find(function (ligne) {
    return ligne.every(function (caseIndex) {
      return plateauMorpion[caseIndex] === joueurMorpion;
    });
  });

  if (ligneGagnante) {
    partieMorpionTerminee = true;
    ligneGagnante.forEach(function (caseIndex) {
      casesMorpion[caseIndex].classList.add("morpion-case--gagnante");
    });
    casesMorpion.forEach(function (caseElement) {
      caseElement.disabled = true;
    });
    afficherStatutMorpion(`Le joueur ${joueurMorpion} remporte la partie !`, 0);
    return;
  }

  if (plateauMorpion.every(function (caseIndex) { return caseIndex !== 0; })) {
    partieMorpionTerminee = true;
    casesMorpion.forEach(function (caseElement) {
      caseElement.disabled = true;
    });
    afficherStatutMorpion("Match nul !", 0);
    return;
  }

  joueurMorpion = joueurMorpion === 1 ? 2 : 1;
  afficherStatutMorpion(
    `Tour du joueur ${joueurMorpion} — ${joueurMorpion === 1 ? "X" : "O"}`,
    joueurMorpion
  );
});

document
  .querySelector("[data-morpion-rejouer]")
  .addEventListener("click", rejouerMorpion);

const nombreLignes = 6;
const nombreColonnes = 7;
const grillePuissance = document.querySelector("[data-puissance-grille]");
const statutPuissance = document.querySelector("[data-puissance-statut]");
let plateauPuissance = [];
let joueurPuissance = 1;
let partiePuissanceTerminee = false;

function creerGrillePuissance() {
  for (let colonne = 0; colonne < nombreColonnes; colonne += 1) {
    const boutonColonne = document.createElement("button");
    boutonColonne.className = "puissance-colonne";
    boutonColonne.type = "button";
    boutonColonne.dataset.colonne = String(colonne);
    boutonColonne.setAttribute("aria-label", `Jouer dans la colonne ${colonne + 1}`);

    for (let ligne = 0; ligne < nombreLignes; ligne += 1) {
      const casePuissance = document.createElement("span");
      const pion = document.createElement("span");

      casePuissance.className = "puissance-case";
      casePuissance.dataset.ligne = String(ligne);
      pion.className = "pion";
      pion.setAttribute("aria-hidden", "true");
      casePuissance.append(pion);
      boutonColonne.append(casePuissance);
    }

    grillePuissance.append(boutonColonne);
  }
}

function afficherStatutPuissance(message, joueur) {
  statutPuissance.textContent = message;
  statutPuissance.dataset.joueur = joueur ? String(joueur) : "termine";
}

function rejouerPuissance() {
  plateauPuissance = Array.from(
    { length: nombreLignes },
    function () {
      return Array(nombreColonnes).fill(0);
    }
  );
  joueurPuissance = 1;
  partiePuissanceTerminee = false;

  grillePuissance.querySelectorAll(".puissance-colonne").forEach(function (boutonColonne) {
    boutonColonne.disabled = false;
    boutonColonne.querySelectorAll(".pion").forEach(function (pion) {
      pion.className = "pion";
    });
  });

  afficherStatutPuissance("Tour du joueur 1 — vert", 1);
}

// Cherche quatre pions reliés dans les deux sens le long de chaque axe.
function trouverAlignement(ligne, colonne, joueur) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (const [deltaLigne, deltaColonne] of directions) {
    const alignement = [{ ligne: ligne, colonne: colonne }];

    for (const sens of [-1, 1]) {
      let ligneVoisine = ligne + deltaLigne * sens;
      let colonneVoisine = colonne + deltaColonne * sens;

      while (
        ligneVoisine >= 0 &&
        ligneVoisine < nombreLignes &&
        colonneVoisine >= 0 &&
        colonneVoisine < nombreColonnes &&
        plateauPuissance[ligneVoisine][colonneVoisine] === joueur
      ) {
        alignement.push({
          ligne: ligneVoisine,
          colonne: colonneVoisine
        });
        ligneVoisine += deltaLigne * sens;
        colonneVoisine += deltaColonne * sens;
      }
    }

    if (alignement.length >= 4) {
      return alignement;
    }
  }

  return [];
}

grillePuissance.addEventListener("click", function (evenement) {
  const boutonColonne = evenement.target.closest("[data-colonne]");

  if (!boutonColonne || partiePuissanceTerminee || boutonColonne.disabled) {
    return;
  }

  const colonne = Number(boutonColonne.dataset.colonne);
  let ligneDisponible = -1;

  // Les pions occupent la case libre la plus basse de la colonne.
  for (let ligne = nombreLignes - 1; ligne >= 0; ligne -= 1) {
    if (plateauPuissance[ligne][colonne] === 0) {
      ligneDisponible = ligne;
      break;
    }
  }

  if (ligneDisponible === -1) {
    boutonColonne.disabled = true;
    return;
  }

  plateauPuissance[ligneDisponible][colonne] = joueurPuissance;
  const pion = boutonColonne.querySelector(
    `[data-ligne="${ligneDisponible}"] .pion`
  );
  pion.classList.add(`pion--joueur-${joueurPuissance}`, "pion--tombe");
  boutonColonne.disabled = plateauPuissance[0][colonne] !== 0;

  const alignement = trouverAlignement(
    ligneDisponible,
    colonne,
    joueurPuissance
  );

  if (alignement.length >= 4) {
    partiePuissanceTerminee = true;
    alignement.forEach(function (position) {
      const caseGagnante = grillePuissance.querySelector(
        `[data-colonne="${position.colonne}"] [data-ligne="${position.ligne}"] .pion`
      );
      caseGagnante.classList.add("pion--gagnant");
    });
    grillePuissance.querySelectorAll(".puissance-colonne").forEach(function (bouton) {
      bouton.disabled = true;
    });
    afficherStatutPuissance(`Le joueur ${joueurPuissance} remporte la partie !`, 0);
    return;
  }

  if (plateauPuissance.every(function (ligne) {
    return ligne.every(function (casePuissance) {
      return casePuissance !== 0;
    });
  })) {
    partiePuissanceTerminee = true;
    grillePuissance.querySelectorAll(".puissance-colonne").forEach(function (bouton) {
      bouton.disabled = true;
    });
    afficherStatutPuissance("Match nul !", 0);
    return;
  }

  joueurPuissance = joueurPuissance === 1 ? 2 : 1;
  afficherStatutPuissance(
    `Tour du joueur ${joueurPuissance} — ${joueurPuissance === 1 ? "vert" : "blanc"}`,
    joueurPuissance
  );
});

document
  .querySelector("[data-puissance-rejouer]")
  .addEventListener("click", rejouerPuissance);

creerGrillePuissance();
rejouerMorpion();
rejouerPuissance();
