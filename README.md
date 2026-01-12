# AI Reference Hub

Reference exhaustive des LLMs et outils IA pour workflows n8n - MR Tech Lab

## Apercu

AI Reference Hub est une application web moderne permettant de consulter, comparer et choisir les meilleurs LLMs et outils IA pour vos projets. L'interface est organisee par categories avec des fiches detaillees et des exemples concrets d'utilisation.

## Fonctionnalites

- **Navigation par categories** : 8 categories principales (Raisonnement, Polyvalence, Economique, Creation, Code, Recherche, Conversation, Open Source)
- **Recherche avancee** : Recherche en temps reel par nom, provider, description, forces, cas d'usage
- **Filtres multiples** : Par categorie, tier (Premium/Standard/Budget), niveau de difficulte
- **Fiches detaillees** : Points forts, limites, cas d'usage, specifications techniques, comparaisons
- **Comparateur** : Comparez jusqu'a 3 LLMs/outils cote a cote
- **Favoris** : Sauvegardez vos outils preferes (stockage local)
- **Exemples concrets** : Cas d'usage reels avec situation/solution/resultat
- **Guide de decision rapide** : Recommandations par usage et stack n8n

## Structure du Projet

```
Synthese_AI/
├── index.html          # Page principale
├── css/
│   └── styles.css      # Styles CSS modernes
├── js/
│   └── app.js          # Logique JavaScript
├── data/
│   └── ai-data.json    # Donnees structurees
└── README.md           # Documentation
```

## Installation

### Option 1 : Utilisation Locale

1. Clonez ou telechargez le projet
2. Ouvrez `index.html` dans un navigateur moderne

**Note** : Pour que le chargement des donnees fonctionne, vous devez servir les fichiers via un serveur HTTP local :

```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js (npx)
npx serve

# Avec PHP
php -S localhost:8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

### Option 2 : GitHub Pages

1. Creez un repository GitHub
2. Uploadez tous les fichiers
3. Activez GitHub Pages dans Settings > Pages
4. Selectionnez la branche `main` et le dossier `/(root)`
5. Votre site sera disponible a `https://votre-username.github.io/nom-repo/`

## Personnalisation

### Modifier les Donnees

Editez le fichier `data/ai-data.json` :

#### Ajouter un LLM

```json
{
  "id": "mon-llm",
  "name": "Mon LLM",
  "provider": "Provider",
  "categories": ["polyvalent", "code"],
  "tier": "standard",
  "description": "Description du LLM...",
  "strengths": ["Point fort 1", "Point fort 2"],
  "weaknesses": ["Limite 1"],
  "useCases": ["Cas d'usage 1"],
  "comparison": "vs Concurrent: ...",
  "specs": {
    "contextWindow": "128K",
    "speed": "Rapide",
    "inputPrice": "$1/M",
    "outputPrice": "$3/M"
  },
  "apiAvailable": true,
  "docUrl": "https://docs.example.com",
  "tags": ["tag1", "tag2"],
  "difficulty": "intermediaire",
  "isNew": true
}
```

#### Ajouter un Outil

```json
{
  "id": "mon-outil",
  "name": "Mon Outil",
  "provider": "Provider",
  "categories": ["creation"],
  "type": "image",
  "description": "Description...",
  "strengths": ["Point fort 1"],
  "weaknesses": ["Limite 1"],
  "useCases": ["Cas d'usage 1"],
  "integrations": ["n8n", "API"],
  "pricing": "A partir de $10/mois",
  "difficulty": "debutant",
  "docUrl": "https://docs.example.com",
  "tags": ["tag1"],
  "isNew": false
}
```

#### Ajouter une Categorie

```json
{
  "id": "ma-categorie",
  "name": "Ma Categorie",
  "icon": "star",
  "emoji": "⭐",
  "color": "#fbbf24",
  "description": "Description de la categorie..."
}
```

#### Ajouter un Exemple

```json
{
  "categoryId": "code",
  "title": "Titre de l'exemple",
  "situation": "Description du besoin...",
  "solution": "Comment resoudre...",
  "result": "Benefice obtenu...",
  "tools": ["claude-sonnet-4", "cursor"]
}
```

### Modifier les Styles

Les variables CSS sont definies dans `css/styles.css` :

```css
:root {
  /* Couleurs principales */
  --accent-purple: #a855f7;
  --accent-blue: #3b82f6;
  --accent-green: #22c55e;

  /* Fond */
  --bg-primary: #08080c;
  --bg-card: #14141c;

  /* Texte */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
}
```

## Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `/` | Focus sur la recherche |
| `Esc` | Fermer modal / Retour aux categories |

## Technologies Utilisees

- **HTML5** semantique avec accessibilite ARIA
- **CSS3** moderne (Flexbox, Grid, Variables CSS, Animations)
- **JavaScript** vanilla ES6+ (pas de framework)
- **JSON** pour le stockage des donnees

## Compatibilite Navigateurs

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mise a Jour des Donnees

1. Editez `data/ai-data.json`
2. Mettez a jour la date dans `metadata.lastUpdate`
3. Rafraichissez la page

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Creez une branche (`git checkout -b feature/amelioration`)
3. Committez vos changements (`git commit -am 'Ajout de fonctionnalite'`)
4. Push sur la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

## Licence

MIT License - Libre d'utilisation et de modification.

---

Cree avec ❤️ par MR Tech Lab
