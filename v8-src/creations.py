"""Big Drama V8 · pages création et page À propos (vraies pages, une adresse chacune).

Sources : textes de l'ancien site bigdrama.fr (copie dans v2/), infos de lieux.js.
Tout ce qui n'est pas vérifié porte la marque V(...) : visible seulement avec ?verif dans l'adresse.
Lancé par rebuild.py. Écrit v8/creations/<slug>/index.html, v8/a-propos/index.html, creations.css, creations.js.
"""
from pathlib import Path
import html, json, shutil, re

ICI = Path(__file__).resolve().parent
OUT = ICI.parent / 'v8'
RACINE = ICI.parent


def V(t):
    """Texte à vérifier : souligné en pointillé avec ?verif."""
    return f'<span class="a-verifier" title="À vérifier">{t}</span>'


E = html.escape

# ───────── contenu ─────────
# ordre = ordre des bannières de l'accueil (sert au précédent / suivant)
CREATIONS = [
    {
        'slug': 'norma', 'id': 'cimetiere', 'titre': 'Norma', 'logo': 'logos/norma.png',
        'genre': 'Comédie musicale immersive', 'cadre': 'Grand public', 'quand': '2023 – 2024', 'ou': 'Paris 9e',
        'accroche': "Ce soir, tous les orphelins enterrent Norma. Elle ne leur laisse que des dettes, et quinze minutes pour monter sa plus grande arnaque.",
        'texte': [],   # texte complet à fournir (voir la liste pour Ariane)
        'chiffres': [('Lieu', V('2 rue des Mathurins, Paris 9e')), ('Décor', V('1 000 m² sur 3 étages')), ('Public', V('Plus de 14 000 spectateurs'))],
        'credits': [('Une création', 'Big Drama')],
        'photos': ['photos/norma-08.jpg', 'photos/norma-02.jpg', 'photos/norma-04.jpg', 'photos/norma-10.jpg'],
        'film': 'videos/cimetiere-169.mp4', 'legende': 'Photos : Alessandro Clemenza',
    },
    {
        'slug': 'close', 'id': 'maison', 'titre': 'Close', 'logo': 'logos/maison.png',
        'genre': 'Spectacle immersif', 'cadre': 'Grand public', 'quand': '2019 – 2020', 'ou': 'Paris',
        'accroche': "Paris, 1918. Alors que la guerre n'en finit pas, artistes, révolutionnaires et marginaux se retrouvent pour faire la fête au Phénix.",
        'texte': [
            "Dans ce cabaret décadent, ce sont les hommes qui se maquillent et les femmes qui commandent. Ici, la guerre n'existe pas.",
            "Ce soir, le capitaine Émile Barbiquet va épouser Blanche, la petite protégée de la maison. Mais avant de l'accueillir en son sein, la grande famille du Phénix va le soumettre à un jeu étrange…",
            "Plongez en immersion dans la maison. Vous êtes libres de choisir où aller, qui suivre et à quelle porte écouter. Il n'y a ni scène, ni coulisses.",
            "Joué à guichets fermés au printemps 2019, puis en 2020, devant " + V("plus de 10 000 spectateurs") + ".",
        ],
        'chiffres': [('Lieu', V('Un lieu tenu secret, Paris 11e')), ('Public', V('Plus de 10 000 spectateurs')), ('Décor', V('600 m²'))],
        'credits': [
            ('Écrit par', 'Clément Marchand, Alexis Pivot, Ariane Raynaud, en collaboration avec l’ensemble des comédien·nes'),
            ('D’après', 'Close 1, de Roman Carrère, Clément Marchand, Alexis Pivot et Ariane Raynaud'),
            ('Direction artistique', 'Alexis Pivot'), ('Mise en scène', 'Ariane Raynaud, assistée de Rosy Pollastro'),
            ('Musique', 'Alexis Pivot'), ('Scénographie', 'Doriane Fréreau'), ('Costumes', 'Juliette du Pont de Romémont'),
            ('Chorégraphie', 'Emma Scherer'), ('Lumières', 'Arnaud Bouret'), ('Son', 'Jacques Estève'), ('Production', 'Big Drama'),
        ],
        'distribution': [
            ('Avec', [('Nathanaël Bez', 'Franz'), ('Clara Brajtman', 'Suzanne'), ('Anthony Fernandes', 'Petite Chose'), ('Eva Freitas', 'Blanche'),
                      ('Baptiste Marc', 'Armand'), ('Fanny Pascaud', 'Mami'), ('Alexis Pivot', 'Valentin'), ('Rosy Pollastro', 'Simone'),
                      ('Diane Renier', 'Zélie'), ('Emma Scherer', 'Olympia'), ('Guillaume Tagnati', 'Émile Barbiquet')]),
            ('En doublure', [('Marine André', 'Olympia ou Zélie'), ('Laurent Evuort-Orlandi', 'Armand ou Valentin'), ('Pascal Lacoste', 'Émile Barbiquet ou Franz'),
                             ('Clément Marchand', 'Petite Chose'), ('Gaëlle Pauly', 'Blanche ou Suzanne'), ('Ariane Raynaud', 'Simone ou Mami')]),
            ('Le personnel du Phénix', [('Lucas Hoffmann', 'Fernand, à la billetterie'), ('Louis Busset', 'Léon, au vestiaire'), ('Pamina de Hauteclocque', 'Lola, au vestiaire'),
                                        ('Odran Guillemard', 'Le Gamin, au vestiaire'), ('Célia Pyamootoo', 'Jeanne, au vestiaire'),
                                        ('Jahel Japhet', 'Gemma, au café-concert'), ('Morgane Ricoteau-Jérôme', 'Joséphine, au café-concert'),
                                        ('Mélina Fernandez, Dylan Arab, Mike Kibuanda', 'au bar du Phénix'), ('Maxime Martin', 'Edouard, à la régie')]),
            ('L’équipe', [('Régie', 'Maxime Martin, assisté d’Eloi Morival'), ('Régie technique', 'Adrien Lacaille, Lenaïc Pujol, Arnaud Bouret'),
                               ('Habillage', 'Bérangère Pivot'), ('Couture', 'Margot Déon'), ('Coiffure', 'Eduardo Alvarez'), ('Maquillage', 'Fanny Jakubowicz'),
                               ('Lumières', 'Arnaud Bouret, assisté de Lenaïc Pujol'), ('Direction de casting', 'Rosy Pollastro'), ('Producteur', 'Mathieu Bressenot'),
                               ('Direction de production', 'Noémie Benizri et Gersende Michel, Raoule Productions'), ('Commercial', 'Emeline Dewitte'),
                               ('Communication et marketing', 'Nathanaël Bez'), ('Création graphique et coordination', 'Juliette Delvienne'), ('Presse', 'Valérie Talagas')]),
        ],
        'photos': ['photos/close-teaser-07.jpg', 'photos/close-teaser-01.jpg', 'photos/close-12.jpg', 'photos/close-16.jpg', 'photos/close-04.jpg', 'photos/close-14.jpg'],
        'film': 'videos/maison-169.mp4', 'legende': '',
        'partenaires': ['v2/assets/original/wp-content/uploads/2020/02/TruffautB.png', 'v2/assets/original/wp-content/uploads/2020/02/MakeupB-1.png', 'v2/assets/original/wp-content/uploads/2020/02/Kapten-2.png'],
    },
    {
        'slug': 'parfum-de-famille', 'id': 'serre', 'titre': 'Parfum de Famille', 'logo': 'logos/serre.png',
        'genre': 'Enquête immersive en ligne', 'cadre': 'Grand public', 'quand': '2021', 'ou': 'En ligne',
        'accroche': "Un incendie vient de se produire dans la gigantesque demeure des Florimond, une grande famille de parfumeurs. Zinnia, la matriarche, a été retrouvée morte.",
        'texte': [
            "Riche, autoritaire et puissante, elle était autant adorée que redoutée. Mais qui aurait pu la tuer ?",
            "Pour le découvrir, il faudra plonger dans l'intimité de cette famille étrange, fouiller dans son passé et interroger les suspects en direct. Car chez les Florimond, tout le monde cache quelque chose…",
            "Entre théâtre immersif, escape game virtuel et Cluedo, Parfum de Famille est né pendant la crise sanitaire. Les premières sessions de jeu se sont déroulées en avril 2021, à guichets fermés.",
        ],
        'chiffres': [('Format', V('75 minutes d’enquête en ligne')), ('Distribution', V('5 comédiens interrogés en direct')), ('Premières', 'Avril 2021, à guichets fermés')],
        'credits': [('Une création', 'Big Drama')],
        'photos': ['photos/parfum-de-famille-05.jpg', 'photos/parfum-de-famille-01.jpg'], 'film': None, 'legende': '',
        'partenaires': ['v2/assets/original/wp-content/uploads/2021/03/mercialfreddfullwhite.png'],
    },
    {
        'slug': 'un-conte-de-noelle', 'id': 'creche', 'titre': 'Un Conte de Noëlle', 'logo': 'logos/creche.png',
        'genre': 'Fable immersive', 'cadre': 'Grand public', 'quand': 'Décembre 2021', 'ou': 'Brasserie Gallia',
        'accroche': "Un spectacle de Noël bricolé de toutes pièces avec amour, dans lequel l'imaginaire tient le premier rôle.",
        'texte': ["Dans « Un conte de Noëlle », il y a un Prince qui n'arrive pas à dormir, un Gouvernement catégorique, une méchante marâtre et sa créature créée de toutes pièces, une orpheline et ses tantes aux pouvoirs magiques."],
        'chiffres': [('Date', 'Décembre 2021'), ('Lieu', 'Brasserie Gallia')],
        'credits': [('Une création', 'Big Drama')],
        'photos': ['photos/un-conte-de-noelle-01.jpg', 'photos/un-conte-de-noelle-03.jpg', 'photos/un-conte-de-noelle-07.jpg'], 'film': None,
        'legende': 'Photos : © Le Portrait Parisien. Un grand merci à la brasserie Gallia et à Emeline Dewitte pour leur accueil.',
    },
    {
        'slug': 'scatolina', 'id': 'scatolina', 'titre': 'Scatolina', 'logo': 'logos/scatolina.png',
        'genre': 'Expérience immersive grandeur nature', 'cadre': 'Création privée pour Hermès et Apple', 'quand': 'Juillet 2022', 'ou': 'Île de Mazzorbo, Venise',
        'accroche': "Vous êtes-vous déjà demandé d'où venaient les boîtes orange Hermès ?",
        'texte': [
            "Une fois par an, sur une petite île perdue dans la lagune de Venise, c'est la pleine saison et le moment idéal pour la récolte des boîtes, dont la culture est restée secrète depuis toujours. Pour la toute première fois, le Grand Jardinier a fait appel à des invités triés sur le volet pour participer à la récolte.",
            "Pour célébrer leur collaboration, Hermès et Apple ont convié 60 invités venus du monde entier à une expérience immersive unique, sur l'île de Mazzorbo.",
        ],
        'chiffres': [('Lieu', 'Île de Mazzorbo, lagune de Venise'), ('Invités', '60, venus du monde entier'), ('Date', 'Juillet 2022')],
        'credits': [('Une création', 'Big Drama'), ('Pour', 'Hermès et Apple')],
        'photos': ['photos/hermes-03.jpg', 'photos/hermes-01.jpg', 'photos/hermes-02.jpg'], 'film': None, 'legende': 'Photos : © Hermès',
        'partenaires': ['v2/assets/original/wp-content/uploads/2022/11/hermes.png', 'v2/assets/original/wp-content/uploads/2022/11/Apple-1.png'],
    },
    {
        'slug': 'better-together', 'id': 'bar', 'titre': 'Better Together', 'logo': 'logos/bar.png',
        'genre': 'Comédie musicale immersive en anglais', 'cadre': 'Création privée pour Pernod Ricard', 'quand': 'Avril 2022', 'ou': 'Retransmise dans le monde entier',
        'accroche': "Quatre colocataires, une mystérieuse invitation, et la dernière soirée d'une amitié.",
        'texte': [
            "Alors qu'ils terminent leurs derniers cartons avant un déménagement, les colocataires de l'appartement 1932 reçoivent une mystérieuse invitation. À la recherche de son expéditeur, les quatre amis vont aller de surprises en rencontres et faire de cette dernière soirée le souvenir ultime de leur amitié.",
            "Pour célébrer sa culture de convivialité, le groupe Pernod Ricard a offert à ses 10 000 collaborateurs une comédie musicale immersive créée sur mesure, jouée et retransmise en direct dans le monde entier.",
        ],
        'chiffres': [('Format', 'Comédie musicale en anglais, en direct'), ('Public', '10 000 collaborateurs'), ('Date', 'Avril 2022')],
        'credits': [('Une création', 'Big Drama'), ('Pour', 'Pernod Ricard')],
        'photos': ['photos/better-show-01.jpg', 'photos/better-show-02.jpg', 'photos/better-show-03.jpg', 'photos/better-show-04.jpg', 'photos/better-together-02.jpg', 'photos/better-together-01.jpg'],
        'film': 'videos/bar-169.mp4', 'legende': 'Photos : © Pernod Ricard',
        'partenaires': ['v2/assets/original/wp-content/uploads/2022/11/pernod-ricard-logo-png-transparent.png'],
    },
    {
        'slug': 'la-prophetie-del-coco', 'id': 'arbre', 'titre': 'La Prophétie del Coco', 'logo': 'logos/arbre.png',
        'genre': 'Création immersive', 'cadre': 'Création immersive pour Bacardí', 'quand': 'Juin 2018', 'ou': '',
        'accroche': "En 1960, avant de quitter Cuba, Diego et Mariposa, les héritiers Bacardí, font un pacte.",
        'texte': [
            "Elle s'installera à Porto Rico pour y préserver le savoir-faire de la famille. Lui sillonnera le monde pour initier le plus grand nombre au rhum Bacardí. Aidée par Les Compañeros, artisans du temps, Mariposa étudie l'art primordial dans la fabrication du rhum : l'art du temps.",
            "Mais ce soir, Mariposa est inquiète. Pour la première fois depuis 1960, Diego n'a pas écrit. Pire encore : pendant la cérémonie de floraison del Coco, l'arbre légendaire de la famille tombe malade. Les Compañeros pensent alors qu'il est temps de trouver un successeur. Il sera désigné au cours des traditionnelles olympiades…",
        ],
        'chiffres': [('Date', 'Juin 2018'), ('Pour', 'Bacardí')],
        'credits': [('Une création', 'Big Drama'), ('Pour', 'Bacardí')],
        'photos': ['photos/coco-01.jpg', 'photos/coco-02.jpg', 'photos/coco-03.jpg', 'photos/prophetie-del-coco-01.jpg', 'photos/prophetie-del-coco-04.jpg'],
        'film': 'videos/arbre-169.mp4', 'legende': 'Photos : Hands Studio.', 'alcool': True,
        'partenaires': ['v2/assets/original/wp-content/uploads/2018/10/mercialfreddfull.png', 'v2/assets/original/wp-content/uploads/2018/10/Truffaut.png'],
    },
    {
        'slug': 'burning-bar', 'id': 'usine', 'titre': 'Burning Bar', 'logo': 'logos/usine.png',
        'genre': 'Expérience immersive', 'cadre': 'Création privée avec Grimbergen', 'quand': 'Juin 2019', 'ou': 'Vieux-Lille',
        'accroche': "Le premier bar éphémère qui brûle tous les soirs et renaît de ses cendres le lendemain.",
        'texte': [
            "Pendant deux semaines en juin 2019, dans un hôtel particulier au cœur du Vieux-Lille, plus de 3 000 visiteurs ont découvert les 900 ans d'histoire de l'abbaye de Grimbergen à travers des expériences sensorielles.",
            "Big Drama a imaginé un univers immersif issu de l'histoire unique de l'abbaye, avec des personnages historiques dépositaires d'un savoir ancestral sur la fabrication et la dégustation de la bière. Tout droit sortis de l'abbaye, ils partageaient avec les invités leur passion pour leur métier, mais aussi leurs états d'âme, leurs conflits et leurs intrigues amoureuses.",
        ],
        'chiffres': [('Lieu', 'Hôtel particulier, Vieux-Lille'), ('Public', 'Plus de 3 000 visiteurs en deux semaines'), ('Date', 'Juin 2019')],
        'credits': [('Une création', 'Big Drama'), ('Avec', 'Grimbergen')],
        'photos': ['photos/grimbergen-01.jpg'], 'film': None, 'legende': 'Photos : Hands Studio.', 'alcool': True,
    },
    {
        'slug': 'viva-barbessia', 'id': 'tour', 'titre': 'Viva Barbessia', 'logo': 'logos/tour.png',
        'genre': 'Soirée de Noël immersive', 'cadre': 'Création privée pour My Little Paris', 'quand': V('Décembre 2018'), 'ou': '',
        'accroche': "Quelques jours avant Noël, l'ambassadeur de Barbessie, petit pays d'Europe orientale dont l'existence est toujours restée secrète, envoie une mystérieuse invitation.",
        'texte': [
            "Pour sauver son pays de l'oubli, il convie les huit dernières familles royales à se rassembler dans son ambassade abandonnée. Les invités vont devoir se faire aux coutumes du royaume de leurs ancêtres, pourvoyeur historique de toutes les fragrances du monde.",
            "La reine Zora, adorée de tous, s'est endormie il y a trente ans et ne s'est jamais réveillée, gardant avec elle les secrets de fabrication des parfums. Au cours de la soirée, l'ambassadeur révèle son véritable dessein : épouser la reine endormie pour devenir roi à son tour. La princesse Youlia, à la tête d'une rébellion destinée à sauver l'honneur de sa mère, aura besoin de l'aide des invités.",
        ],
        'chiffres': [('Date', V('Décembre 2018')), ('Pour', 'My Little Paris')],
        'credits': [('Une création', 'Big Drama'), ('Pour', 'My Little Paris')],
        'photos': ['photos/viva-barbessia-01.jpg', 'photos/viva-barbessia-02.jpg'], 'film': 'videos/tour-169.mp4', 'legende': '',
        'partenaires': ['v2/assets/original/wp-content/uploads/2018/01/LogoMLP.png'],
    },
    {
        'slug': 'eros-en-russie', 'id': 'lune', 'titre': 'Eros en Russie', 'logo': 'logos/lune.png',
        'genre': 'Événement privé', 'cadre': 'Première création immersive pour The Family', 'quand': V('2017'), 'ou': 'Paris 4e',
        'accroche': "Il y a cent ans jour pour jour, dans ce même lieu, on réchauffait les nuits froides au rythme des accords slaves.",
        'texte': [
            "Au numéro 25 de la rue du Petit-Musc, à Paris, alors que les convives de The Family dînent sous l'immense verrière, un mystérieux narrateur les interrompt. Depuis le grand escalier, il les plonge un siècle en arrière, dans les entrailles du Phénix, le cabaret le plus réputé de l'époque.",
            "Ce soir-là, c'est l'anniversaire de Selena, étoile des danseuses. Elle entame son numéro fier et tragique, qui a le goût de sa Russie natale. Elle s'enfièvre, et les autres danseuses se mêlent aux invités pour l'acclamer. Mais bientôt, tout a disparu : Selena et ses filles se sont évaporées, laissant derrière elles le parfum d'un autre temps.",
        ],
        'chiffres': [('Lieu', '25 rue du Petit-Musc, Paris 4e'), ('Pour', 'The Family')],
        'credits': [('Une création', 'Big Drama'), ('Pour', 'The Family')],
        'photos': ['photos/eros-01.jpg', 'photos/eros-02.jpg'], 'film': 'videos/lune-169.mp4', 'legende': '',
        'partenaires': ['v2/assets/original/wp-content/uploads/2017/12/FamilyLogo.png'],
    },
]

# ───────── textes d'Ariane, 28.10.2026 (document « Contenus site internet ») ─────────
# Ils remplacent les textes de l'ancien site ci-dessus. Chiffres alignés sur l'À propos d'Ariane : Close 15 000, Norma 14 000.
# contexte = la phrase en italique d'Ariane (lieu, public, client). presse = extraits de presse.
ARIANE = {
    'norma': {
        'cadre': 'Grand public', 'quand': '2023 – 2024', 'ou': '', 'genre': 'Comédie noire et musicale',
        'accroche': "Ce soir, tous les orphelins enterrent Norma. Elle ne leur laisse que des dettes, et quinze minutes pour monter sa plus grande arnaque.",
        'texte': ["Norma, c’était la reine du clan des orphelins. Elle nous a sauvé la vie et elle nous a tout appris : à lire, à écrire, et même à voler. Alors on prenait aux riches (tout le monde) pour donner aux pauvres (nous). Et puis on est devenus des adultes, et elle une vieille dame.",
                  "Ce soir, tous les orphelins sont réunis pour célébrer son enterrement, et tout ce qu’elle nous lègue, c’est des dettes. Mais elle a pensé à tout : un de ses amis milliardaires est sur le point d’arriver. Elle nous a laissé exactement 15 minutes pour organiser sa plus grande arnaque…"],
        'contexte': "Deuxième spectacle de grande ampleur de Big Drama, cette comédie noire et musicale a rassemblé 14 000 spectateurs dans un ancien hôtel au-dessus des Galeries Lafayette.",
        'presse': [("Des obsèques hautes en couleur à ne pas manquer", "Le Parisien"), ("Des décors qui demanderaient des jours entiers d’observation.", "Regard en Coulisse"),
                   ("Un incontournable du spectacle immersif à Paris !", "Sortiraparis"), ("Impossible de vous dévoiler quoi que ce soit sous peine de vous gâcher la surprise", "Musical Avenue"),
                   ("Un spectacle immersif, mortel et captivant", "L’Internaute")],
    },
    'close': {
        'cadre': 'Grand public', 'quand': '2019 – 2020', 'ou': '',
        'accroche': "Paris, 1918. Au Phénix, cabaret décadent, ce sont les hommes qui se maquillent et les femmes qui commandent. Ici, la guerre n’existe pas.",
        'texte': ["Paris, 1918. Alors que la guerre n’en finit pas, artistes, révolutionnaires et marginaux se retrouvent pour faire la fête au Phénix. Ce soir, le capitaine Émile Barbiquet va épouser Blanche, la petite protégée de la maison. Mais avant de l’accueillir en son sein, la grande famille du Phénix va le soumettre à un jeu étrange…",
                  "Plongez en immersion dans la maison. Vous êtes libres de choisir où aller, qui suivre et à quelle porte écouter."],
        'contexte': "Première grande création immersive de Big Drama pour le grand public, <em>Close</em> s’est jouée à guichets fermés dans une ancienne cartonnerie du 11e arrondissement, pour 15 000 spectateurs.",
        'presse': [("Le charme évanescent d’une immersion", "Le Figaro"), ("Quel délice !", "Le Parisien"), ("Pourvu qu’il y en ait d’autres.", "L’Express"),
                   ("En sortant de Close, on n’a qu’une envie : y retourner", "ELLE"),
                   ("Les comédiens maîtrisent parfaitement leur personnage et peuvent réagir à toutes les interpellations du public.", "France Inter"),
                   ("L’immersion suit son chemin à travers l’histoire.", "Le Monde")],
    },
    'scatolina': {
        'cadre': 'Pour Hermès × Apple', 'quand': '2022', 'ou': '',
        'accroche': "Vous êtes-vous déjà demandé d’où venaient les boîtes orange Hermès ?",
        'texte': ["Une fois par an, sur une petite île perdue dans la lagune de Venise, c’est la pleine saison et le moment idéal pour la récolte des boîtes, dont la culture est restée secrète depuis toujours. Pour la toute première fois, le Grand Jardinier a fait appel à des invités triés sur le volet pour participer à la récolte."],
        'contexte': "En collaboration avec Hermès et Apple, Big Drama a convié 60 invités de marque venus du monde entier pour une expérience immersive grandeur nature à travers l’île de Mazzorbo.",
    },
    'better-together': {
        'cadre': 'Pour Pernod Ricard', 'quand': '2022', 'ou': '',
        'accroche': "Quatre colocataires, une mystérieuse invitation, et la dernière soirée d’une amitié.",
        'texte': ["Alors qu’ils terminent leurs derniers cartons avant un déménagement, les colocataires de l’appartement 1932 reçoivent une mystérieuse invitation. À la recherche de son expéditeur, les quatre amis vont aller de surprises en rencontres et faire de cette dernière soirée le souvenir ultime de leur amitié."],
        'contexte': "Pour célébrer sa culture de la convivialité avec ses 10 000 collaborateurs, le groupe Pernod Ricard a fait appel à Big Drama pour créer une comédie musicale immersive sur mesure, jouée et retransmise en direct dans le monde entier.",
    },
    'un-conte-de-noelle': {
        'cadre': 'Grand public', 'quand': '2021', 'ou': '',
        'accroche': "Un conte de Noël bricolé de toutes pièces, où rien ne se passe comme dans les contes.",
        'texte': ["Dans <em>Un Conte de Noëlle</em>, il y a un Prince qui n’arrive pas à dormir, un Gouvernement catégorique, une méchante marâtre, une orpheline et une famille qui n’a rien d’un conte de fées.",
                  "Ce soir, pour le grand rituel de l’Endormélie, le Prince a choisi de visiter la maison de Noëlle. Avec sa marâtre et son demi-frère Ionel, ils doivent l’accueillir en grande pompe pour espérer être ceux qui arriveront enfin à l’endormir. C’est alors que les tantes de Noëlle, sorcières renégates, vont faire une entrée fracassante pour lui révéler qui elle est vraiment."],
        'contexte': "À la sortie du Covid, Big Drama investit le bar Gallia à Pantin pour un spectacle improvisé dans l’urgence joyeuse de retrouver la scène et le public.",
        'legende': 'Photos : © Le Portrait Parisien.',
    },
    'parfum-de-famille': {
        'cadre': 'Grand public', 'quand': '2021', 'ou': '',
        'accroche': "Chez les Florimond, on fabrique des parfums de luxe et on règle ses comptes en famille. Zinnia, la matriarche, vient d’en faire les frais.",
        'texte': ["Un incendie vient de se produire dans la gigantesque demeure des Florimond, une grande famille de parfumeurs. Zinnia, la matriarche, a été retrouvée morte. Riche, autoritaire et puissante, elle était autant adorée que redoutée. Mais qui aurait pu la tuer ?"],
        'contexte': "Entre théâtre immersif, jeu vidéo et Cluedo, <em>Parfum de Famille</em> fait explorer un manoir virtuel et interroger les suspects en direct, en équipe, depuis chez soi. Lancé pendant la crise sanitaire, <em>Parfum de Famille</em> a affiché complet dès sa sortie.",
    },
    'burning-bar': {
        'cadre': 'Pour Grimbergen', 'quand': '2019', 'ou': '',
        'accroche': "Le premier bar éphémère qui brûle tous les soirs et renaît de ses cendres le lendemain.",
        'texte': ["Big Drama a imaginé un univers issu de l’histoire de l’abbaye, avec des personnages historiques dépositaires d’un savoir ancestral sur la fabrication et la dégustation de la bière. Ils partageaient avec les invités leur passion, mais aussi leurs états d’âme, leurs conflits et leurs intrigues amoureuses."],
        'contexte': "Pendant deux semaines en juin 2019, dans un hôtel particulier au cœur du Vieux-Lille, plus de 3 000 visiteurs ont découvert les 900 ans d’histoire de l’abbaye de Grimbergen.",
    },
    'viva-barbessia': {
        'cadre': 'Pour My Little Paris', 'quand': '2017', 'ou': '',
        'accroche': "Pour sauver son pays de l’oubli, l’ambassadeur de Barbessie convie les huit dernières familles royales dans son ambassade abandonnée.",
        'texte': ["Quelques jours avant Noël, l’ambassadeur de Barbessie, petit pays d’Europe orientale dont l’existence est toujours restée secrète, envoie une mystérieuse invitation. La reine Zora, adorée de tous, s’est endormie il y a trente ans sans jamais se réveiller, gardant avec elle les secrets de fabrication des parfums du royaume."],
        'contexte': "Pour la soirée de Noël de My Little Paris, Big Drama a inventé un pays imaginaire, avec ses coutumes : salut, hymne national, costume folklorique.",
    },
    'la-prophetie-del-coco': {
        'cadre': 'Pour Bacardí', 'quand': '2018', 'ou': '',
        'accroche': "Depuis des générations, l’arbre sacré des Bacardí veille sur le destin de la famille. Mais pour la première fois, il n’a pas fleuri…",
        'texte': ["En 1960, avant de quitter Cuba, Diego et Mariposa, les héritiers Bacardí, font un pacte. Elle s’installera à Porto Rico pour préserver le savoir-faire de la famille. Lui sillonnera le monde pour faire découvrir le rhum Bacardí.",
                  "Mais ce soir, Diego n’a pas écrit, et pendant la cérémonie de floraison del Coco, l’arbre légendaire de la famille tombe malade. Les Compañeros, artisans du temps, organisent des olympiades pour désigner le successeur de Mariposa."],
        'contexte': "Créée pour Bacardí en collaboration avec Merci Alfred et My Little Paris, cette expérience immersive a transformé une maison de famille parisienne en un univers cubain peuplé de 18 musiciens, comédiens, chanteurs et danseurs.",
        'partenaires': ['v2/assets/original/wp-content/uploads/2018/10/mercialfreddfull.png', 'v2/assets/original/wp-content/uploads/2018/01/LogoMLP.png'],
    },
    'eros-en-russie': {
        'cadre': 'Pour The Family', 'quand': '2017', 'ou': '',
        'accroche': "Au Phénix, les nuits sont longues et les amours malheureuses. Ce soir, on fête l’anniversaire de Selena, et personne ne sait encore que ce sera la dernière fois.",
        'texte': ["Il y a cent ans jour pour jour, dans ce même lieu, on réchauffait les nuits froides au rythme des accords slaves.",
                  "Au 25 rue du Petit-Musc, à Paris, alors que les convives de The Family dînent sous l’immense verrière, un mystérieux narrateur les interrompt. Depuis le grand escalier, il les plonge un siècle en arrière, dans les entrailles du Phénix, le cabaret le plus réputé de l’époque.",
                  "Ce soir-là, c’est l’anniversaire de Selena, étoile des danseuses. Elle entame son numéro, fier et tragique. Mais bientôt, Selena et ses filles se sont évaporées, laissant derrière elles le parfum d’un autre temps."],
        'contexte': "Imaginée pour un dîner de The Family, cette expérience immersive surgissait au milieu des convives pour les entraîner un siècle en arrière, le temps d’un instant suspendu.",
    },
}
for _c in CREATIONS:
    _c.update(ARIANE.get(_c['slug'], {}))
    _c['chiffres'] = []          # ligne de chiffres supprimée : la phrase d'Ariane (contexte) la remplace

APROPOS = {   # textes d'Ariane, 28.10.2026
    'ouverture': ["Nous croyons tellement aux histoires que nous avons décidé de les rendre réelles.",
                  "Nous aimons les grandes tragédies, les petites arnaques, les gens qui se trompent et les familles qui se choisissent.",
                  "Depuis 2017, nous écrivons et produisons nos propres spectacles de façon indépendante. Nous fabriquons des mondes de toutes pièces, dans des lieux qui n’étaient pas faits pour ça, pour y inviter le public et retrouver le plaisir de jouer ensemble."],
    'titre2': 'Conteurs contemporains',
    'chapeau': "À la croisée du collectif d’artistes et de la maison de production, Big Drama réinvente la façon de raconter les histoires.",
    'texte': [
        "Nous avons créé Big Drama en 2017 pour inventer un modèle indépendant pour le spectacle vivant. Écriture, mise en scène, scénographie, musique : nous rassemblons tous les métiers nécessaires à la création d’un spectacle, puis nous le produisons et le diffusons nous-mêmes, dans des lieux qui n’étaient pas faits à la base pour le spectacle vivant.",
        "Après <em>Close</em>, joué devant 15 000 spectateurs, la crise sanitaire nous a poussés à inventer une enquête immersive en ligne, <em>Parfum de Famille</em>. Puis <em>Norma</em>, comédie noire et musicale, a accueilli 14 000 spectateurs pendant cinq mois dans un ancien hôtel au-dessus des Galeries Lafayette.",
        "Nous croyons en un théâtre à la fois exigeant, poétique et ouvert à tous.",
    ],
    'equipe': [
        ('Alexis Pivot', 'Cofondateur · direction artistique, écriture, musique', ''),   # biographie à fournir
        ('Ariane Raynaud', 'Cofondatrice · mise en scène, écriture', ''),
    ],
}

# ───────── gabarit ─────────
CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"


def image(chemin, carte, R):
    e = carte.get(chemin)
    return R + ('v8/assets/opt/' + e['src'] if e else chemin)


def entete(R, actif):
    lien = lambda href, nom, cle: f'<a href="{href}"{" aria-current=\"page\"" if actif == cle else ""}>{nom}</a>'
    return (f'<header class="cr-entete"><a class="cr-marque" href="{R}v8/" aria-label="Big Drama, accueil"><img src="{R}v2/assets/brand-white.svg" alt="Big Drama"></a>'
            f'<nav aria-label="Navigation principale">{lien(R + "v8/a-propos/", "À propos", "apropos")}{lien(R + "v8/#histoire", "Créations", "creations")}{lien(R + "v8/#contact", "Contact", "contact")}</nav></header>')


def pied(R):
    return (f'<footer class="cr-pied" id="contact"><p class="cr-pied-titre">Une histoire à raconter ?</p>'
            f'<a class="cr-bouton" href="{R}v2/contactform.html">Nous contacter</a>'
            f'<p class="cr-reseaux"><a href="https://www.facebook.com/bigdramaparis">Facebook</a><a href="https://instagram.com/bigdramaparis">Instagram</a><a href="https://www.linkedin.com/company/big-drama/">LinkedIn</a></p>'
            f'<p class="cr-legal">© Big Drama 2026 · <a href="{R}v2/mentionslegales.html">Mentions légales</a> · <a href="{R}v2/cgv.html">CGV</a> · <a href="{R}v2/politiqueconfidentialite.html">Politique de confidentialité</a></p></footer>')


def page(titre, description, R, corps, actif, version, image_og=''):
    return f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="{CSP}"><meta name="referrer" content="strict-origin-when-cross-origin">
<title>{E(titre)}</title><meta name="description" content="{E(description)}">
<meta property="og:type" content="article"><meta property="og:title" content="{E(titre)}"><meta property="og:description" content="{E(description)}">{image_og}
<link rel="stylesheet" href="{R}v8/fonts/fonts.css"><link rel="stylesheet" href="{R}v8/creations/creations.css?v={version}">
<link rel="icon" type="image/png" href="{R}v8/favicon.png"><script src="{R}v8/creations/creations.js?v={version}" defer></script></head>
<body class="cr">{entete(R, actif)}<main id="contenu">{corps}</main>{pied(R)}</body></html>
'''


def page_creation(c, i, carte, version):
    R = '../../../'
    prec, suiv = CREATIONS[i - 1], CREATIONS[(i + 1) % len(CREATIONS)]
    photos = c['photos']
    fond = image(photos[0], carte, R)
    sous = ' · '.join(x for x in (c['genre'], c['quand'], c['ou']) if x)
    texte = ''.join(f'<p>{t}</p>' for t in c['texte'])
    chiffres = ''.join(f'<div><dt>{E(k)}</dt><dd>{v}</dd></div>' for k, v in c['chiffres'])
    film = ''
    if c.get('film'):
        f540 = 'v8/assets/opt/videos/' + Path(c['film']).stem + '-540.mp4'
        film = (f'<section class="cr-film" aria-label="Film"><video controls muted playsinline preload="none" poster="{image(photos[1] if len(photos) > 1 else photos[0], carte, R)}">'
                f'<source media="(max-width:900px)" src="{R}{f540}" type="video/mp4"><source src="{R}{c["film"]}" type="video/mp4"></video></section>')
    galerie = ''.join(f'<li><button type="button" data-grand="{image(p, carte, R)}" aria-label="Agrandir la photo {k + 1}"><img src="{image(p, carte, R)}" alt="" loading="lazy" decoding="async"></button></li>' for k, p in enumerate(photos))
    legende = c.get('legende', '')
    if c.get('alcool'):
        legende += (' ' if legende else '') + "L'abus d'alcool est dangereux pour la santé. À consommer avec modération."
    credits = ''.join(f'<div><dt>{E(k)}</dt><dd>{E(v)}</dd></div>' for k, v in c['credits'])
    presse = ''
    if c.get('presse'):
        presse = '<section class="cr-presse" aria-label="La presse"><ul>' + ''.join(f'<li><blockquote>« {E(q)} »</blockquote><cite>{E(src)}</cite></li>' for q, src in c['presse']) + '</ul></section>'
    distribution = ''
    if c.get('distribution'):
        blocs = ''.join(f'<h3>{E(t)}</h3><dl class="cr-liste">' + ''.join(f'<div><dt>{E(a)}</dt><dd>{E(b)}</dd></div>' for a, b in lignes) + '</dl>' for t, lignes in c['distribution'])
        distribution = f'<details class="cr-distribution"><summary>Distribution et équipe complètes</summary>{blocs}</details>'
    partenaires = ''
    if c.get('partenaires'):
        partenaires = '<section class="cr-partenaires" aria-label="Partenaires"><h2>Avec</h2><ul>' + ''.join(f'<li><img src="{R}{p}" alt="" loading="lazy"></li>' for p in c['partenaires']) + '</ul></section>'
    corps = f'''
<section class="cr-tete" style="--fond:url('{fond}')"><div class="cr-tete-voile"></div>
 <div class="cr-tete-contenu"><p class="cr-cadre">{E(c["cadre"])}</p>
  <h1><img class="cr-logo cr-logo-{c["slug"]}" src="{image(c["logo"], carte, R)}" alt="{E(c["titre"])}"></h1>
  <p class="cr-sous">{sous}</p></div>
 <svg class="cr-trait" viewBox="0 0 1600 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 L420 22 L800 30 L1180 18 L1600 28"/></svg></section>
<article class="cr-corps">
 <p class="cr-accroche">{c["accroche"]}</p>
 {f'<div class="cr-texte">{texte}</div>' if texte else ''}
 {f'<p class="cr-contexte">{c["contexte"]}</p>' if c.get('contexte') else ''}
 {f'<dl class="cr-chiffres">{chiffres}</dl>' if chiffres else ''}
</article>
{presse}
{film}
<section class="cr-galerie" aria-label="Photos"><ul>{galerie}</ul>{f'<p class="cr-legende">{E(legende)}</p>' if legende else ''}</section>
<section class="cr-credits" aria-label="Crédits"><h2>Crédits</h2><dl class="cr-liste">{credits}</dl>{distribution}</section>
{partenaires}
<nav class="cr-suite" aria-label="Autres créations"><a href="../{prec["slug"]}/"><span>Précédente</span>{E(prec["titre"])}</a><a class="cr-retour" href="{R}v8/#rue">Retour à la rue</a><a href="../{suiv["slug"]}/"><span>Suivante</span>{E(suiv["titre"])}</a></nav>
<div class="cr-visionneuse" hidden><button type="button" class="cr-fermer" aria-label="Fermer">×</button><img alt=""></div>'''
    desc = re.sub(r'<[^>]+>', '', c['accroche'])[:150]
    desc = (desc).replace('<span class="a-verifier" title="À vérifier">', '').replace('</span>', '')
    og = f'<meta property="og:image" content="https://johnmetronome.github.io/bigdrama-maquette/{photos[0]}">'
    return page(f'{c["titre"]} · Big Drama', desc, R, corps, 'creations', version, og)


def page_apropos(carte, version):
    R = '../../'
    a = APROPOS
    equipe = ''.join(f'<li><h3>{E(n)}</h3><p class="cr-role">{E(r)}</p>{f"<p>{b}</p>" if b else ""}</li>' for n, r, b in a['equipe'])
    liste = ''.join(f'<li><a href="../creations/{c["slug"]}/"><img class="cr-logo-{c["slug"]}" src="{image(c["logo"], carte, R)}" alt=""><span>{E(c["titre"])}</span><small>{c["quand"]}</small></a></li>' for c in CREATIONS)
    corps = f'''
<section class="cr-tete cr-tete-apropos" style="--fond:url('{image("photos/close-teaser-07.jpg", carte, R)}')"><div class="cr-tete-voile"></div>
 <div class="cr-tete-contenu"><p class="cr-cadre">À propos</p><h1 class="cr-titre-texte">Big Drama</h1><p class="cr-sous">Conception et production de spectacles immersifs · Paris</p></div>
 <svg class="cr-trait" viewBox="0 0 1600 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 L420 22 L800 30 L1180 18 L1600 28"/></svg></section>
<article class="cr-corps cr-ouverture">{"".join(f'<p class="cr-accroche">{t}</p>' for t in a["ouverture"])}</article>
<article class="cr-corps"><h2 class="cr-h2">{E(a["titre2"])}</h2><p class="cr-chapeau">{a["chapeau"]}</p><div class="cr-texte">{"".join(f"<p>{t}</p>" for t in a["texte"])}</div></article>
<section class="cr-equipe" aria-label="Équipe"><h2>Les fondateurs</h2><ul>{equipe}</ul></section>
<section class="cr-toutes" aria-label="Toutes les créations"><h2>Les créations</h2><ul>{liste}</ul></section>'''
    return page('À propos · Big Drama', a['ouverture'][0], R, corps, 'apropos', version)


def generer(carte, version):
    (OUT / 'creations').mkdir(parents=True, exist_ok=True)
    for i, c in enumerate(CREATIONS):
        d = OUT / 'creations' / c['slug']; d.mkdir(parents=True, exist_ok=True)
        (d / 'index.html').write_text(page_creation(c, i, carte, version), encoding='utf-8')
    (OUT / 'a-propos').mkdir(exist_ok=True)
    (OUT / 'a-propos' / 'index.html').write_text(page_apropos(carte, version), encoding='utf-8')
    shutil.copy2(ICI / '_creations.css', OUT / 'creations' / 'creations.css')
    shutil.copy2(ICI / '_creations.js', OUT / 'creations' / 'creations.js')
    return {c['id']: c['slug'] for c in CREATIONS}


if __name__ == '__main__':
    f = OUT / 'assets' / 'opt' / 'carte.json'
    print(generer(json.loads(f.read_text()) if f.exists() else {}, 'dev'))
