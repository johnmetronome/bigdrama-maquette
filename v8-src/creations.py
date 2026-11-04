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
CONTACT = 'contact@big-drama.fr'   # boîte du nouveau domaine, créée par Alex le 02.11.2026 (retours Mistral S4 et Gemini)
BILLETTERIE = 'https://www.billetweb.fr/shop.php?event=la-veillee-bigdrama'   # La Veillée, Billetweb (événement de Rémi, 02.11.2026)

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
    _c['type'] = 'public' if _c['slug'] in ('norma', 'close', 'parfum-de-famille', 'un-conte-de-noelle') else 'marque'
    _c['da'] = _c['slug']
    _c['marque'] = {
        'scatolina': 'Hermès × Apple', 'better-together': 'Pernod Ricard',
        'la-prophetie-del-coco': 'Bacardí', 'burning-bar': 'Grimbergen',
        'viva-barbessia': 'My Little Paris', 'eros-en-russie': 'The Family',
    }.get(_c['slug'], '')

# ───────── réponses d'Ariane, 29.10.2026 (Google Doc « questions pour Ariane ») ─────────
# Chiffres : Close plus de 12 000 spectateurs, Norma 15 000. Crédits de Norma et de Close fournis par Ariane.
# Pas de crédits pour les autres créations, pas de logos partenaires sur Close, pas de bios ni de portraits.
REPONSES = {
    'norma': {
        'contexte': "Deuxième spectacle de grande ampleur de Big Drama, cette comédie noire et musicale a rassemblé 15 000 spectateurs dans un ancien hôtel au-dessus des Galeries Lafayette.",
        'credits': [
            ('Écriture', 'Alexis Pivot et Ariane Raynaud, en collaboration avec l’ensemble des comédien·nes'),
            ('Mise en scène', 'Ariane Raynaud'), ('Direction artistique et musicale', 'Alexis Pivot'),
            ('Scénographie', 'Doriane Fréreau'), ('Costumes', 'Juliette du Pont de Romémont, assistée de Margot Déon et Bérangère Pivot'),
            ('Lumières', 'Denis Koransky'), ('Production', 'Noémie Benizri'),
        ],
        'distribution': [
            ('Distribution', [('Avec, en alternance', 'Lucas Berger, Nathanaël Bez, Victor Bourigault, Louis Buisset, Éléonore Duizabo, Nouritza Emmanuelian, Anthony Fernandes, Eva Freitas, Eva Gentili, Chelsee Gunputh, Alexis Pivot, Rosy Pollastro, Ariane Raynaud, Diane Renier, Morgane Ricoteau-Jérôme, Steven Sequeira')]),
            ('L’équipe', [('Crew manager et casting', 'Rosy Pollastro'), ('Maquillage', 'Fanny Jakubowicz'), ('Coiffure', 'Louma Sliti'),
                          ('Coaching vocal', 'Antonio Macipe'), ('Communication et marketing', 'Nathanaël Bez'), ('Direction financière', 'Mathieu Bressenot')]),
        ],
    },
    'close': {
        'contexte': "Première grande création immersive de Big Drama pour le grand public, <em>Close</em> s’est jouée à guichets fermés dans une ancienne cartonnerie du 11e arrondissement, pour plus de 12 000 spectateurs.",
        'partenaires': [],
        'credits': [
            ('Écrit par', 'Clément Marchand, Alexis Pivot, Ariane Raynaud, en collaboration avec l’ensemble des comédien·nes'),
            ('D’après', 'Close 1, écrit par Roman Carrère, Clément Marchand, Alexis Pivot et Ariane Raynaud'),
            ('Direction artistique', 'Alexis Pivot'), ('Mise en scène', 'Ariane Raynaud, assistée de Rosy Pollastro'),
            ('Musique', 'Alexis Pivot'), ('Scénographie', 'Doriane Fréreau'), ('Costumes', 'Juliette du Pont de Romémont'),
            ('Chorégraphie', 'Emma Scherer'), ('Lumières', 'Arnaud Bouret, assisté de Lenaïc Pujol'), ('Son', 'Jacques Estève'),
        ],
        'distribution': [
            ('Distribution', [
                ('Avec', 'Nathanaël Bez, Clara Brajtman, Anthony Fernandes, Eva Freitas, Baptiste Marc, Fanny Pascaud, Alexis Pivot, Rosy Pollastro, Diane Renier, Emma Scherer et Guillaume Tagnati'),
                ('En alternance', 'Marine André, Laurent Evuort-Orlandi, Pascal Lacoste, Gaëlle Pauly et Ariane Raynaud'),
                ('Le personnel du Phénix', 'Lucas Hoffmann, Louis Busset, Odran Guillemard et Célia Pyamootoo'),
                ('Au café-concert des Heures Joyeuses', 'Jahel Japhet ou Morgane Ricoteau-Jérôme'),
                ('Au bar du Phénix', 'Mélina Fernandez, Dylan Arab, Mike Kibuanda')]),
            ('L’équipe', [
                ('Régie', 'Maxime Martin, assisté d’Eloi Morival'), ('Régie technique', 'Adrien Lacaille, Lenaïc Pujol et Arnaud Bouret'),
                ('Habillage', 'Bérangère Pivot, assistée de Lucile Fauchier'),
                ('Équipe de scénographie', 'Cécile Peillon, Vivian Guillermin, Clément Bourdeleau, Cristina Becerra, Sarah Dureuil, Nicolas Nicolle'),
                ('Assistant·es montage', 'Pierre Bertet, Sébastien Dumas, Jim Quernez, Amélie Villeneuve, Quentin Tally, Lola Lambrez'),
                ('Couture', 'Margot Déon'), ('Coiffure', 'Eduardo Alvarez'), ('Maquillage', 'Fanny Jakubowicz'),
                ('Direction de casting', 'Rosy Pollastro'), ('Producteur', 'Mathieu Bressenot'),
                ('Direction de production', 'Noémie Benizri et Gersende Michel, Raoule Productions'), ('Stagiaire production', 'Anaïs Joubert'),
                ('La Cartonnerie', 'Arnaud Bouret, Marion Delemazure, Nick Jones'), ('Commercial', 'Emeline Dewitte'), ('Stagiaire commercial', 'Héléna Beyer'),
                ('Communication et marketing', 'Nathanaël Bez'), ('Création graphique et coordination', 'Juliette Delvienne'), ('Presse', 'Valérie Talagas'),
                ('Conseil juridique', 'Clara Benyamin'), ('Production de bar', 'Florence Demarcy'), ('Traiteur', 'Tess en Cuisine'),
                ('Sécurité', 'Koff Security : Ulrich Kpetehoto, Sidi Mohamed Diakitée et Mady Ndiaye')]),
        ],
    },
}
for _c in CREATIONS:
    _c.update(REPONSES.get(_c['slug'], {}))

# V8.23 · Norma et Close, V8.25 · toutes les créations qui ont un film : le film devient le bandeau de tête,
# muet, en boucle. Plus de film en bas de page. Sans film : pas de photo en tête, le titre seul (Alex, 01.11.2026).
# V8.25 · plus de « Grand public » ni « Pour <marque> » en tête des pages (La Veillée garde « Nouvelle création »).
for _c in CREATIONS:
    _c['cadre'] = ''
    if _c.get('film'):
        _nom = Path(_c['film']).stem.replace('-169', '')
        _c['tete_video'] = {'film': f"v8/assets/films/tete-{_nom}-720.mp4", 'mobile': f"v8/assets/opt/videos/{Path(_c['film']).stem}-540.mp4", 'affiche': f'v8/assets/films/{_nom}-poster.jpg'}
        _c['film'] = None
    if _c['slug'] in ('parfum-de-famille', 'scatolina', 'burning-bar'):
        _c['simple'] = True   # V8.26 · pas de film : page courte (titre, une image, l'histoire, crédits) (Alex, 01.11.2026). Burning Bar : V8.29
    if _c['slug'] == 'un-conte-de-noelle':
        # V8.29 · pas de film : diaporama lent des photos de la sélection d'Alex (10 photos, 6 s chacune, fondus, 60 s en boucle)
        _c['tete_video'] = {'film': 'v8/assets/films/tete-noelle-720.mp4', 'mobile': 'v8/assets/films/tete-noelle-540.mp4', 'affiche': 'v8/assets/films/un-conte-de-noelle-poster.jpg'}
    if _c['slug'] == 'norma':
        _c['photos'] = ['photos/norma-rosy.jpg'] + _c['photos']   # V8.29 · photo d'Alessandro Clemenza (DSC06981, Alex, 02.11.2026)
    if _c['slug'] == 'close':
        _c['photos'] = [x for x in _c['photos'] if x != 'photos/close-04.jpg']   # « la photo du général » (Alex, 01.11.2026)


# La Veillée : page sur le même modèle. Dates, photos de spectacle et crédits à fournir : rien n'est inventé.
CREATIONS.insert(0, {
    # Textes : Ariane (01.11.2026). Dates, lieu, infos pratiques, équipe, billetterie : paquet de Rémi Large (01.11.2026).
    # Visuel : « La veillée sur mur décrépit » (31.10.2026). Horaires des séances : à fournir, rien d'affiché en attendant.
    'slug': 'la-veillee', 'id': 'veillee', 'titre': 'La Veillée', 'logo': None,
    'genre': '', 'cadre': 'Nouvelle création', 'quand': '26 et 27 novembre 2026', 'ou': 'Paris 20e',
    'accroche': "Pour que les histoires ne meurent jamais",
    'devise': ["Nous ne sommes que les voix de nos histoires", "Ce qu’on nous a raconté, nous le raconterons"],
    'texte': ["Depuis que les machines ont pris le pouvoir et interdit toute forme de fiction, un groupe de rebelles se réunit dans un refuge clandestin pour se souvenir des histoires qui ont fait l’humanité.",
              "Mais comment raconter nos plus grandes œuvres, de Shakespeare à <em>Retour vers le futur</em>, quand tous les livres et les films ont été détruits ? Il ne leur reste que leurs souvenirs incertains, un piano et l’imagination des spectateurs pour réinventer, soir après soir, ce cabaret brinquebalant, qui ne cesse de changer et que l’on appelle la Veillée."],
    'citation': ("Le feu ne brûlait pas pour détruire : il réchauffait.", "Fahrenheit 451"),
    'tete_video': {'film': 'v8/assets/films/la-veillee-1080.mp4', 'mobile': 'v8/assets/films/la-veillee-540.mp4', 'affiche': 'v8/assets/films/la-veillee-poster.jpg'},
    'reserver': BILLETTERIE,
    'dates_courtes': '26 et 27 novembre 2026 · Paris 20e',
    # Horaires et tarifs : Rémi, 02.11.2026 (portes 19 h 30, spectacle 20 h, durée 1 h 30, 20 € sans consommation, 25 € avec)
    'evenement': {'dates': ['2026-11-26', '2026-11-27'], 'portes': '19:30', 'debut': '20:00', 'fin': '21:30', 'prix': ['20', '25'], 'lien': BILLETTERIE},
    # FAQ : questions de la FAQ Norma (Ariane, 2023) dont la réponse est connue pour La Veillée (paquet de Rémi, 01.11.2026)
    # V8.31 · lieu public : « Paris 20e » seulement, ni nom ni adresse ni accès (Alex, 02.11.2026)
    'faq': [("Où se joue le spectacle ?", "À Paris, dans le 20e arrondissement."),
            ("Combien de temps dure l’expérience ?", "Le spectacle dure 1 h 30."),
            ("À partir de quel âge peut-on venir ?", "Nous recommandons le spectacle à partir de 12 ans."),
            ("À quelle heure ?", "Ouverture des portes à 19 h 30, début du spectacle à 20 h."),
            ("Où acheter les billets ?", 'En ligne, sur <a href="../../billetterie/">notre page Billetterie</a>.'),
            ("Qu’en est-il des personnes à mobilité réduite ?", f"Le lieu est accessible aux personnes à mobilité réduite, à l’exception de deux marches à l’entrée. Écrivez-nous avant votre venue à <a href=\"mailto:{CONTACT}\">{CONTACT}</a>, nous organiserons votre accueil."),
            ("Nous n’avons pas répondu à votre question ?", f'<a href="mailto:{CONTACT}">Écrivez-nous</a>.')],
    'contexte': '', 'chiffres': [],
    'credits': [("Autrice, mise en scène, chant, interprétation", "Ariane Raynaud"),
                ("Auteur, direction artistique, musique, interprétation", "Alexis Pivot"),
                ("Artistes", "Emma Scherer, Colin Melquiond, Madeleine Flodd"),
                ("Assistante à la mise en scène", "Julia Erin"),
                ("Scénographie", "Camille Dugas"),
                ("Costumes", "Juliette de Romemont"),
                ("Habilleuse", "Bérangère Pivot"),
                ("Accessoires", "Les Petites Odyssées"),
                ("Création lumière", "Titouan Laporte"),
                ("Production", "Rémi Large")],
    'photos': ['v8/assets/la-veillee-mur-v2.jpg'], 'film': None, 'legende': '',
    'type': 'public', 'da': 'la-veillee', 'marque': '', 'bandeau': 'v8/assets/la-veillee-mur-v2.jpg',
})
# V8.31 · ordre des créations (accueil, précédent / suivant) : les pages les plus riches en images d'abord,
# Parfum de Famille en dernier (retour de Rémi, 02.11.2026).
ORDRE = ['la-veillee', 'norma', 'close', 'un-conte-de-noelle', 'scatolina', 'better-together', 'la-prophetie-del-coco',
         'viva-barbessia', 'eros-en-russie', 'burning-bar', 'parfum-de-famille']   # V8.33 · Scatolina après Noëlle (Ariane)
CREATIONS.sort(key=lambda c: ORDRE.index(c['slug']))

# ───────── V8.33 · retours d'Ariane (02.11.2026) ─────────
# Sous-titres : mêmes textes sur l'accueil (bandeaux, rue) et en tête de chaque page. Plus d'année ni de lieu.
SOUS_TITRES = {
    'la-veillee': 'Théâtre musical clandestin',   # texte canon du 04.11.2026
    'norma': 'Comédie musicale noire et immersive',
    'close': 'Spectacle immersif dans un cabaret de 1918',
    'un-conte-de-noelle': 'Fable immersive',
    'scatolina': 'Création privée Hermès & Apple',
    'better-together': 'Création privée Pernod Ricard',
    'la-prophetie-del-coco': 'Création privée Bacardí',
    'viva-barbessia': 'Création privée My Little Paris',
    'eros-en-russie': 'Création privée The Family',
    'burning-bar': 'Création privée Grimbergen',
    'parfum-de-famille': 'Enquête en ligne immersive',
}
PARTENAIRE_MLP = 'v2/assets/original/wp-content/uploads/2018/01/LogoMLP.png'
PARTENAIRE_MA = 'v2/assets/original/wp-content/uploads/2018/10/mercialfreddfull.png'
for _c in CREATIONS:
    _c['sous_titre'] = SOUS_TITRES[_c['slug']]
    _s = _c['slug']
    if _s == 'norma':
        _c['logo'] = 'logos/norma-neon.png'   # logo néon officiel (fichier « Norma - Nom en solo - 04 typo 1 »)
    if _s in ('norma', 'close', 'viva-barbessia', 'eros-en-russie', 'la-prophetie-del-coco') and _c.get('tete_video'):
        # films de tête remontés sans les cartons titres ni les sous-titres incrustés
        _nom = Path(_c['tete_video']['film']).stem.replace('tete-', '').replace('-720', '')
        _c['tete_video']['mobile'] = f'v8/assets/films/tete-{_nom}-540.mp4'
    if _s == 'better-together':
        _c['accroche'] = "Quatre colocataires, une mystérieuse invitation et une soirée pour célébrer une amitié."
        _c['photos'] = [x for x in _c['photos'] if x != 'photos/better-show-04.jpg']   # « brand show » retirée
    if _s == 'la-prophetie-del-coco':
        _c['alcool'] = False
        _c['partenaires'] = ['v8/assets/partenaires/bacardi.png', PARTENAIRE_MA, PARTENAIRE_MLP]
    if _s == 'eros-en-russie':
        _c['partenaires'] = []
    if _s == 'scatolina':
        _c['tete_photo'] = 'photos/hermes-03.jpg'   # « la photo d'Anthony »
        _c['partenaires'] = ['v8/assets/partenaires/hermes.png', 'v8/assets/partenaires/apple.png']
    if _s in ('burning-bar', 'parfum-de-famille'):
        _c['tete_photo'] = _c['photos'][0]
    if _s == 'la-veillee':
        _c['boucle'] = True   # V8.36 · boucle sur la partie jaune du packshot (Alex, 04.11.2026), la partie bleue est retirée
        # V8.35 · texte canon (Alex, 04.11.2026) : titre, sous-titre, citation, synopsis à la première personne
        _c['accroche'] = ''
        _c['devise'] = []
        _c['citation_avant'] = True
        _c['synopsis_titre'] = ''   # V8.36 · titre « Synopsis » retiré (Alex)
        _c['texte'] = [
            "Depuis que les machines ont pris le pouvoir et interdit toute forme de fiction, nous nous retrouvons dans un refuge clandestin pour faire revivre les histoires qui ont fait l’humanité.",
            "Mais comment raconter nos plus grandes œuvres, de Shakespeare à <em>Retour vers le futur</em>, quand tous les livres et les films ont été détruits ?",
            "Il ne nous reste que nos souvenirs incertains, un piano et votre imagination pour réinventer, soir après soir, ce cabaret brinquebalant, qui ne cesse de changer et que nous appelons La Veillée.",
        ]
        _c['og'] = 'v8/assets/la-veillee-partage.jpg'   # image de partage 1200 × 630 tirée du packshot
        _c['description'] = "La Veillée, théâtre musical clandestin de Big Drama : 26 et 27 novembre 2026, Paris 20e. Depuis que les machines ont interdit toute fiction, nous nous retrouvons pour faire revivre les histoires."
        # packshot V23 : 16:9 sur grand écran, 4:5 pris dans la version verticale sur téléphone tenu droit
        _c['tete_video'] = {'film': 'v8/assets/films/la-veillee-v23-boucle-1080.mp4', 'mobile': 'v8/assets/films/la-veillee-v23-boucle-540.mp4',
                            'portrait': 'v8/assets/films/la-veillee-v23-boucle-portrait.mp4', 'affiche': 'v8/assets/films/la-veillee-v23-poster.jpg',
                            'affiche_portrait': 'v8/assets/films/la-veillee-v23-portrait-poster.jpg'}
        _c['faq_billetterie'] = _c['faq']   # gardée pour une future FAQ sur la billetterie
        _c['faq'] = []         # pas de FAQ sur le site vitrine (Ariane)


APROPOS = {   # textes d'Ariane, 28.10.2026
    'ouverture': ["Depuis 2017, nous écrivons et produisons nos propres spectacles de façon indépendante. Nous fabriquons des mondes de toutes pièces, dans des lieux qui n’étaient pas faits pour ça, pour y inviter le public et retrouver le plaisir de jouer ensemble."],
    'titre2': 'Conteurs contemporains',
    'chapeau': "À la croisée du collectif d’artistes et de la maison de production, Big Drama réinvente la façon de raconter les histoires.",
    'texte': [
        "Nous avons créé Big Drama en 2017 pour inventer un modèle indépendant pour le spectacle vivant. Écriture, mise en scène, scénographie, musique : nous rassemblons tous les métiers nécessaires à la création d’un spectacle, puis nous le produisons et le diffusons nous-mêmes, dans des lieux qui n’étaient pas faits à la base pour le spectacle vivant.",
        "Après <em>Close</em>, joué devant plus de 12 000 spectateurs, la crise sanitaire nous a poussés à inventer une enquête immersive en ligne, <em>Parfum de Famille</em>. Puis <em>Norma</em>, comédie noire et musicale, a accueilli 15 000 spectateurs pendant cinq mois dans un ancien hôtel au-dessus des Galeries Lafayette.",
        "Nous croyons en un théâtre à la fois exigeant, poétique et ouvert à tous.",
    ],
    'equipe': [
        ('Ariane Raynaud', 'Cofondatrice · mise en scène, écriture', ''),
        ('Alexis Pivot', 'Cofondateur · direction artistique, écriture, musique', ''),
        ('Rémi Large', 'Production', ''),   # nom et rôle : paquet La Veillée de Rémi (01.11.2026)
    ],
    'portraits': {},
}

# ───────── gabarit ─────────
ANNEE = 2026
CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"


def image(chemin, carte, R):
    e = carte.get(chemin)
    return R + ('v8/assets/opt/' + e['src'] if e else chemin)


def jeu_images(chemin, carte, R):
    """srcset des images qui en ont un (bandeaux en deux tailles)."""
    e = carte.get(chemin)
    if not e or 'srcset' not in e:
        return ''
    return ' srcset="' + ', '.join(R + 'v8/assets/opt/' + x.strip() for x in e['srcset'].split(',')) + '"'


def entete(R, actif):
    lien = lambda href, nom, cle, plus='': f'<a href="{href}" class="cr-nav-{cle}"{" aria-current=\"page\"" if actif == cle else ""}{plus}>{nom}</a>'
    return (f'<header class="cr-entete"><a class="cr-marque" href="{R}v8/?direct#creations" aria-label="Big Drama, retour aux créations"><img src="{R}v2/assets/brand-white.svg" alt="Big Drama"></a>'
            f'<nav aria-label="Navigation principale">{lien(R + "v8/billetterie/", "Billetterie", "billetterie")}'
            f'{lien(R + "v8/a-propos/", "À propos", "apropos")}{lien(R + "v8/?direct#creations", "Créations", "creations")}{lien("mailto:" + CONTACT, "Contact", "contact")}</nav></header>')


def pied(R, appel=False):
    return (f'<footer class="cr-pied" id="contact">'
            f'<p class="cr-reseaux"><a href="mailto:{CONTACT}">Email</a><a href="https://www.facebook.com/bigdramaparis" target="_blank" rel="noopener">Facebook</a><a href="https://instagram.com/bigdramaparis" target="_blank" rel="noopener">Instagram</a><a href="https://www.linkedin.com/company/big-drama/" target="_blank" rel="noopener">LinkedIn</a></p>'
            f'<p class="cr-legal">© Big Drama {ANNEE} · <a href="{R}v8/mentions-legales/">Mentions légales</a> · <a href="{R}v8/cgv/">CGV</a> · <a href="{R}v8/confidentialite/">Politique de confidentialité</a></p></footer>')


def typo(h):
    """Espaces fines insécables avant : ? ! ; » et après «, dans le texte seulement (pas dans les balises)."""
    morceaux = re.split(r'(<script[\s\S]*?</script>|<style[\s\S]*?</style>|<[^>]+>)', h)
    for k in range(0, len(morceaux), 2):
        if morceaux[k].strip():
            morceaux[k] = re.sub(r' ([:?!;»])', '\u202f\\1', morceaux[k]).replace('« ', '«\u202f')
    return ''.join(morceaux)


def page(titre, description, R, corps, actif, version, image_og='', slug='', appel=False, csp=CSP):
    return typo(f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="{csp}"><meta name="referrer" content="strict-origin-when-cross-origin">
<title>{E(titre)}</title><meta name="description" content="{E(description)}">
<meta property="og:type" content="article"><meta property="og:title" content="{E(titre)}"><meta property="og:description" content="{E(description)}">{image_og}
<link rel="stylesheet" href="{R}v8/fonts/fonts.css"><link rel="stylesheet" href="{R}v8/creations/creations.css?v={version}">
<link rel="icon" type="image/png" href="{R}v8/favicon.png"><script src="{R}v8/creations/creations.js?v={version}" defer></script></head>
<body class="cr{(' cr-' + E(slug)) if slug else ''}">{entete(R, actif)}<main id="contenu">{corps}</main>{pied(R, appel)}</body></html>
''')


def faq(c, R='../../'):
    """V8.31 · les questions sont sur la page FAQ (retour de Rémi) : ici, un renvoi."""
    if not c.get('faq'):
        return ''
    return (f'<section class="cr-faq cr-faq-renvoi" aria-label="Questions fréquentes"><h2>Questions fréquentes</h2>'
            f'<p>Le théâtre immersif, la participation, les horaires, l’accès : toutes les réponses.</p>'
            f'<a class="cr-bouton" href="{R}v8/faq/">Lire la FAQ</a></section>')


# V8.31 · page FAQ. Réponses reprises des FAQ d'Ariane (Close 2019, Norma 2023) pour le théâtre immersif,
# et des infos de Rémi pour La Veillée. Rien d'inventé : à relire par Ariane.
FAQ_IMMERSIF = [
    ("Qu’est-ce que le théâtre immersif ?",
     "Les spectateurs ne sont pas assis face à une scène : ils évoluent librement au sein des décors et parmi les personnages. Ils n’ont pas de place attitrée et font partie de l’histoire."),
    ("Suis-je obligé de participer ?",
     "Non. Les spectateurs sont intégrés à l’action, mais ils ne sont jamais obligés de faire quoi que ce soit. Ils peuvent interagir et vivre des moments privilégiés avec les personnages, ou rester en simple position d’observateur s’ils le souhaitent. Les interactions sont toujours proposées, jamais imposées."),
]


def page_faq(carte, version):
    R = '../../'
    v = next(c for c in CREATIONS if c['slug'] == 'la-veillee')
    bloc = lambda titre, qs: (f'<section class="cr-faq" aria-label="{E(titre)}"><h2>{E(titre)}</h2>'
                              + ''.join(f'<details><summary>{E(k)}</summary><p>{x}</p></details>' for k, x in qs) + '</section>')
    veillee = [(k, x.replace('href="../../billetterie/"', f'href="{R}v8/billetterie/"')) for k, x in v['faq'] if not k.startswith('Nous n')]
    corps = f'''{tete_simple("Questions fréquentes", "FAQ")}
{bloc("Le théâtre immersif", FAQ_IMMERSIF)}
{bloc("La Veillée", veillee)}
<section class="cr-faq cr-faq-renvoi"><h2>Nous n’avons pas répondu à votre question ?</h2><a class="cr-bouton" href="mailto:{CONTACT}">Écrivez-nous</a></section>
<nav class="cr-suite cr-suite--seule" aria-label="Retour aux créations"><a class="cr-retour" href="{R}v8/?direct#creations">Retour</a></nav>'''
    return page('FAQ · Big Drama', 'Questions fréquentes : le théâtre immersif, la participation des spectateurs, La Veillée (horaires, billets, accès).',
                R, corps, 'faq', version, slug='la-veillee')


def evenements(c):
    """Données structurées schema.org pour les moteurs de recherche (dates sans horaire tant qu'elles manquent)."""
    b = c.get('evenement')
    if not b:
        return ''
    h = lambda d, k: f"{d}T{b[k]}:00+01:00" if b.get(k) else d
    ev = [{"@context": "https://schema.org", "@type": "TheaterEvent", "name": c['titre'], "startDate": h(iso, 'debut'), "doorTime": h(iso, 'portes'),
           "eventStatus": "https://schema.org/EventScheduled", "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
           "location": {"@type": "Place", "name": "Paris 20e", "address": {"@type": "PostalAddress", "postalCode": "75020", "addressLocality": "Paris", "addressCountry": "FR"}},
           "organizer": {"@type": "Organization", "name": "Big Drama"},
           "endDate": h(iso, 'fin'), "image": ['https://johnmetronome.github.io/bigdrama-maquette/' + (c.get('og') or c['tete_video']['affiche'])] if c.get('tete_video') else [],
           "offers": [{"@type": "Offer", "price": x, "priceCurrency": "EUR", "url": b['lien']} for x in b['prix']],
           "description": re.sub(r'<[^>]+>', '', c['texte'][0])} for iso in b['dates']]
    return '<script type="application/ld+json">' + json.dumps(ev, ensure_ascii=False).replace('</', '<\\/') + '</script>'


def tete_video(c, carte, R):
    """Film en tête de page : muet, en boucle, sans commandes. Version 540p sur téléphone."""
    v = c.get('tete_video')
    if not v:
        return ''
    boucle = ' loop' if c.get('boucle', True) else ''
    portrait = f' data-affiche-portrait="{image(v["affiche_portrait"], carte, R)}"' if v.get('affiche_portrait') else ''
    return (f'<video class="cr-tete-film{" cr-film-portrait" if v.get("portrait") else ""}" autoplay muted{boucle} playsinline disablepictureinpicture preload="auto" poster="{image(v["affiche"], carte, R)}"{portrait} aria-hidden="true">'
            + (f'<source media="(max-width:700px) and (orientation:portrait)" src="{R}{v["portrait"]}" type="video/mp4">' if v.get('portrait') else '')
            + f'<source media="(max-width:900px)" src="{R}{v["mobile"]}" type="video/mp4"><source src="{R}{v["film"]}" type="video/mp4"></video>')


def dimensions(chemin):
    """Taille réelle d'une photo (pour ne jamais l'agrandir au-delà de sa définition)."""
    try:
        from PIL import Image as _Im
        with _Im.open(Path(__file__).resolve().parent.parent / chemin) as im:
            return im.size
    except Exception:
        return (1200, 800)


def bloc_titre(c, carte, R, plus=''):
    """V8.33 · titre et sous-titre sous l'image, jamais par-dessus (Ariane)."""
    logo = (f'<img class="cr-logo cr-logo-{c["slug"]}" src="{image(c["logo"], carte, R)}" alt="{E(c["titre"])}">' if c.get('logo')
            else E(c['titre']))
    return (f'<header class="cr-titre-bloc"><h1 class="{"cr-h1-logo" if c.get("logo") else "cr-h1-texte"}">{logo}</h1>'
            + (f'<p class="cr-sous">{E(c["sous_titre"])}</p>' if c.get("sous_titre") else '') + f'{plus}</header>')


def media_tete(c, carte, R):
    """Film de tête (muet) ou photo de tête, en pleine largeur, sans texte par-dessus."""
    if c.get('tete_video'):
        return f'<section class="cr-media cr-media--film" aria-hidden="true">{tete_video(c, carte, R)}</section>'
    p = c.get('tete_photo')
    if p:
        return f'<section class="cr-media cr-media--photo"><img src="{image(p, carte, R)}" alt="" fetchpriority="high" decoding="async"></section>'
    return ''


def citation_html(c):
    if not c.get('citation'):
        return ''
    return f'<figure class="cr-citation"><blockquote>« {E(c["citation"][0])} »</blockquote><figcaption><cite>{E(c["citation"][1])}</cite></figcaption></figure>'


def page_creation(c, i, carte, version):
    R = '../../../'
    photos = c['photos']
    texte = ''.join(f'<p>{t}</p>' for t in c['texte'])
    galerie = ''
    for k, p in enumerate(x for x in photos if x != c.get('tete_photo')):
        w, h = dimensions(p)
        galerie += (f'<li class="{"cr-portrait-photo" if h > w else "cr-paysage-photo"}" style="--max:{w}px">'
                    f'<button type="button" data-grand="{image(p, carte, R)}" aria-label="Agrandir la photo {k + 1}">'
                    f'<img src="{image(p, carte, R)}" alt="" loading="lazy" decoding="async" width="{w}" height="{h}"></button></li>')
    legende = c.get('legende', '')
    if c.get('alcool'):
        legende += (' ' if legende else '') + "L'abus d'alcool est dangereux pour la santé. À consommer avec modération."
    lignes_credits = [(k, v) for k, v in c.get('credits', [])
                      if k.strip().casefold() not in ('une création', 'pour', 'avec') and v.strip()]
    credits = ''.join(f'<div><dt>{E(k)}</dt><dd>{E(v)}</dd></div>' for k, v in lignes_credits)
    blocs = ''.join(f'<h3>{E(t)}</h3><dl class="cr-liste">' + ''.join(f'<div><dt>{E(a)}</dt><dd>{E(b)}</dd></div>' for a, b in lignes) + '</dl>'
                    for t, lignes in c.get('distribution', []))
    # V8.33 · tous les crédits dans un seul menu à dérouler (Ariane)
    section_credits = (f'<details class="cr-credits-tout"><summary>Crédits</summary>'
                       f'{f"<dl class=cr-liste>{credits}</dl>" if credits else ""}{blocs}</details>') if credits or blocs else ''
    presse = ''
    if c.get('presse'):
        presse = ('<section class="cr-presse" aria-label="La presse"><ul>'
                  + ''.join(f'<li><blockquote>« {E(q)} »</blockquote><cite>{E(src)}</cite></li>' for q, src in c['presse']) + '</ul></section>')
    partenaires = ''
    if c.get('partenaires'):
        partenaires = ('<section class="cr-partenaires" aria-label="Partenaires"><h2>Avec</h2><ul>'
                       + ''.join(f'<li><img class="cr-part-{Path(p).stem.lower()}" src="{R}{p}" alt="" loading="lazy"></li>' for p in c['partenaires']) + '</ul></section>')
    plus = ''
    if c.get('dates_courtes'):
        plus += f'<p class="cr-dates-ligne">{E(c["dates_courtes"])}</p>'
    if c.get('reserver'):
        plus += f'<a class="cr-bouton cr-reserver" href="{R}v8/billetterie/">Réserver</a>'
    corps = f'''
{media_tete(c, carte, R)}
{bloc_titre(c, carte, R, plus)}
<article class="cr-corps">
 {f'<p class="cr-accroche">{c["accroche"]}</p>' if c["accroche"] else ''}
 {('<p class="cr-devise">' + '<br>'.join(E(x) for x in c['devise']) + '</p>') if c.get('devise') else ''}
 {citation_html(c) if c.get('citation_avant') else ''}
 {f'<h2 class="cr-synopsis-titre">{E(c["synopsis_titre"])}</h2>' if c.get('synopsis_titre') else ''}
 {f'<div class="cr-texte">{texte}</div>' if texte else ''}
 {citation_html(c) if not c.get('citation_avant') else ''}
 {f'<p class="cr-contexte">{c["contexte"]}</p>' if c.get('contexte') else ''}
</article>
{infos_veillee() if c['slug'] == 'la-veillee' else ''}
{presse}
{f'<section class="cr-galerie" aria-label="Photos"><ul>{galerie}</ul>' + (f'<p class="cr-legende">{E(legende)}</p>' if legende else '') + '</section>' if galerie and not c.get('bandeau') else (f'<p class="cr-legende">{E(legende)}</p>' if legende else '')}
{section_credits}
{partenaires}
<nav class="cr-suite cr-suite--seule" aria-label="Retour aux créations"><a class="cr-retour" href="{R}v8/?direct#creations">Retour</a></nav>
<div class="cr-visionneuse" hidden><button type="button" class="cr-fermer" aria-label="Fermer">×</button><img alt=""></div>'''
    desc = c.get('description') or re.sub(r'<[^>]+>', '', c['accroche'] or f"{c['titre']}, une création Big Drama")[:150]
    og_img = c.get('og') or c.get('tete_photo') or (c['tete_video']['affiche'] if c.get('tete_video') else photos[0])
    og = f'<meta property="og:image" content="https://johnmetronome.github.io/bigdrama-maquette/{og_img}">'
    return page(f'{c["titre"]} · Big Drama', desc, R, corps, 'creations', version, og + evenements(c), slug=c['da'])


# V8.33 · À propos : le texte d'Ariane seul. Le paragraphe APROPOS_PLUS est prêt si Rémi le juge utile.
APROPOS_TEXTE = "Depuis 2017, nous écrivons et produisons nos propres spectacles de façon indépendante. Nous fabriquons des mondes de toutes pièces, dans des lieux qui n’étaient pas faits pour ça, pour y inviter le public et retrouver le plaisir de jouer ensemble."
APROPOS_PLUS = None   # ("À la croisée du collectif d’artistes et de la maison de production, Big Drama réinvente la façon de raconter les histoires.", "Nous avons créé Big Drama en 2017 pour inventer un modèle indépendant pour le spectacle vivant. Écriture, mise en scène, scénographie, musique : nous rassemblons tous les métiers nécessaires à la création d’un spectacle, puis nous le produisons et le diffusons nous-mêmes, dans des lieux éphémères et exceptionnels.")


def page_apropos(carte, version):
    R = '../../'
    plus = ''
    if APROPOS_PLUS:
        plus = f'<p class="cr-chapeau">{APROPOS_PLUS[0]}</p><div class="cr-texte"><p>{APROPOS_PLUS[1]}</p></div>'
    corps = f'''
<section class="cr-media cr-media--photo"><img src="{image("photos/close-teaser-07.jpg", carte, R)}" alt="" fetchpriority="high"></section>
<header class="cr-titre-bloc"><h1 class="cr-h1-nav">Big Drama</h1></header>
<article class="cr-corps cr-apropos-texte"><p class="cr-chapeau">{APROPOS_TEXTE}</p>{plus}</article>
<nav class="cr-suite cr-suite--seule" aria-label="Retour aux créations"><a class="cr-retour" href="{R}v8/?direct#creations">Retour</a></nav>'''
    return page('À propos · Big Drama', APROPOS_TEXTE, R, corps, 'apropos', version, slug='apropos')


def tete_simple(cadre, titre):
    return (f'<section class="cr-tete cr-tete-simple"><div class="cr-tete-contenu"><p class="cr-cadre">{E(cadre)}</p>'
            f'<h1 class="cr-titre-texte">{E(titre)}</h1></div></section>')


LEGAL = [('mentions-legales', 'Mentions légales'), ('cgv', 'Conditions générales de vente'), ('confidentialite', 'Politique de confidentialité')]


def page_legale(slug, titre, version):
    R = '../../'
    texte = (ICI / '_legal' / f'{slug}.html').read_text(encoding='utf-8')
    corps = f'''{tete_simple("Informations", titre)}
<article class="cr-corps cr-legal-texte">{texte}</article>'''
    return page(f'{titre} · Big Drama', f'{titre} du site Big Drama.', R, corps, '', version, slug='simple')


# V8.28 · page Billetterie dans l'univers de La Veillée.
# V8.30 · module de vente Billetweb intégré dans la page (cadre, comme le code d'intégration de Rémi) mais sans leur
# script export.js : aucun script tiers ne s'exécute sur big-drama.fr. Le redimensionnement du cadre est fait par creations.js.
SEANCES = [("Jeudi", "26 novembre 2026"), ("Vendredi", "27 novembre 2026")]
HORAIRES = "Portes 19 h 30 · Spectacle 20 h"   # proposition de Rémi, 02.11.2026
TARIFS = [("Sans consommation", "20 €"), ("Avec consommation", "25 €")]   # Rémi, 02.11.2026
BILLETWEB_ID = 'la-veillee-bigdrama'
CSP_BILLETTERIE = CSP.replace("object-src 'none'", "frame-src https://www.billetweb.fr; object-src 'none'")
INFOS_VEILLEE = [("Lieu", "Paris 20e"),
                 ("Durée", "1 h 30"),
                 ("Public", "À partir de 12 ans"),
                 ("Accessibilité", "Le lieu est accessible aux personnes à mobilité réduite, à l’exception de deux marches à l’entrée. Écrivez-nous avant votre venue, nous organiserons votre accueil.")]


def infos_veillee():
    """V8.36 · infos pratiques fermées par défaut, un bouton les ouvre (Alex). Billetterie et page La Veillée."""
    infos = ''.join(f'<div><dt>{E(k)}</dt><dd>{val}</dd></div>' for k, val in [("Horaires", "Ouverture des portes à 19 h 30<br>Début du spectacle à 20 h")] + INFOS_VEILLEE)
    infos += f'<div><dt>Contact</dt><dd><a href="mailto:{CONTACT}">{CONTACT}</a></dd></div>'
    return f'<details class="cr-credits-tout cr-infos-tout"><summary>Infos pratiques</summary><dl class="cr-liste">{infos}</dl></details>'


def page_billetterie(carte, version):
    """V8.33 · film, titre dessous, module Billetweb, infos pratiques. Plus de cartes de séances (redondantes avec le module)."""
    R = '../../'
    v = next(c for c in CREATIONS if c['slug'] == 'la-veillee')
    tarifs = ''.join(f'<li><span>{E(k)}</span><strong>{E(p)}</strong></li>' for k, p in TARIFS)
    corps = f'''
{media_tete(v, carte, R)}
{bloc_titre(v, carte, R, f'<p class="cr-dates-ligne">{E(v["dates_courtes"])}</p>')}
<article class="cr-corps cr-billet-synopsis">
 {citation_html(v)}
 <div class="cr-texte">{"".join(f"<p>{x}</p>" for x in v["texte"])}</div>
</article>
<section class="cr-module" id="reserver" aria-label="Réserver ses places">
 <div class="cr-module-cadre"><iframe id="event{BILLETWEB_ID}" class="cr-bw" title="Billetterie Billetweb, La Veillée" src="{BILLETTERIE}&amp;ref={BILLETWEB_ID}" height="600" loading="lazy" allow="payment" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
 <p class="cr-billet-note">Paiement sécurisé par Billetweb. Le module ne s’affiche pas ? <a href="{BILLETTERIE}" target="_blank" rel="noopener">Ouvrir la billetterie dans un nouvel onglet</a>.</p>
</section>
{infos_veillee()}
<nav class="cr-suite cr-suite--seule" aria-label="Retour aux créations"><a class="cr-retour" href="{R}v8/?direct#creations">Retour</a></nav>'''
    return page('Billetterie · La Veillée · Big Drama', 'Réserver La Veillée, nouvelle création de Big Drama : 26 et 27 novembre 2026, Paris 20e.',
                R, corps, 'billetterie', version, f'<meta property="og:image" content="https://johnmetronome.github.io/bigdrama-maquette/{v.get("og") or v["tete_video"]["affiche"]}">' + evenements(v), slug='la-veillee', csp=CSP_BILLETTERIE)


def generer(carte, version):
    (OUT / 'creations').mkdir(parents=True, exist_ok=True)
    for i, c in enumerate(CREATIONS):
        d = OUT / 'creations' / c['slug']; d.mkdir(parents=True, exist_ok=True)
        (d / 'index.html').write_text(page_creation(c, i, carte, version), encoding='utf-8')
    (OUT / 'a-propos').mkdir(exist_ok=True)
    (OUT / 'a-propos' / 'index.html').write_text(page_apropos(carte, version), encoding='utf-8')
    (OUT / 'billetterie').mkdir(exist_ok=True)
    (OUT / 'billetterie' / 'index.html').write_text(page_billetterie(carte, version), encoding='utf-8')
    for slug, titre in LEGAL:
        (OUT / slug).mkdir(exist_ok=True)
        (OUT / slug / 'index.html').write_text(page_legale(slug, titre, version), encoding='utf-8')
    shutil.copy2(ICI / '_creations.css', OUT / 'creations' / 'creations.css')
    shutil.copy2(ICI / '_creations.js', OUT / 'creations' / 'creations.js')
    return {c['id']: c['slug'] for c in CREATIONS}


if __name__ == '__main__':
    f = OUT / 'assets' / 'opt' / 'carte.json'
    print(generer(json.loads(f.read_text()) if f.exists() else {}, 'dev'))
