// Année automatique dans le pied de page
document.querySelectorAll("[data-annee]").forEach(function (el) {
  el.textContent = new Date().getFullYear();
});
