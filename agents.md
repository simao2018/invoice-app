
---

## 🤖 agents.md (mis à jour)

```markdown
# Agent : devis-generator

## 🎯 Objectif

Développer une application Angular qui permet à un artisan de créer des devis professionnels rapidement et facilement, à partir d’un formulaire clair et moderne.

## 📋 Fonctionnalités attendues

- Formulaire client (nom, adresse, contact)
- Ajout de plusieurs items (désignation, quantité, prix unitaire, montant total HT)
- Calculs automatiques : Total HT, TVA (10%), Total TTC
- Interface de visualisation du devis avec options :
  - Aperçu à imprimer
  - Export PDF
- Historique des devis créés

## 🧑‍🎨 UX/UI

- Interface **moderne, épurée, UX friendly**
- Utilisation d’**icônes** pour chaque champ ou section
- Navigation fluide et responsive
- Utilisation d’Angular Material pour le design et la cohérence

## 🔧 Contraintes techniques

- Angular 17+
- Stockage local des devis dans un premier temps
- Utilisation de `ngx-print` ou `jspdf` pour le PDF
- Code modulaire, propre et réutilisable
- Structure inspirée du devis PDF "DEVIS PHILIPPS 2.pdf"

## 🧪 Cas d'usage principal

Un artisan saisit les coordonnées du client, ajoute des prestations ligne par ligne, et obtient un devis prêt à envoyer ou imprimer.
## 📦 Tech Stack
- Angular 17+
- Angular Material
- TypeScript
- SCSS