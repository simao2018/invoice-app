# 💼 Application Devis Artisan – Angular

Cette application Angular permet à un artisan (ex. plombier, électricien…) de générer facilement des devis professionnels avec une interface moderne, épurée et intuitive.

## ✨ Fonctionnalités principales

- 🧾 Création d’un devis à partir d’un formulaire dynamique
- 👤 Saisie des informations client (nom, adresse, contact)
- ➕ Ajout d’items personnalisés (désignation, quantité, prix unitaire, montant HT)
- 💰 Calcul automatique du total HT, TVA (10%) et TTC
- 📄 Aperçu visuel et impression du devis
- 📤 Export PDF
- 📑 G\u00E9n\u00E9ration d'un PDF au format professionnel avec en-t\u00EAte de l'artisan
- 📚 Historique des devis sauvegardés localement

## 🧑‍💻 Cas d’usage

Un artisan souhaite établir un devis pour la rénovation d'une salle de bains :
- Il entre les coordonnées de son client (Mme PHILIPPS Jeaminie)
- Il ajoute des lignes pour chaque prestation : dépose, pose, matériel…
- L'application calcule automatiquement les montants HT et TTC
- Il génère un PDF prêt à imprimer ou envoyer par email

## 🎨 UI/UX

- Design **moderne et épuré**
- Utilisation d’**icônes** (Material Icons)
- Expérience utilisateur fluide et **responsive**
- Compatible desktop / tablette / mobile

## 🧰 Tech Stack

- Angular 17+
- Angular Material
- TypeScript
- SCSS
- `jspdf`, `ngx-print` pour l’export PDF

## 🚀 Lancement du projet

```bash
npm install
ng serve
```

L'application est accessible sur `http://localhost:4200`.
