// Big Drama · lieux.js · v5 · 20.10.2026 · auteur : Claude (chef de projet)
// Une seule variante à partir de la v5 : la rue, Paris 1918.
//
// TEXTES : moins de texte. Pour l'instant, chaque création affiche son résumé (repris du site actuel) et ses infos de base.
// Tout le reste est en lorem ipsum, en attendant le wording d'Ariane. Chaque emplacement de texte a un identifiant
// (champ "cle") listé dans TEXTES_A_ECRIRE.md. Les noms de pièces de Mistral restent comme noms de travail.
//
// support = le support sur lequel l'histoire se déroule au clic (voir SUPPORTS en bas de fichier).
// scene.boite = [x0, y0, x1, y1] mesurée sur le dessin, cadre 1600 × 900. plan = calque du théâtre de papier.
// son = fichier d'ambiance attendu dans sons/ (voir SONS_A_FOURNIR.md). Absent = silence, sans erreur.
// video = teaser attendu dans videos/ (voir MEDIAS_A_FOURNIR.md). Absent = les photos défilent à la place.
// photos = photos du site actuel (légende reprise du site). Elles habitent les pièces du plan et l'écran du support.

const LOREM_COURT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.";
const LOREM_LONG = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";
export { LOREM_COURT, LOREM_LONG };

const p = (id, nom) => ({ id, nom, texte: LOREM_COURT });

export const LIEUX = [
  {
    id: "maison", creation: "Close", annee: "2019 – 2020", cadre: "Grand public", support: "carte-maison-close",
    logo: "logos/maison.png", titreCarton: "Close", son: "sons/maison.mp3", video: "videos/maison.mp4", url: "/creations/close/",
    resume: "Paris, 1918. Au Phénix, cabaret décadent, ce sont les hommes qui se maquillent et les femmes qui commandent. Ici, la guerre n'existe pas.",
    infos: [["Lieu", "Un lieu tenu secret, Paris 11e"], ["Public", "15 000 spectateurs"], ["Décor", "600 m²"]],
    photos: ["photos/close-12.jpg", "photos/close-09.jpg", "photos/close-16.jpg", "photos/close-04.jpg", "photos/close-14.jpg", "photos/close-20.jpg"], legende: "",
    scene: { boite: [330, 109, 620, 657], plan: 2 },
    pieces: [p("couloir", "Le couloir des cinq portes"), p("chambre", "La chambre de Blanche"), p("salon", "Le salon des Heures Joyeuses"), p("vestiaire", "Le vestiaire des masques"), p("bar", "Le bar des Heures Joyeuses"), p("entree", "L'entrée du Phénix")]
  },
  {
    id: "serre", creation: "Parfum de Famille", annee: "2021", cadre: "Grand public", support: "dossier-enquete",
    logo: "logos/serre.png", titreCarton: "Parfum de Famille", son: "sons/serre.mp3", video: "videos/serre.mp4", url: "/creations/parfum-de-famille/",
    resume: "Zinnia, la matriarche des Florimond, a été retrouvée morte. Chez ces grands parfumeurs, tout le monde cache quelque chose.",
    infos: [["Format", "75 minutes d'enquête en ligne"], ["Distribution", "5 comédiens interrogés en direct"], ["Premières", "Avril 2021, à guichets fermés"]],
    photos: ["photos/parfum-de-famille-05.jpg", "photos/parfum-de-famille-01.jpg"], legende: "",
    scene: { boite: [620, 216, 760, 667], plan: 2 },
    pieces: [p("verriere", "La verrière"), p("bureau", "Le bureau de Zinnia"), p("rempotage", "La table de rempotage")]
  },
  {
    id: "scatolina", creation: "Scatolina", annee: "2022", cadre: "Pour Hermès × Apple", support: "boite-orange",
    logo: "logos/scatolina.png", titreCarton: "Scatolina", son: "sons/scatolina.mp3", video: "videos/scatolina.mp4", url: "/creations/scatolina/",
    resume: "Une fois par an, sur une petite île de la lagune de Venise, c'est la récolte des boîtes, dont la culture est restée secrète.",
    infos: [["Lieu", "Île de Mazzorbo, lagune de Venise"], ["Date", "Juillet 2022"]],
    photos: ["photos/hermes-03.jpg", "photos/hermes-01.jpg", "photos/hermes-02.jpg"], legende: "Photos : © Hermès",
    scene: { boite: [1300, 650, 1600, 823], plan: 3 },
    pieces: [p("jardin", "Le jardin des boîtes"), p("atelier", "L'atelier du Grand Jardinier")]
  },
  {
    id: "bar", creation: "Better Together", annee: "2022", cadre: "Pour Pernod Ricard", support: "ardoise-bistrot",
    logo: "logos/bar.png", titreCarton: "Better Together", son: "sons/bar.mp3", video: "videos/bar.mp4", url: "/creations/better-together/",
    resume: "Quatre colocataires, une mystérieuse invitation, et la dernière soirée d'une amitié.",
    infos: [["Format", "Comédie musicale en anglais, retransmise dans le monde entier"], ["Public", "10 000 collaborateurs"], ["Date", "Avril 2022"]],
    photos: ["photos/better-together-02.jpg", "photos/better-together-01.jpg"], legende: "Photos : © Pernod Ricard",
    scene: { boite: [880, 282, 1068, 728], plan: 2 },
    pieces: [p("etages", "L'appartement 1932"), p("comptoir", "Le comptoir des cartons"), p("terrasse", "La terrasse")]
  },
  {
    id: "creche", creation: "Un Conte de Noëlle", annee: "2021", cadre: "Grand public", support: "livre-enfant",
    logo: "logos/creche.png", titreCarton: "Un Conte de Noëlle", son: "sons/creche.mp3", video: "videos/creche.mp4", url: "/creations/un-conte-de-noelle/",
    resume: "Un spectacle de Noël bricolé de toutes pièces avec amour, dans lequel l'imaginaire tient le premier rôle.",
    infos: [["Date", "Décembre 2021"], ["Lieu", "Brasserie Gallia"]],
    photos: ["photos/un-conte-de-noelle-01.jpg", "photos/un-conte-de-noelle-03.jpg", "photos/un-conte-de-noelle-07.jpg"], legende: "Photos : © Le Portrait Parisien. Merci à la brasserie Gallia et à Emeline Dewitte pour leur accueil.",
    scene: { boite: [1060, 342, 1190, 714], plan: 2 },
    pieces: [p("atelier", "L'atelier des tantes"), p("etable", "L'étable du Prince"), p("coulisse", "Les coulisses")]
  },
  {
    id: "cimetiere", creation: "Norma", annee: "2023 – 2024", cadre: "Grand public", support: "faire-part",
    logo: "logos/cimetiere.png", titreCarton: "Norma", son: "sons/cimetiere.mp3", video: "videos/cimetiere.mp4", url: "/creations/norma/",
    resume: "Ce soir, tous les orphelins enterrent Norma. Elle ne leur laisse que des dettes, et quinze minutes pour monter sa plus grande arnaque.",
    infos: [["Lieu", "2 rue des Mathurins, Paris 9e"], ["Décor", "1 000 m² sur 3 étages"], ["Public", "Plus de 14 000 spectateurs"]],
    photos: ["photos/norma-08.jpg", "photos/norma-02.jpg", "photos/norma-04.jpg", "photos/norma-10.jpg", "photos/norma-06.jpg"], legende: "Photos : Alessandro Clemenza",
    scene: { boite: [-4, 339, 206, 608], plan: 2 },
    pieces: [p("coupole", "La coupole du mausolée"), p("chapelle", "La chapelle des orphelins"), p("caveau", "Le caveau de Norma")]
  },
  {
    id: "lune", creation: "Eros en Russie", annee: "2017", cadre: "Pour The Family", support: "affiche-tsigane",
    logo: "logos/lune.png", titreCarton: "Eros en Russie", son: "sons/lune.mp3", video: "videos/lune.mp4", url: "/creations/eros-en-russie/",
    resume: "Il y a cent ans jour pour jour, dans ce même lieu, on réchauffait les nuits froides au rythme des accords slaves.",
    infos: [["Lieu", "25 rue du Petit-Musc, Paris 4e"]],
    photos: ["photos/eros-01.jpg", "photos/eros-02.jpg"], legende: "",
    scene: { boite: [1266, 72, 1443, 213], plan: 0 },
    pieces: []
  },
  {
    id: "tour", creation: "Viva Barbessia", annee: "2017", cadre: "Pour My Little Paris", support: "parchemin-balkans",
    logo: "logos/tour.png", titreCarton: "Viva Barbessia", son: "sons/tour.mp3", video: "videos/tour.mp4", url: "/creations/viva-barbessia/",
    resume: "Pour sauver son pays de l'oubli, l'ambassadeur de Barbessie convie les huit dernières familles royales dans son ambassade abandonnée.",
    infos: [["Genre", "Soirée de Noël immersive"], ["Date", "Décembre 2017"]],
    photos: ["photos/viva-barbessia-01.jpg", "photos/viva-barbessia-02.jpg"], legende: "",
    scene: { boite: [180, -14, 392, 640], plan: 2 },
    pieces: [p("suite", "La suite de la reine Zora"), p("salle", "La salle d'apparat"), p("hall", "Le hall de l'ambassade"), p("loge", "La loge du groom")]
  },
  {
    id: "arbre", creation: "La Prophétie del Coco", annee: "2018", cadre: "Pour Bacardí", support: "etiquette-cigare",
    logo: "logos/arbre.png", titreCarton: "La Prophétie del Coco", son: "sons/arbre.mp3", video: "videos/arbre.mp4", url: "/creations/la-prophetie-del-coco/",
    resume: "L'arbre légendaire de la famille tombe malade. Il est temps de désigner un successeur.",
    infos: [["Date", "Juin 2018"]],
    photos: ["photos/prophetie-del-coco-01.jpg", "photos/prophetie-del-coco-04.jpg"], legende: "Photos : Hands Studio. L'abus d'alcool est dangereux pour la santé, à consommer avec modération.",
    scene: { boite: [1164, 450, 1376, 734], plan: 3 },
    pieces: []
  },
  {
    id: "usine", creation: "Burning Bar", annee: "2019", cadre: "Pour Grimbergen", support: "etiquette-brulee",
    logo: "logos/usine.png", titreCarton: "Burning Bar", son: "sons/usine.mp3", video: "videos/usine.mp4", url: "/creations/burning-bar/",
    resume: "Le premier bar éphémère qui brûle tous les soirs et renaît de ses cendres le lendemain.",
    infos: [["Lieu", "Vieux-Lille"], ["Public", "Plus de 3 000 visiteurs en deux semaines"]],
    photos: ["photos/grimbergen-01.jpg"], legende: "Photos : Hands Studio. L'abus d'alcool est dangereux pour la santé, à consommer avec modération.",
    scene: { boite: [762, 162, 878, 668], plan: 1 },
    pieces: [p("brasserie", "La salle des cuves"), p("bar", "Le bar qui renaît")]
  }
];

// Le support de chaque histoire : ce qui se déroule au clic, à côté du plan.
export const SUPPORTS = {
  "carte-maison-close": "Carte de visite de maison close 1918, crème et or, cadre art nouveau à la Mucha. S'ouvre comme un carton plié.",
  "dossier-enquete": "Dossier d'enquête new-yorkais, chemise kraft, trombone, texte tapé à la machine. La chemise s'ouvre.",
  "boite-orange": "Une boîte orange dont le couvercle se soulève, une carte vénitienne à l'intérieur, un ruban.",
  "ardoise-bistrot": "Ardoise de bistrot à la craie, cadre de bois, qui descend au bout de sa chaînette.",
  "livre-enfant": "Livre pour enfants, papier épais, étoiles découpées. La page tourne.",
  "faire-part": "Faire-part de deuil bordé de noir, gothique. Il glisse hors de son enveloppe.",
  "affiche-tsigane": "Affiche de cabaret tsigane du XIXe siècle, rouge et or, papier vieilli. Elle se déroule depuis le haut.",
  "parchemin-balkans": "Parchemin à l'ancienne des Balkans, frise brodée rouge et noire, sceau de cire. Il se déroule entre ses deux rouleaux.",
  "etiquette-cigare": "Étiquette de boîte à cigares cubaine, dorures et palmes. Le couvercle s'ouvre.",
  "etiquette-brulee": "Étiquette de brasserie du Nord aux bords brûlés. Elle apparaît comme si le feu la révélait."
};
