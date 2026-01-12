/**
 * AI Reference Hub - Main Application
 * Version: 3.2.0 - Phase 3: Use Cases, News, Themes & User Preferences
 * Author: MR Tech Lab
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
  data: null,
  currentTab: 'llms',
  currentCategory: null,
  searchQuery: '',
  filters: {
    category: '',
    tier: '',
    difficulty: '',
    useCase: '', // Phase 3: Use case filter
    // Phase 1: Enhanced filters
    competencies: [],
    minScore: 0,
    accessType: [],
    contextSize: ''
  },
  comparison: [],
  maxComparison: 4,
  favorites: JSON.parse(localStorage.getItem('ai-hub-favorites') || '[]'),
  badgesCache: {},
  // Phase 3: User preferences
  preferences: JSON.parse(localStorage.getItem('ai-hub-preferences') || '{}'),
  theme: localStorage.getItem('ai-hub-theme') || 'dark',
  examplesFilter: ''
};

// ============================================
// NEWS DATA (Updated regularly)
// ============================================

const NEWS_DATA = [
  {
    id: 'news-1',
    date: '2025-01-10',
    title: 'Claude Opus 4.5 bat tous les records',
    summary: 'Anthropic lance Claude Opus 4.5 avec un score SWE-bench de 80.9%, nouveau record mondial pour la génération de code.',
    category: 'release',
    icon: '🏆',
    link: '#claude-opus-4-5'
  },
  {
    id: 'news-2',
    date: '2025-01-08',
    title: 'GPT-5.2 : 400K tokens de contexte',
    summary: 'OpenAI dévoile GPT-5.2 avec une fenêtre de contexte de 400K tokens et un score parfait sur AIME 2025.',
    category: 'release',
    icon: '🚀',
    link: '#gpt-5-2'
  },
  {
    id: 'news-3',
    date: '2025-01-05',
    title: 'DeepSeek V3.2 : médaille d\'or IMO',
    summary: 'DeepSeek décroche la médaille d\'or aux Olympiades Internationales de Mathématiques avec son modèle V3.2.',
    category: 'achievement',
    icon: '🥇',
    link: '#deepseek-v3-2'
  },
  {
    id: 'news-4',
    date: '2025-01-03',
    title: 'Llama 4 Scout : 10M tokens !',
    summary: 'Meta lance Llama 4 Scout avec une fenêtre de contexte record de 10 millions de tokens.',
    category: 'release',
    icon: '📚',
    link: '#llama-4-scout'
  },
  {
    id: 'news-5',
    date: '2025-01-02',
    title: 'Sora disponible en API',
    summary: 'OpenAI ouvre enfin l\'accès API à Sora pour la génération vidéo professionnelle.',
    category: 'api',
    icon: '🎬',
    link: '#sora'
  },
  {
    id: 'news-6',
    date: '2024-12-28',
    title: 'Gemini 3 Deep Think rival o3',
    summary: 'Google lance Gemini 3 Deep Think, un modèle de raisonnement concurrent direct d\'o3.',
    category: 'release',
    icon: '🧠',
    link: '#gemini-3-deep-think'
  }
];

// ============================================
// BADGE DEFINITIONS
// ============================================

const BADGE_DEFINITIONS = {
  top3: { emoji: '🏆', label: 'Top 3', color: '#ffd700', description: 'Dans le top 3 d\'une compétence' },
  free: { emoji: '🆓', label: 'Gratuit', color: '#22c55e', description: 'Utilisation gratuite' },
  opensource: { emoji: '🔓', label: 'Open Source', color: '#64748b', description: 'Code source ouvert' },
  fast: { emoji: '⚡', label: 'Rapide', color: '#3b82f6', description: 'Temps de réponse ultra-rapide' },
  bestValue: { emoji: '💰', label: 'Meilleur QP', color: '#f97316', description: 'Meilleur rapport qualité/prix' },
  new: { emoji: '🆕', label: 'Nouveau', color: '#a855f7', description: 'Modèle récent' },
  trending: { emoji: '🔥', label: 'Tendance', color: '#ef4444', description: 'Très populaire' },
  recommended: { emoji: '⭐', label: 'Recommandé', color: '#eab308', description: 'Recommandé pour certains cas' },
  longContext: { emoji: '📚', label: 'Long Contexte', color: '#06b6d4', description: 'Grande fenêtre de contexte' },
  multimodal: { emoji: '🎨', label: 'Multimodal', color: '#ec4899', description: 'Images, audio, vidéo' }
};

// Competency labels for filters
const COMPETENCY_LABELS = {
  reasoning: { name: 'Raisonnement', emoji: '🧠' },
  coding: { name: 'Code', emoji: '💻' },
  math: { name: 'Maths', emoji: '🔢' },
  writing: { name: 'Rédaction', emoji: '✍️' },
  multilingual: { name: 'Multilingue', emoji: '🌍' },
  speed: { name: 'Vitesse', emoji: '⚡' },
  context: { name: 'Contexte', emoji: '📚' },
  cost: { name: 'Coût', emoji: '💰' },
  multimodal: { name: 'Multimodal', emoji: '🎨' },
  instruction: { name: 'Instructions', emoji: '📝' }
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
  llmCount: document.getElementById('llm-count'),
  toolsCount: document.getElementById('tools-count'),
  llmTotal: document.getElementById('llm-total'),
  toolsTotal: document.getElementById('tools-total'),
  resultsCount: document.getElementById('results-count'),
  searchInput: document.getElementById('search'),
  categoryFilter: document.getElementById('category-filter'),
  tierFilter: document.getElementById('tier-filter'),
  difficultyFilter: document.getElementById('difficulty-filter'),
  usecaseFilter: document.getElementById('usecase-filter'), // Phase 3
  categoriesGrid: document.getElementById('categories-grid'),
  itemsSection: document.getElementById('items-section'),
  itemsGrid: document.getElementById('items-grid'),
  itemsSectionTitle: document.getElementById('items-section-title'),
  examplesGrid: document.getElementById('examples-grid'),
  examplesCategoryFilter: document.getElementById('examples-category-filter'), // Phase 3
  quickGuideList: document.getElementById('quick-guide-list'),
  quickGuideStack: document.getElementById('quick-guide-stack'),
  comparatorBtn: document.getElementById('comparator-btn'),
  comparatorCount: document.getElementById('comparator-count'),
  modalOverlay: document.getElementById('modal-overlay'),
  modalContent: document.getElementById('modal-content'),
  // Benchmark elements
  benchmarkSection: document.getElementById('benchmark-section'),
  benchmarkCategory: document.getElementById('benchmark-category'),
  benchmarkSort: document.getElementById('benchmark-sort'),
  benchmarkChart: document.getElementById('benchmark-chart'),
  usecaseRankingsGrid: document.getElementById('usecase-rankings-grid'),
  pricePerformanceList: document.getElementById('price-performance-list'),
  // Phase 3 elements
  themeToggle: document.getElementById('theme-toggle'),
  settingsBtn: document.getElementById('settings-btn'),
  newsTicker: document.getElementById('news-ticker'),
  newsGrid: document.getElementById('news-grid')
};

// ============================================
// DATA LOADING
// ============================================

async function loadData() {
  try {
    const response = await fetch('data/ai-data.json');
    if (!response.ok) throw new Error('Failed to load data');
    state.data = await response.json();
    initializeApp();
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Erreur lors du chargement des donnees. Veuillez rafraichir la page.');
  }
}

function showError(message) {
  const main = document.querySelector('.main-content');
  main.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">⚠️</div>
      <h2 class="empty-state__title">Erreur</h2>
      <p class="empty-state__text">${message}</p>
    </div>
  `;
}

// ============================================
// INITIALIZATION
// ============================================

function initializeApp() {
  // Apply saved theme first
  applyTheme(state.theme);

  updateCounts();
  populateFilters();
  renderCategories();
  renderNews(); // Phase 3
  renderExamples();
  renderQuickGuide();
  setupEventListeners();
  updateComparatorUI();
}

function updateCounts() {
  const llmCount = state.data.llms.length;
  const toolsCount = state.data.tools.length;

  if (elements.llmCount) elements.llmCount.textContent = llmCount;
  if (elements.toolsCount) elements.toolsCount.textContent = toolsCount;
  if (elements.llmTotal) elements.llmTotal.textContent = llmCount;
  if (elements.toolsTotal) elements.toolsTotal.textContent = toolsCount;
}

function populateFilters() {
  // Category filter
  if (elements.categoryFilter) {
    const options = state.data.categories.map(cat =>
      `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`
    ).join('');
    elements.categoryFilter.innerHTML = `<option value="">Toutes les categories</option>${options}`;
  }

  // Phase 3: Use case filter
  if (elements.usecaseFilter && state.data.benchmarks?.useCaseRankings) {
    const useCases = state.data.benchmarks.useCaseRankings.map(uc =>
      `<option value="${uc.useCase}">${uc.useCase}</option>`
    ).join('');
    elements.usecaseFilter.innerHTML = `<option value="">Tous les cas d'usage</option>${useCases}`;
  }

  // Phase 3: Examples category filter
  if (elements.examplesCategoryFilter) {
    const options = state.data.categories.map(cat =>
      `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`
    ).join('');
    elements.examplesCategoryFilter.innerHTML = `<option value="">Toutes categories</option>${options}`;
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Tab navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => handleTabChange(tab.dataset.tab));
  });

  // Search
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
  }

  // Filters
  if (elements.categoryFilter) {
    elements.categoryFilter.addEventListener('change', handleFilterChange);
  }
  if (elements.tierFilter) {
    elements.tierFilter.addEventListener('change', handleFilterChange);
  }
  if (elements.difficultyFilter) {
    elements.difficultyFilter.addEventListener('change', handleFilterChange);
  }

  // Phase 3: Use case filter
  if (elements.usecaseFilter) {
    elements.usecaseFilter.addEventListener('change', handleUseCaseFilterChange);
  }

  // Phase 3: Examples category filter
  if (elements.examplesCategoryFilter) {
    elements.examplesCategoryFilter.addEventListener('change', handleExamplesFilterChange);
  }

  // Phase 3: Theme toggle
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', toggleTheme);
  }

  // Phase 3: Settings button
  if (elements.settingsBtn) {
    elements.settingsBtn.addEventListener('click', openSettings);
  }

  // Comparator
  if (elements.comparatorBtn) {
    elements.comparatorBtn.addEventListener('click', openComparator);
  }

  // Modal close
  if (elements.modalOverlay) {
    elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === elements.modalOverlay) closeModal();
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

function handleKeyboard(e) {
  if (e.key === 'Escape') {
    closeModal();
    state.currentCategory = null;
    renderCategories();
  }
  if (e.key === '/' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    elements.searchInput?.focus();
  }
  // Phase 3: Theme toggle shortcut
  if ((e.key === 't' || e.key === 'T') && e.target.tagName !== 'INPUT' && !e.ctrlKey && !e.metaKey) {
    toggleTheme();
  }
}

// ============================================
// TAB NAVIGATION
// ============================================

function handleTabChange(tab) {
  state.currentTab = tab;
  state.currentCategory = null;
  state.searchQuery = '';
  state.filters = { category: '', tier: '', difficulty: '' };

  // Update active tab
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  // Reset filters
  if (elements.searchInput) elements.searchInput.value = '';
  if (elements.categoryFilter) elements.categoryFilter.value = '';
  if (elements.tierFilter) elements.tierFilter.value = '';
  if (elements.difficultyFilter) elements.difficultyFilter.value = '';

  // Handle benchmark tab
  if (tab === 'benchmark') {
    showBenchmarkSection();
  } else {
    hideBenchmarkSection();
    renderCategories();
  }
}

function showBenchmarkSection() {
  // Hide other sections
  if (elements.categoriesGrid) elements.categoriesGrid.classList.add('hidden');
  if (elements.itemsSection) elements.itemsSection.classList.add('hidden');
  document.querySelector('.controls')?.classList.add('hidden');

  // Show benchmark section
  if (elements.benchmarkSection) {
    elements.benchmarkSection.classList.remove('hidden');
    renderBenchmark();
  }
}

function hideBenchmarkSection() {
  if (elements.benchmarkSection) elements.benchmarkSection.classList.add('hidden');
  document.querySelector('.controls')?.classList.remove('hidden');
}

// ============================================
// SEARCH & FILTERS
// ============================================

function handleSearch(e) {
  state.searchQuery = e.target.value.toLowerCase();
  if (state.currentCategory) {
    renderItems();
  } else if (state.searchQuery.length >= 2) {
    // Global search - show all matching items
    state.currentCategory = 'search';
    renderItems();
  } else {
    state.currentCategory = null;
    renderCategories();
  }
}

function handleFilterChange() {
  state.filters.category = elements.categoryFilter?.value || '';
  state.filters.tier = elements.tierFilter?.value || '';
  state.filters.difficulty = elements.difficultyFilter?.value || '';

  // Si un filtre est actif, afficher les items filtrés même sans catégorie sélectionnée
  if (state.filters.tier || state.filters.difficulty || state.filters.category) {
    state.currentCategory = state.currentCategory || 'filter';
    renderItems();
  } else if (state.currentCategory && state.currentCategory !== 'filter') {
    // Si une catégorie est sélectionnée (pas via filtre), rafraîchir
    renderItems();
  } else {
    // Aucun filtre et aucune catégorie - retour aux catégories
    state.currentCategory = null;
    renderCategories();
  }
}

function filterItems(items) {
  return items.filter(item => {
    // Search query
    if (state.searchQuery) {
      const searchFields = [
        item.name,
        item.provider,
        item.description,
        ...(item.strengths || []),
        ...(item.useCases || []),
        ...(item.tags || [])
      ].join(' ').toLowerCase();

      if (!searchFields.includes(state.searchQuery)) return false;
    }

    // Category filter
    if (state.filters.category && !item.categories.includes(state.filters.category)) {
      return false;
    }

    // Tier filter (LLMs only)
    if (state.filters.tier && item.tier !== state.filters.tier) {
      return false;
    }

    // Difficulty filter
    if (state.filters.difficulty && item.difficulty !== state.filters.difficulty) {
      return false;
    }

    return true;
  });
}

// ============================================
// RENDERING - CATEGORIES
// ============================================

function renderCategories() {
  if (!elements.categoriesGrid) return;

  const items = state.currentTab === 'llms' ? state.data.llms : state.data.tools;

  // Count items per category
  const categoryCounts = {};
  state.data.categories.forEach(cat => {
    categoryCounts[cat.id] = items.filter(item =>
      item.categories.includes(cat.id)
    ).length;
  });

  // Filter categories that have items for current tab
  const relevantCategories = state.data.categories.filter(cat =>
    categoryCounts[cat.id] > 0
  );

  elements.categoriesGrid.innerHTML = relevantCategories.map(cat => `
    <div class="category-card" data-category="${cat.id}" style="--category-color: ${cat.color}">
      <div class="category-card__header">
        <div class="category-card__icon">${cat.emoji}</div>
        <h3 class="category-card__title">${cat.name}</h3>
      </div>
      <p class="category-card__description">${cat.description}</p>
      <div class="category-card__count">
        <span class="category-card__count-value">${categoryCounts[cat.id]}</span>
        ${state.currentTab === 'llms' ? 'LLMs' : 'outils'}
      </div>
    </div>
  `).join('');

  // Add click listeners
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      state.currentCategory = card.dataset.category;
      renderItems();
    });
  });

  // Show categories, hide items
  elements.categoriesGrid.classList.remove('hidden');
  if (elements.itemsSection) elements.itemsSection.classList.add('hidden');

  updateResultsCount(items.length);
}

// ============================================
// RENDERING - ITEMS
// ============================================

function renderItems() {
  if (!elements.itemsGrid || !elements.itemsSection) return;

  const allItems = state.currentTab === 'llms' ? state.data.llms : state.data.tools;

  let items;
  let categoryName;

  if (state.currentCategory === 'search') {
    items = filterItems(allItems);
    categoryName = `Resultats de recherche`;
  } else if (state.currentCategory === 'filter') {
    items = filterItems(allItems);
    const filterLabels = [];
    if (state.filters.tier) filterLabels.push(state.filters.tier.charAt(0).toUpperCase() + state.filters.tier.slice(1));
    if (state.filters.difficulty) filterLabels.push(state.filters.difficulty.charAt(0).toUpperCase() + state.filters.difficulty.slice(1));
    if (state.filters.category) {
      const cat = state.data.categories.find(c => c.id === state.filters.category);
      if (cat) filterLabels.push(cat.name);
    }
    categoryName = `🔎 Filtres: ${filterLabels.join(', ') || 'Tous'}`;
  } else {
    items = allItems.filter(item => item.categories.includes(state.currentCategory));
    items = filterItems(items);
    const category = state.data.categories.find(c => c.id === state.currentCategory);
    categoryName = category ? `${category.emoji} ${category.name}` : '';
  }

  // Update title
  if (elements.itemsSectionTitle) {
    elements.itemsSectionTitle.innerHTML = categoryName;
  }

  // Render items
  elements.itemsGrid.innerHTML = items.length > 0
    ? items.map(item => renderItemCard(item)).join('')
    : `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title">Aucun resultat</h3>
        <p class="empty-state__text">Essayez de modifier vos filtres ou votre recherche.</p>
      </div>
    `;

  // Add event listeners
  setupItemCardListeners();

  // Show items, hide categories
  elements.categoriesGrid.classList.add('hidden');
  elements.itemsSection.classList.remove('hidden');

  updateResultsCount(items.length);
}

function renderItemCard(item) {
  const isLLM = state.currentTab === 'llms';
  const isInComparison = state.comparison.includes(item.id);
  const isFavorite = state.favorites.includes(item.id);

  // Calculate dynamic badges for LLMs
  const dynamicBadges = isLLM ? calculateBadges(item.id) : [];

  return `
    <div class="item-card ${isInComparison ? 'item-card--in-comparison' : ''} ${isFavorite ? 'item-card--favorite' : ''}" data-id="${item.id}">
      <div class="item-card__header">
        <div class="item-card__info">
          <h3 class="item-card__name">
            ${item.name}
          </h3>
          <p class="item-card__provider">${item.provider}</p>
        </div>
        ${isLLM ? `
          <div class="item-card__pricing">
            <div class="item-card__price">${item.specs?.inputPrice || 'N/A'}</div>
            <div class="item-card__api-price">input/1M tokens</div>
          </div>
        ` : `
          <div class="item-card__pricing">
            <div class="item-card__price">${item.pricing || 'N/A'}</div>
          </div>
        `}
      </div>

      <!-- Dynamic Badges Section -->
      ${dynamicBadges.length > 0 ? `
        <div class="item-card__dynamic-badges">
          ${renderBadges(dynamicBadges, 4)}
        </div>
      ` : ''}

      <div class="item-card__badges">
        ${item.tier ? `<span class="badge badge--${item.tier}">${getTierLabel(item.tier)}</span>` : ''}
        ${item.apiAvailable !== undefined ?
          `<span class="badge badge--${item.apiAvailable ? 'api' : 'no-api'}">${item.apiAvailable ? 'API' : 'No API'}</span>`
          : ''}
        ${item.difficulty ? `<span class="badge badge--difficulty-${item.difficulty}">${getDifficultyLabel(item.difficulty)}</span>` : ''}
      </div>

      <p class="item-card__description">${item.description}</p>

      <!-- Mini Scores for LLMs -->
      ${isLLM ? renderMiniScores(item.id) : ''}

      <div class="item-card__tags">
        ${item.tags.slice(0, 5).map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>

      <!-- Quick action to open detailed modal -->
      <button class="item-card__details-btn" data-action="details" data-id="${item.id}" onclick="event.stopPropagation(); openItemModal('${item.id}')">
        📊 Voir détails
      </button>

      <!-- Expanded Content -->
      <div class="item-card__expanded">
        ${item.strengths ? `
          <div class="expand-section">
            <h4 class="expand-section__title">Points Forts</h4>
            <ul class="expand-section__list">
              ${item.strengths.map(s => `<li class="expand-section__item">${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${item.weaknesses ? `
          <div class="expand-section">
            <h4 class="expand-section__title">Limites</h4>
            <ul class="expand-section__list">
              ${item.weaknesses.map(w => `<li class="expand-section__item weakness">${w}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${item.useCases ? `
          <div class="expand-section">
            <h4 class="expand-section__title">Cas d'Usage</h4>
            <ul class="expand-section__list">
              ${item.useCases.map(u => `<li class="expand-section__item">${u}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${item.comparison ? `
          <div class="expand-section">
            <h4 class="expand-section__title">Comparaison</h4>
            <div class="comparison-box">${item.comparison}</div>
          </div>
        ` : ''}

        ${isLLM && item.specs ? `
          <div class="expand-section">
            <h4 class="expand-section__title">Specifications</h4>
            <div class="specs-grid">
              <div class="spec-item">
                <span class="spec-item__label">Contexte</span>
                <span class="spec-item__value">${item.specs.contextWindow}</span>
              </div>
              <div class="spec-item">
                <span class="spec-item__label">Vitesse</span>
                <span class="spec-item__value">${item.specs.speed}</span>
              </div>
              <div class="spec-item">
                <span class="spec-item__label">Input</span>
                <span class="spec-item__value">${item.specs.inputPrice}</span>
              </div>
              <div class="spec-item">
                <span class="spec-item__label">Output</span>
                <span class="spec-item__value">${item.specs.outputPrice}</span>
              </div>
            </div>
          </div>
        ` : ''}

        ${item.integrations ? `
          <div class="expand-section">
            <h4 class="expand-section__title">Integrations</h4>
            <div class="item-card__tags">
              ${item.integrations.map(i => `<span class="tag">${i}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div class="item-card__actions">
          ${item.docUrl ? `
            <a href="${item.docUrl}" target="_blank" rel="noopener" class="item-card__action item-card__action--primary">
              📚 Documentation
            </a>
          ` : ''}
          <button class="item-card__action item-card__action--secondary" data-action="compare" data-id="${item.id}">
            ${isInComparison ? '✓ Dans comparateur' : '⚖️ Comparer'}
          </button>
          <button class="item-card__action item-card__action--secondary" data-action="favorite" data-id="${item.id}">
            ${isFavorite ? '★ Favori' : '☆ Favori'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function setupItemCardListeners() {
  // Card expand/collapse
  document.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't toggle if clicking on action buttons or links
      if (e.target.closest('.item-card__action') || e.target.closest('a')) return;
      card.classList.toggle('expanded');
    });
  });

  // Compare buttons
  document.querySelectorAll('[data-action="compare"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleComparison(btn.dataset.id);
    });
  });

  // Favorite buttons
  document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.id);
    });
  });
}

// ============================================
// RENDERING - EXAMPLES
// ============================================

function renderExamples() {
  if (!elements.examplesGrid) return;

  // Phase 3: Support examples filter
  let examples = state.data.examples;

  // Filter by selected category (from examples filter dropdown)
  if (state.examplesFilter) {
    examples = examples.filter(ex => ex.categoryId === state.examplesFilter);
  } else if (state.currentCategory) {
    examples = examples.filter(ex => ex.categoryId === state.currentCategory);
  } else {
    examples = examples.slice(0, 8); // Show more by default
  }

  // Get category info for styling
  const getCategoryColor = (catId) => {
    const cat = state.data.categories.find(c => c.id === catId);
    return cat?.color || '#a855f7';
  };

  const getCategoryEmoji = (catId) => {
    const cat = state.data.categories.find(c => c.id === catId);
    return cat?.emoji || '💡';
  };

  elements.examplesGrid.innerHTML = examples.map(example => `
    <div class="example-card" style="--example-color: ${getCategoryColor(example.categoryId)}">
      <div class="example-card__header">
        <div class="example-card__icon">${getCategoryEmoji(example.categoryId)}</div>
        <h4 class="example-card__title">${example.title}</h4>
      </div>
      <div class="example-card__content">
        <div class="example-card__step">
          <div class="example-card__step-label example-card__step-label--situation">📋 Situation</div>
          <p class="example-card__step-text">${example.situation}</p>
        </div>
        <div class="example-card__step">
          <div class="example-card__step-label example-card__step-label--solution">💡 Solution</div>
          <p class="example-card__step-text">${example.solution}</p>
        </div>
        <div class="example-card__step">
          <div class="example-card__step-label example-card__step-label--result">✅ Résultat</div>
          <p class="example-card__step-text">${example.result}</p>
        </div>
        <div class="example-card__tools">
          ${example.tools.map(toolId => {
            const tool = [...state.data.llms, ...state.data.tools].find(t => t.id === toolId);
            return tool ? `<span class="example-card__tool" onclick="openItemModal('${toolId}')">${tool.name}</span>` : '';
          }).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================
// RENDERING - QUICK GUIDE
// ============================================

function renderQuickGuide() {
  if (!elements.quickGuideList || !elements.quickGuideStack) return;

  const guide = state.data.quickGuide;

  elements.quickGuideList.innerHTML = guide.byUseCase.map(item => `
    <li class="quick-guide__item">
      <span class="quick-guide__label">${item.useCase}</span>
      <span class="quick-guide__value">${item.recommendation}</span>
    </li>
  `).join('');

  elements.quickGuideStack.innerHTML = guide.n8nStack.map(item => `
    <li class="quick-guide__item">
      <span class="quick-guide__label">${item.component}</span>
      <span class="quick-guide__value">${item.recommendation}</span>
    </li>
  `).join('');
}

// ============================================
// COMPARISON FEATURE
// ============================================

function toggleComparison(itemId) {
  const index = state.comparison.indexOf(itemId);

  if (index > -1) {
    state.comparison.splice(index, 1);
  } else if (state.comparison.length < state.maxComparison) {
    state.comparison.push(itemId);
  } else {
    showToast(`Maximum ${state.maxComparison} elements dans le comparateur`);
    return;
  }

  updateComparatorUI();
  renderItems(); // Re-render to update button states
}

function updateComparatorUI() {
  if (elements.comparatorCount) {
    elements.comparatorCount.textContent = state.comparison.length;
    elements.comparatorCount.classList.toggle('hidden', state.comparison.length === 0);
  }
}

function openComparator() {
  if (state.comparison.length < 2) {
    showToast('Selectionnez au moins 2 elements a comparer');
    return;
  }

  const items = state.comparison.map(id =>
    [...state.data.llms, ...state.data.tools].find(item => item.id === id)
  ).filter(Boolean);

  // Get scores for all items
  const itemsWithScores = items.map(item => ({
    ...item,
    scores: getScoreForLLM(item.id),
    badges: calculateBadges(item.id)
  }));

  // Colors for each item in comparison
  const comparisonColors = [
    { primary: '#a855f7', secondary: '#c084fc', name: 'violet' },
    { primary: '#3b82f6', secondary: '#60a5fa', name: 'bleu' },
    { primary: '#22c55e', secondary: '#4ade80', name: 'vert' },
    { primary: '#f97316', secondary: '#fb923c', name: 'orange' }
  ];

  const modalHTML = `
    <div class="modal__header comparator-header">
      <h2 class="modal__title">⚖️ Comparateur LLMs</h2>
      <div class="comparator-header__actions">
        <button class="btn btn--sm btn--secondary" onclick="exportComparison()">📥 Exporter</button>
        <button class="modal__close" onclick="closeModal()">&times;</button>
      </div>
    </div>

    <div class="comparator-content">
      <!-- Items Header Row -->
      <div class="comparator-items" style="--items-count: ${items.length}">
        ${itemsWithScores.map((item, idx) => `
          <div class="comparator-item" style="--item-color: ${comparisonColors[idx].primary}">
            <div class="comparator-item__header">
              <button class="comparator-item__remove" onclick="removeFromComparison('${item.id}')" title="Retirer">×</button>
              <div class="comparator-item__color" style="background: ${comparisonColors[idx].primary}"></div>
              <h3 class="comparator-item__name">${item.name}</h3>
              <p class="comparator-item__provider">${item.provider}</p>
            </div>
            <div class="comparator-item__badges">
              ${renderBadges(item.badges, 4)}
              ${item.tier ? `<span class="badge badge--${item.tier} badge--sm">${getTierLabel(item.tier)}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Combined Radar Chart -->
      <div class="comparator-radar">
        <h3 class="comparator-section__title">📊 Comparaison des compétences</h3>
        <div class="comparator-radar__chart">
          ${renderCombinedRadarChart(itemsWithScores, comparisonColors)}
        </div>
        <div class="comparator-radar__legend">
          ${itemsWithScores.map((item, idx) => `
            <div class="radar-legend-item">
              <span class="radar-legend-color" style="background: ${comparisonColors[idx].primary}"></span>
              <span class="radar-legend-name">${item.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Score Comparison Bars -->
      <div class="comparator-scores">
        <h3 class="comparator-section__title">📈 Scores détaillés</h3>
        ${renderScoreComparisonBars(itemsWithScores, comparisonColors)}
      </div>

      <!-- Specs Comparison Table -->
      <div class="comparator-specs">
        <h3 class="comparator-section__title">📋 Spécifications techniques</h3>
        <table class="comparison-table comparison-table--enhanced">
          <tbody>
            <tr>
              <td class="comparison-table__label">Contexte</td>
              ${items.map((item, idx) => `
                <td style="--item-color: ${comparisonColors[idx].primary}">${item.specs?.contextWindow || '-'}</td>
              `).join('')}
            </tr>
            <tr>
              <td class="comparison-table__label">Vitesse</td>
              ${items.map((item, idx) => `
                <td style="--item-color: ${comparisonColors[idx].primary}">${item.specs?.speed || '-'}</td>
              `).join('')}
            </tr>
            <tr>
              <td class="comparison-table__label">Prix Input</td>
              ${items.map((item, idx) => `
                <td style="--item-color: ${comparisonColors[idx].primary}">${item.specs?.inputPrice || '-'}</td>
              `).join('')}
            </tr>
            <tr>
              <td class="comparison-table__label">Prix Output</td>
              ${items.map((item, idx) => `
                <td style="--item-color: ${comparisonColors[idx].primary}">${item.specs?.outputPrice || '-'}</td>
              `).join('')}
            </tr>
            <tr>
              <td class="comparison-table__label">API</td>
              ${items.map((item, idx) => `
                <td style="--item-color: ${comparisonColors[idx].primary}">
                  ${item.apiAvailable ? '<span class="check-yes">✓</span>' : '<span class="check-no">✗</span>'}
                </td>
              `).join('')}
            </tr>
            <tr>
              <td class="comparison-table__label">Difficulté</td>
              ${items.map((item, idx) => `
                <td style="--item-color: ${comparisonColors[idx].primary}">${getDifficultyLabel(item.difficulty) || '-'}</td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Strengths Comparison -->
      <div class="comparator-strengths">
        <h3 class="comparator-section__title">💪 Points forts</h3>
        <div class="comparator-strengths__grid" style="--items-count: ${items.length}">
          ${items.map((item, idx) => `
            <div class="comparator-strengths__item" style="--item-color: ${comparisonColors[idx].primary}">
              <h4>${item.name}</h4>
              <ul>
                ${(item.strengths || []).slice(0, 4).map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Winner Summary -->
      <div class="comparator-verdict">
        <h3 class="comparator-section__title">🏆 Verdict</h3>
        ${renderComparisonVerdict(itemsWithScores, comparisonColors)}
      </div>
    </div>
  `;

  openModal(modalHTML);
}

// Render combined radar chart for comparison
function renderCombinedRadarChart(items, colors) {
  const size = 300;
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size / 2 - 40;

  // Get all unique categories from all items
  const allCategories = new Set();
  items.forEach(item => {
    if (item.scores) {
      Object.keys(item.scores).forEach(cat => allCategories.add(cat));
    }
  });
  const categories = Array.from(allCategories);
  const numCats = categories.length;

  if (numCats === 0) {
    return '<p class="no-data">Pas de données benchmark disponibles</p>';
  }

  // Create grid circles
  const gridCircles = [25, 50, 75, 100].map(level => {
    const r = maxRadius * level / 100;
    return `<circle cx="${centerX}" cy="${centerY}" r="${r}" class="radar-grid"/>`;
  }).join('');

  // Create axis lines and labels
  const axisLines = categories.map((cat, i) => {
    const angle = (Math.PI * 2 * i / numCats) - Math.PI / 2;
    const x = centerX + maxRadius * Math.cos(angle);
    const y = centerY + maxRadius * Math.sin(angle);
    return `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" class="radar-axis"/>`;
  }).join('');

  const labels = categories.map((cat, i) => {
    const angle = (Math.PI * 2 * i / numCats) - Math.PI / 2;
    const labelRadius = maxRadius + 25;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    const comp = COMPETENCY_LABELS[cat] || { emoji: '📊', name: cat };
    return `<text x="${x}" y="${y}" class="radar-label" text-anchor="middle" dominant-baseline="middle">${comp.emoji}</text>`;
  }).join('');

  // Create polygons for each item
  const polygons = items.map((item, idx) => {
    if (!item.scores) return '';

    const points = categories.map((cat, i) => {
      const angle = (Math.PI * 2 * i / numCats) - Math.PI / 2;
      const value = (item.scores[cat] || 0) / 100;
      const x = centerX + maxRadius * value * Math.cos(angle);
      const y = centerY + maxRadius * value * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    return `
      <polygon
        points="${points}"
        class="radar-polygon radar-polygon--${idx}"
        fill="${colors[idx].primary}"
        fill-opacity="0.2"
        stroke="${colors[idx].primary}"
        stroke-width="2"
      />
    `;
  }).join('');

  // Create points for each item
  const pointGroups = items.map((item, idx) => {
    if (!item.scores) return '';

    return categories.map((cat, i) => {
      const angle = (Math.PI * 2 * i / numCats) - Math.PI / 2;
      const value = (item.scores[cat] || 0) / 100;
      const x = centerX + maxRadius * value * Math.cos(angle);
      const y = centerY + maxRadius * value * Math.sin(angle);
      return `<circle cx="${x}" cy="${y}" r="4" fill="${colors[idx].primary}" class="radar-point--${idx}"/>`;
    }).join('');
  }).join('');

  return `
    <svg viewBox="0 0 ${size} ${size}" class="radar-chart radar-chart--combined" role="img" aria-label="Comparaison radar">
      ${gridCircles}
      ${axisLines}
      ${polygons}
      ${pointGroups}
      ${labels}
    </svg>
  `;
}

// Render score comparison bars
function renderScoreComparisonBars(items, colors) {
  // Get all categories
  const allCategories = new Set();
  items.forEach(item => {
    if (item.scores) {
      Object.keys(item.scores).forEach(cat => allCategories.add(cat));
    }
  });

  if (allCategories.size === 0) {
    return '<p class="no-data">Pas de scores disponibles</p>';
  }

  return Array.from(allCategories).map(cat => {
    const comp = COMPETENCY_LABELS[cat] || { emoji: '📊', name: cat };

    // Find the highest score for this category
    let maxScore = 0;
    items.forEach(item => {
      if (item.scores?.[cat] > maxScore) maxScore = item.scores[cat];
    });

    return `
      <div class="score-comparison-row">
        <div class="score-comparison-label">
          <span class="score-comparison-emoji">${comp.emoji}</span>
          <span class="score-comparison-name">${comp.name}</span>
        </div>
        <div class="score-comparison-bars">
          ${items.map((item, idx) => {
            const score = item.scores?.[cat] || 0;
            const isMax = score === maxScore && maxScore > 0;
            return `
              <div class="score-bar-container">
                <div
                  class="score-bar ${isMax ? 'score-bar--winner' : ''}"
                  style="--bar-width: ${score}%; --bar-color: ${colors[idx].primary}"
                >
                  <span class="score-bar__value">${score}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Render comparison verdict
function renderComparisonVerdict(items, colors) {
  // Calculate overall scores
  const itemsWithOverall = items.map((item, idx) => {
    let overall = 0;
    let count = 0;
    if (item.scores) {
      Object.values(item.scores).forEach(score => {
        overall += score;
        count++;
      });
    }
    return {
      ...item,
      overallScore: count > 0 ? Math.round(overall / count) : 0,
      color: colors[idx]
    };
  });

  // Sort by overall score
  const sorted = [...itemsWithOverall].sort((a, b) => b.overallScore - a.overallScore);

  // Find category winners
  const categoryWinners = {};
  const allCategories = new Set();
  items.forEach(item => {
    if (item.scores) {
      Object.keys(item.scores).forEach(cat => allCategories.add(cat));
    }
  });

  allCategories.forEach(cat => {
    let maxScore = 0;
    let winner = null;
    items.forEach(item => {
      if (item.scores?.[cat] > maxScore) {
        maxScore = item.scores[cat];
        winner = item.name;
      }
    });
    if (winner) {
      categoryWinners[cat] = { name: winner, score: maxScore };
    }
  });

  return `
    <div class="verdict-content">
      <div class="verdict-ranking">
        <h4>Classement général</h4>
        <ol class="verdict-list">
          ${sorted.map((item, idx) => `
            <li class="verdict-item ${idx === 0 ? 'verdict-item--winner' : ''}">
              <span class="verdict-rank">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}</span>
              <span class="verdict-name" style="color: ${item.color.primary}">${item.name}</span>
              <span class="verdict-score">${item.overallScore}/100</span>
            </li>
          `).join('')}
        </ol>
      </div>
      <div class="verdict-categories">
        <h4>Meilleur par catégorie</h4>
        <div class="verdict-categories-list">
          ${Object.entries(categoryWinners).slice(0, 6).map(([cat, winner]) => {
            const comp = COMPETENCY_LABELS[cat] || { emoji: '📊', name: cat };
            return `
              <div class="verdict-category">
                <span class="verdict-category-emoji">${comp.emoji}</span>
                <span class="verdict-category-name">${comp.name}</span>
                <span class="verdict-category-winner">${winner.name}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function removeFromComparison(itemId) {
  state.comparison = state.comparison.filter(id => id !== itemId);
  updateComparatorUI();

  if (state.comparison.length < 2) {
    closeModal();
  } else {
    openComparator();
  }
}

function exportComparison() {
  // Simple print-based PDF export
  window.print();
  showToast('Utilisez "Enregistrer en PDF" dans la boite de dialogue d\'impression');
}

// ============================================
// FAVORITES
// ============================================

function toggleFavorite(itemId) {
  const index = state.favorites.indexOf(itemId);

  if (index > -1) {
    state.favorites.splice(index, 1);
    showToast('Retire des favoris');
  } else {
    state.favorites.push(itemId);
    showToast('Ajoute aux favoris');
  }

  localStorage.setItem('ai-hub-favorites', JSON.stringify(state.favorites));
  renderItems();
}

// ============================================
// MODAL
// ============================================

function openModal(content) {
  if (elements.modalContent) {
    elements.modalContent.innerHTML = content;
  }
  if (elements.modalOverlay) {
    elements.modalOverlay.classList.add('active');
  }
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (elements.modalOverlay) {
    elements.modalOverlay.classList.remove('active');
  }
  document.body.style.overflow = '';
}

// Make closeModal globally available
window.closeModal = closeModal;
window.removeFromComparison = removeFromComparison;
window.exportComparison = exportComparison;

// ============================================
// DETAILED ITEM MODAL
// ============================================

function openItemModal(itemId) {
  const allItems = [...state.data.llms, ...state.data.tools];
  const item = allItems.find(i => i.id === itemId);
  if (!item) return;

  const isLLM = state.data.llms.some(l => l.id === itemId);
  const badges = isLLM ? calculateBadges(itemId) : [];
  const scores = isLLM ? getScoreForLLM(itemId) : null;
  const benchmarkData = state.data.benchmarks?.llmScores?.find(b => b.id === itemId);

  // Find related use cases where this LLM is recommended
  const relatedUseCases = state.data.benchmarks?.useCaseRankings?.filter(
    r => r.ranking.includes(itemId)
  ) || [];

  const modalHTML = `
    <div class="modal__header">
      <div class="modal__header-content">
        <h2 class="modal__title">${item.name}</h2>
        <p class="modal__subtitle">${item.provider}</p>
      </div>
      <button class="modal__close" onclick="closeModal()">&times;</button>
    </div>

    <div class="modal__body">
      <!-- Badges Row -->
      <div class="modal__badges">
        ${badges.length > 0 ? renderBadges(badges, 10) : ''}
        ${item.tier ? `<span class="badge badge--${item.tier}">${getTierLabel(item.tier)}</span>` : ''}
        ${item.apiAvailable ? '<span class="badge badge--api">API</span>' : ''}
      </div>

      <!-- Main Content Grid -->
      <div class="modal__grid">
        <!-- Left Column: Description & Specs -->
        <div class="modal__column">
          <p class="modal__description">${item.description}</p>

          ${item.specs ? `
            <div class="modal__section">
              <h3 class="modal__section-title">📋 Spécifications Techniques</h3>
              <div class="specs-grid specs-grid--detailed">
                <div class="spec-item">
                  <span class="spec-item__label">Fenêtre Contexte</span>
                  <span class="spec-item__value">${item.specs.contextWindow}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-item__label">Vitesse</span>
                  <span class="spec-item__value">${item.specs.speed}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-item__label">Prix Input</span>
                  <span class="spec-item__value">${item.specs.inputPrice}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-item__label">Prix Output</span>
                  <span class="spec-item__value">${item.specs.outputPrice}</span>
                </div>
              </div>
            </div>
          ` : ''}

          ${item.strengths ? `
            <div class="modal__section">
              <h3 class="modal__section-title">✅ Points Forts</h3>
              <ul class="modal__list modal__list--strengths">
                ${item.strengths.map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${item.weaknesses ? `
            <div class="modal__section">
              <h3 class="modal__section-title">⚠️ Limites</h3>
              <ul class="modal__list modal__list--weaknesses">
                ${item.weaknesses.map(w => `<li>${w}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <!-- Right Column: Radar Chart & Scores -->
        <div class="modal__column">
          ${isLLM && scores ? `
            <div class="modal__section">
              <h3 class="modal__section-title">📊 Profil de Compétences</h3>
              <div class="radar-container">
                ${renderRadarChart(itemId, 250)}
              </div>

              <!-- Score Details -->
              <div class="score-details">
                ${Object.entries(scores).map(([key, value]) => {
                  const comp = COMPETENCY_LABELS[key] || { emoji: '📊', name: key };
                  const barClass = value >= 90 ? 'excellent' : value >= 75 ? 'good' : value >= 60 ? 'average' : 'low';
                  return `
                    <div class="score-row">
                      <span class="score-row__label">${comp.emoji} ${comp.name}</span>
                      <div class="score-row__bar">
                        <div class="score-row__fill score-row__fill--${barClass}" style="width: ${value}%"></div>
                      </div>
                      <span class="score-row__value">${value}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          ${benchmarkData?.highlights ? `
            <div class="modal__section">
              <h3 class="modal__section-title">🌟 Points Clés</h3>
              <div class="highlights">
                ${benchmarkData.highlights.map(h => `<span class="highlight-tag">${h}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${benchmarkData?.bestFor ? `
            <div class="modal__section">
              <h3 class="modal__section-title">🎯 Idéal Pour</h3>
              <div class="best-for">
                ${benchmarkData.bestFor.map(b => `<span class="best-for-tag">${b}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Use Cases Section -->
      ${item.useCases ? `
        <div class="modal__section modal__section--full">
          <h3 class="modal__section-title">💼 Cas d'Usage</h3>
          <div class="use-cases-grid">
            ${item.useCases.map(uc => `<div class="use-case-card">${uc}</div>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Related Rankings -->
      ${relatedUseCases.length > 0 ? `
        <div class="modal__section modal__section--full">
          <h3 class="modal__section-title">🏆 Classement par Cas d'Usage</h3>
          <div class="related-rankings">
            ${relatedUseCases.map(uc => {
              const rank = uc.ranking.indexOf(itemId) + 1;
              const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
              return `
                <div class="ranking-badge ${rankClass}">
                  <span class="ranking-badge__position">#${rank}</span>
                  <span class="ranking-badge__use-case">${uc.useCase}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      ${item.comparison ? `
        <div class="modal__section modal__section--full">
          <h3 class="modal__section-title">⚖️ Comparaison</h3>
          <div class="comparison-note">${item.comparison}</div>
        </div>
      ` : ''}
    </div>

    <div class="modal__footer">
      ${item.docUrl ? `
        <a href="${item.docUrl}" target="_blank" rel="noopener" class="btn btn--primary">
          📚 Documentation Officielle
        </a>
      ` : ''}
      <button class="btn btn--secondary" onclick="toggleComparisonFromModal('${item.id}')">
        ${state.comparison.includes(item.id) ? '✓ Dans Comparateur' : '⚖️ Ajouter au Comparateur'}
      </button>
      <button class="btn btn--secondary" onclick="toggleFavoriteFromModal('${item.id}')">
        ${state.favorites.includes(item.id) ? '★ Favori' : '☆ Ajouter aux Favoris'}
      </button>
    </div>
  `;

  openModal(modalHTML);
}

function toggleComparisonFromModal(itemId) {
  toggleComparison(itemId);
  // Re-open modal to update button state
  openItemModal(itemId);
}

function toggleFavoriteFromModal(itemId) {
  toggleFavorite(itemId);
  // Re-open modal to update button state
  openItemModal(itemId);
}

window.openItemModal = openItemModal;
window.toggleComparisonFromModal = toggleComparisonFromModal;
window.toggleFavoriteFromModal = toggleFavoriteFromModal;

// ============================================
// HELPERS
// ============================================

function getTierLabel(tier) {
  const labels = {
    premium: 'Premium',
    standard: 'Standard',
    budget: 'Budget'
  };
  return labels[tier] || tier;
}

function getDifficultyLabel(difficulty) {
  const labels = {
    debutant: 'Debutant',
    intermediaire: 'Intermediaire',
    avancee: 'Avance'
  };
  return labels[difficulty] || difficulty;
}

function updateResultsCount(count) {
  if (elements.resultsCount) {
    elements.resultsCount.textContent = count;
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showToast(message) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-card);
    color: var(--text-primary);
    padding: var(--space-md) var(--space-xl);
    border-radius: var(--radius-lg);
    border: 1px solid var(--accent-purple);
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    animation: slideUp 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Add CSS for toast animations
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(toastStyles);

// ============================================
// BADGE CALCULATION SYSTEM
// ============================================

function calculateBadges(llmId) {
  // Return cached badges if available
  if (state.badgesCache[llmId]) {
    return state.badgesCache[llmId];
  }

  const badges = [];
  const llm = state.data.llms.find(l => l.id === llmId);
  if (!llm) return badges;

  const benchmarkData = state.data.benchmarks?.llmScores?.find(b => b.id === llmId);

  // 🆕 New badge
  if (llm.isNew) {
    badges.push('new');
  }

  // 🆓 Free badge
  if (llm.specs?.inputPrice?.toLowerCase().includes('gratuit') ||
      llm.specs?.inputPrice === '$0' ||
      llm.specs?.outputPrice?.toLowerCase().includes('gratuit')) {
    badges.push('free');
  }

  // 🔓 Open Source badge
  if (llm.categories?.includes('opensource') ||
      llm.tags?.some(t => t.toLowerCase().includes('opensource') || t.toLowerCase().includes('open source'))) {
    badges.push('opensource');
  }

  // ⚡ Fast badge (speed score >= 90)
  if (benchmarkData?.scores?.speed >= 90) {
    badges.push('fast');
  }

  // 💰 Best Value badge (in pricePerformance top 10)
  const pricePerf = state.data.benchmarks?.pricePerformance;
  if (pricePerf?.slice(0, 10).some(p => p.id === llmId)) {
    badges.push('bestValue');
  }

  // 🏆 Top 3 badge (top 3 in any competency)
  if (benchmarkData?.scores) {
    const allScores = state.data.benchmarks.llmScores;
    const competencies = Object.keys(benchmarkData.scores);

    for (const comp of competencies) {
      const sorted = [...allScores]
        .filter(s => s.scores[comp] !== undefined)
        .sort((a, b) => b.scores[comp] - a.scores[comp]);

      const rank = sorted.findIndex(s => s.id === llmId);
      if (rank >= 0 && rank < 3) {
        badges.push('top3');
        break; // Only add once
      }
    }
  }

  // 🔥 Trending badge (overall score >= 85 and new)
  if (benchmarkData?.scores) {
    const avgScore = Object.values(benchmarkData.scores).reduce((a, b) => a + b, 0) / Object.keys(benchmarkData.scores).length;
    if (avgScore >= 85 && llm.isNew) {
      badges.push('trending');
    }
  }

  // ⭐ Recommended badge (appears in useCaseRankings top 3)
  const rankings = state.data.benchmarks?.useCaseRankings;
  if (rankings?.some(r => r.ranking.slice(0, 3).includes(llmId))) {
    badges.push('recommended');
  }

  // 📚 Long Context badge (context >= 100K)
  const contextWindow = llm.specs?.contextWindow;
  if (contextWindow) {
    const contextValue = parseContextWindow(contextWindow);
    if (contextValue >= 100000) {
      badges.push('longContext');
    }
  }

  // 🎨 Multimodal badge
  if (benchmarkData?.scores?.multimodal >= 80 ||
      llm.tags?.some(t => t.toLowerCase().includes('multimodal'))) {
    badges.push('multimodal');
  }

  // Cache the result
  state.badgesCache[llmId] = badges;
  return badges;
}

function parseContextWindow(contextStr) {
  if (!contextStr) return 0;
  const str = contextStr.toString().toUpperCase();
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));

  if (str.includes('M')) return num * 1000000;
  if (str.includes('K')) return num * 1000;
  return num;
}

function renderBadges(badges, limit = 5) {
  if (!badges || badges.length === 0) return '';

  const displayBadges = badges.slice(0, limit);
  const remaining = badges.length - limit;

  let html = displayBadges.map(badgeKey => {
    const badge = BADGE_DEFINITIONS[badgeKey];
    if (!badge) return '';
    return `
      <span class="llm-badge llm-badge--${badgeKey}"
            style="--badge-color: ${badge.color}"
            title="${badge.description}">
        ${badge.emoji} ${badge.label}
      </span>
    `;
  }).join('');

  if (remaining > 0) {
    html += `<span class="llm-badge llm-badge--more">+${remaining}</span>`;
  }

  return html;
}

// ============================================
// SCORE VISUALIZATION
// ============================================

function getScoreForLLM(llmId) {
  const benchmarkData = state.data.benchmarks?.llmScores?.find(b => b.id === llmId);
  return benchmarkData?.scores || null;
}

function renderMiniScores(llmId) {
  const scores = getScoreForLLM(llmId);
  if (!scores) return '';

  // Show top 4 scores as mini bars
  const sortedScores = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return `
    <div class="mini-scores">
      ${sortedScores.map(([key, value]) => {
        const comp = COMPETENCY_LABELS[key] || { emoji: '📊', name: key };
        const barClass = value >= 90 ? 'excellent' : value >= 75 ? 'good' : value >= 60 ? 'average' : 'low';
        return `
          <div class="mini-score" title="${comp.name}: ${value}/100">
            <span class="mini-score__label">${comp.emoji}</span>
            <div class="mini-score__bar">
              <div class="mini-score__fill mini-score__fill--${barClass}" style="width: ${value}%"></div>
            </div>
            <span class="mini-score__value">${value}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderRadarChart(llmId, size = 200) {
  const scores = getScoreForLLM(llmId);
  if (!scores) return '<p class="no-data">Pas de données benchmark</p>';

  const categories = Object.keys(scores);
  const numCats = categories.length;
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size / 2 - 30;

  // Calculate points for each category
  const points = categories.map((cat, i) => {
    const angle = (Math.PI * 2 * i / numCats) - Math.PI / 2;
    const value = scores[cat] / 100;
    const x = centerX + maxRadius * value * Math.cos(angle);
    const y = centerY + maxRadius * value * Math.sin(angle);
    return { x, y, angle, value, cat, score: scores[cat] };
  });

  // Create grid circles
  const gridCircles = [25, 50, 75, 100].map(level => {
    const r = maxRadius * level / 100;
    return `<circle cx="${centerX}" cy="${centerY}" r="${r}" class="radar-grid"/>`;
  }).join('');

  // Create axis lines
  const axisLines = categories.map((cat, i) => {
    const angle = (Math.PI * 2 * i / numCats) - Math.PI / 2;
    const x = centerX + maxRadius * Math.cos(angle);
    const y = centerY + maxRadius * Math.sin(angle);
    return `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" class="radar-axis"/>`;
  }).join('');

  // Create labels
  const labels = categories.map((cat, i) => {
    const angle = (Math.PI * 2 * i / numCats) - Math.PI / 2;
    const labelRadius = maxRadius + 20;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    const comp = COMPETENCY_LABELS[cat] || { emoji: '📊', name: cat };
    return `<text x="${x}" y="${y}" class="radar-label" text-anchor="middle" dominant-baseline="middle">${comp.emoji}</text>`;
  }).join('');

  // Create polygon
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return `
    <svg viewBox="0 0 ${size} ${size}" class="radar-chart" role="img" aria-label="Graphique radar des compétences">
      <defs>
        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: var(--accent-primary); stop-opacity: 0.3"/>
          <stop offset="100%" style="stop-color: var(--accent-secondary); stop-opacity: 0.3"/>
        </linearGradient>
      </defs>
      ${gridCircles}
      ${axisLines}
      <polygon points="${polygonPoints}" class="radar-polygon" fill="url(#radarGradient)"/>
      ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" class="radar-point" data-score="${p.score}" data-cat="${p.cat}"/>`).join('')}
      ${labels}
    </svg>
  `;
}

// ============================================
// BACK NAVIGATION
// ============================================

function goBack() {
  state.currentCategory = null;
  state.searchQuery = '';
  if (elements.searchInput) elements.searchInput.value = '';
  renderCategories();
}

// Make goBack globally available
window.goBack = goBack;

// ============================================
// BENCHMARK RENDERING
// ============================================

function renderBenchmark() {
  if (!state.data?.benchmarks) return;

  populateBenchmarkFilters();
  renderBenchmarkChart();
  renderUseCaseRankings();
  renderPricePerformance();
  setupBenchmarkListeners();
}

function populateBenchmarkFilters() {
  if (elements.benchmarkCategory && state.data.benchmarks.categories) {
    const options = state.data.benchmarks.categories.map(cat =>
      `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
    ).join('');
    elements.benchmarkCategory.innerHTML = `<option value="all">Toutes les competences</option>${options}`;
  }
}

function setupBenchmarkListeners() {
  if (elements.benchmarkSort) {
    elements.benchmarkSort.removeEventListener('change', handleBenchmarkSortChange);
    elements.benchmarkSort.addEventListener('change', handleBenchmarkSortChange);
  }
  if (elements.benchmarkCategory) {
    elements.benchmarkCategory.removeEventListener('change', handleBenchmarkCategoryChange);
    elements.benchmarkCategory.addEventListener('change', handleBenchmarkCategoryChange);
  }
}

function handleBenchmarkSortChange() {
  renderBenchmarkChart();
}

function handleBenchmarkCategoryChange() {
  renderBenchmarkChart();
}

function renderBenchmarkChart() {
  if (!elements.benchmarkChart || !state.data.benchmarks?.llmScores) return;

  const sortBy = elements.benchmarkSort?.value || 'overall';
  const filterCategory = elements.benchmarkCategory?.value || 'all';

  // Get scores and sort
  let scores = state.data.benchmarks.llmScores.map(item => {
    const llm = state.data.llms.find(l => l.id === item.id);
    let score;

    if (sortBy === 'overall') {
      // Calculate average of all scores
      const values = Object.values(item.scores);
      score = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    } else {
      score = item.scores[sortBy] || 0;
    }

    return {
      ...item,
      llm,
      sortScore: score,
      displayScore: score
    };
  });

  // Filter by category if selected
  if (filterCategory !== 'all') {
    scores = scores.filter(item => item.scores[filterCategory] !== undefined);
    scores.forEach(item => {
      item.displayScore = item.scores[filterCategory];
      item.sortScore = item.scores[filterCategory];
    });
  }

  // Sort by score
  scores.sort((a, b) => b.sortScore - a.sortScore);

  // Render chart
  const chartHTML = scores.map((item, index) => {
    const scoreClass = getScoreClass(item.displayScore);
    const barClass = getBarClass(item.displayScore);

    return `
      <div class="benchmark-row">
        <div class="benchmark-row__name">
          <span>${item.llm?.name || item.id}</span>
          <span class="benchmark-row__provider">${item.llm?.provider || ''}</span>
        </div>
        <div class="benchmark-row__bar-container">
          <div class="benchmark-row__bar benchmark-row__bar--${barClass}" style="width: ${item.displayScore}%"></div>
        </div>
        <span class="benchmark-row__score benchmark-row__score--${scoreClass}">${item.displayScore}</span>
      </div>
    `;
  }).join('');

  // Add legend
  const legendHTML = `
    <div class="benchmark-legend">
      <div class="benchmark-legend__item">
        <div class="benchmark-legend__color benchmark-legend__color--excellent"></div>
        <span>Excellent (90+)</span>
      </div>
      <div class="benchmark-legend__item">
        <div class="benchmark-legend__color benchmark-legend__color--good"></div>
        <span>Bon (75-89)</span>
      </div>
      <div class="benchmark-legend__item">
        <div class="benchmark-legend__color benchmark-legend__color--average"></div>
        <span>Moyen (60-74)</span>
      </div>
      <div class="benchmark-legend__item">
        <div class="benchmark-legend__color benchmark-legend__color--low"></div>
        <span>Faible (<60)</span>
      </div>
    </div>
  `;

  elements.benchmarkChart.innerHTML = chartHTML + legendHTML;
}

function getScoreClass(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  return 'low';
}

function getBarClass(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  return 'low';
}

function renderUseCaseRankings() {
  if (!elements.usecaseRankingsGrid || !state.data.benchmarks?.useCaseRankings) return;

  const rankings = state.data.benchmarks.useCaseRankings;

  const html = rankings.map(useCase => {
    const rankingHTML = useCase.ranking.map((llmId, index) => {
      const llm = state.data.llms.find(l => l.id === llmId);
      const rankClass = index < 3 ? `usecase-card__rank-number--${index + 1}` : 'usecase-card__rank-number--other';

      return `
        <div class="usecase-card__rank">
          <span class="usecase-card__rank-number ${rankClass}">${index + 1}</span>
          <span class="usecase-card__rank-name">${llm?.name || llmId}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="usecase-card">
        <h4 class="usecase-card__title">${useCase.useCase}</h4>
        <p class="usecase-card__description">${useCase.description}</p>
        <div class="usecase-card__ranking">
          ${rankingHTML}
        </div>
      </div>
    `;
  }).join('');

  elements.usecaseRankingsGrid.innerHTML = html;
}

function renderPricePerformance() {
  if (!elements.pricePerformanceList || !state.data.benchmarks?.pricePerformance) return;

  const items = state.data.benchmarks.pricePerformance;

  const html = items.map((item, index) => {
    const llm = state.data.llms.find(l => l.id === item.id);

    return `
      <div class="price-performance-item">
        <div class="price-performance-item__rank">${index + 1}</div>
        <div class="price-performance-item__info">
          <div class="price-performance-item__name">${llm?.name || item.id}</div>
          <div class="price-performance-item__note">${item.note}</div>
        </div>
        <div class="price-performance-item__score">${item.score}</div>
      </div>
    `;
  }).join('');

  elements.pricePerformanceList.innerHTML = html;
}

// ============================================
// PHASE 3: USE CASE FILTERING
// ============================================

function handleUseCaseFilterChange(e) {
  state.filters.useCase = e.target.value;
  if (state.filters.useCase) {
    // Find LLMs that are in this use case ranking
    const useCase = state.data.benchmarks?.useCaseRankings?.find(
      uc => uc.useCase === state.filters.useCase
    );
    if (useCase) {
      state.currentCategory = null;
      renderItemsByUseCase(useCase);
    }
  } else {
    renderCategories();
  }
}

function renderItemsByUseCase(useCase) {
  // Hide categories, show items section
  if (elements.categoriesGrid) elements.categoriesGrid.classList.add('hidden');
  if (elements.itemsSection) elements.itemsSection.classList.remove('hidden');

  if (elements.itemsSectionTitle) {
    elements.itemsSectionTitle.innerHTML = `
      <span class="items-section__icon">🎯</span>
      ${useCase.useCase}
      <span class="items-section__desc">${useCase.description || ''}</span>
    `;
  }

  // Get items from ranking
  const rankedLLMs = useCase.ranking
    .map(id => state.data.llms.find(l => l.id === id))
    .filter(Boolean);

  if (elements.itemsGrid) {
    const html = rankedLLMs.map((item, index) => {
      return renderItemCard(item, index + 1);
    }).join('');

    elements.itemsGrid.innerHTML = html || '<p class="no-results">Aucun résultat</p>';
    elements.resultsCount.textContent = rankedLLMs.length;
  }
}

function renderItemCard(item, rank = null) {
  const isLLM = state.data.llms.some(l => l.id === item.id);
  const badges = isLLM ? calculateBadges(item.id) : [];
  const isInComparison = state.comparison.includes(item.id);
  const isFavorite = state.favorites.includes(item.id);

  return `
    <article class="item-card" data-id="${item.id}">
      ${rank ? `<div class="item-card__rank">#${rank}</div>` : ''}
      <div class="item-card__header">
        <div class="item-card__title-row">
          <h3 class="item-card__name">${item.name}</h3>
          ${item.tier ? `<span class="badge badge--${item.tier}">${getTierLabel(item.tier)}</span>` : ''}
        </div>
        <p class="item-card__provider">${item.provider}</p>
      </div>

      ${badges.length > 0 ? `
        <div class="item-card__badges">
          ${renderBadges(badges, 4)}
        </div>
      ` : ''}

      ${isLLM ? renderMiniScores(item.id) : ''}

      <p class="item-card__description">${item.description}</p>

      <div class="item-card__tags">
        ${(item.strengths || []).slice(0, 2).map(s =>
          `<span class="item-card__tag">${s}</span>`
        ).join('')}
      </div>

      <div class="item-card__footer">
        <div class="item-card__specs">
          ${item.specs?.contextWindow ? `<span class="spec">📚 ${item.specs.contextWindow}</span>` : ''}
          ${item.specs?.speed ? `<span class="spec">⚡ ${item.specs.speed}</span>` : ''}
        </div>
        <div class="item-card__actions">
          <button class="btn btn--icon ${isFavorite ? 'btn--active' : ''}"
                  onclick="toggleFavorite('${item.id}')"
                  title="${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
            ${isFavorite ? '⭐' : '☆'}
          </button>
          <button class="btn btn--icon ${isInComparison ? 'btn--active' : ''}"
                  onclick="toggleComparison('${item.id}')"
                  title="${isInComparison ? 'Retirer du comparateur' : 'Ajouter au comparateur'}">
            ⚖️
          </button>
        </div>
      </div>

      <button class="item-card__details-btn" onclick="openItemModal('${item.id}')">
        Voir détails →
      </button>
    </article>
  `;
}

// ============================================
// PHASE 3: NEWS SECTION
// ============================================

function renderNews() {
  renderNewsTicker();
  renderNewsGrid();
}

function renderNewsTicker() {
  if (!elements.newsTicker) return;

  const tickerContent = NEWS_DATA.map(news => `
    <span class="news-ticker__item">
      <span class="news-ticker__icon">${news.icon}</span>
      <span class="news-ticker__text">${news.title}</span>
    </span>
  `).join('<span class="news-ticker__separator">•</span>');

  elements.newsTicker.innerHTML = `
    <div class="news-ticker__track">
      ${tickerContent}
      ${tickerContent}
    </div>
  `;
}

function renderNewsGrid() {
  if (!elements.newsGrid) return;

  const html = NEWS_DATA.slice(0, 4).map(news => `
    <article class="news-card" onclick="handleNewsClick('${news.link}')">
      <div class="news-card__header">
        <span class="news-card__icon">${news.icon}</span>
        <span class="news-card__date">${formatDate(news.date)}</span>
      </div>
      <h3 class="news-card__title">${news.title}</h3>
      <p class="news-card__summary">${news.summary}</p>
      <span class="news-card__category news-card__category--${news.category}">${getCategoryLabel(news.category)}</span>
    </article>
  `).join('');

  elements.newsGrid.innerHTML = html;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getCategoryLabel(category) {
  const labels = {
    release: '🚀 Sortie',
    achievement: '🏆 Record',
    api: '🔌 API',
    update: '📦 Mise à jour'
  };
  return labels[category] || category;
}

function handleNewsClick(link) {
  if (link.startsWith('#')) {
    const itemId = link.substring(1);
    openItemModal(itemId);
  }
}

// Make handleNewsClick global
window.handleNewsClick = handleNewsClick;

// ============================================
// PHASE 3: EXAMPLES FILTERING
// ============================================

function handleExamplesFilterChange(e) {
  state.examplesFilter = e.target.value;
  renderExamples();
}

// ============================================
// PHASE 3: THEME MANAGEMENT
// ============================================

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('ai-hub-theme', state.theme);
  applyTheme(state.theme);
  showToast(`Theme ${state.theme === 'dark' ? 'sombre' : 'clair'} active`);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  // Update theme toggle icon
  if (elements.themeToggle) {
    const icon = elements.themeToggle.querySelector('.theme-toggle__icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }
}

// ============================================
// PHASE 3: SETTINGS / PREFERENCES
// ============================================

function openSettings() {
  const modalHTML = `
    <div class="modal__header">
      <h2 class="modal__title">⚙️ Préférences</h2>
      <button class="modal__close" onclick="closeModal()">&times;</button>
    </div>
    <div class="settings-content">
      <div class="settings-section">
        <h3 class="settings-section__title">🎨 Apparence</h3>
        <div class="settings-option">
          <span class="settings-option__label">Thème</span>
          <div class="settings-option__control">
            <button class="theme-btn ${state.theme === 'dark' ? 'active' : ''}" onclick="setTheme('dark')">
              🌙 Sombre
            </button>
            <button class="theme-btn ${state.theme === 'light' ? 'active' : ''}" onclick="setTheme('light')">
              ☀️ Clair
            </button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section__title">⭐ Favoris</h3>
        <div class="settings-option">
          <span class="settings-option__label">${state.favorites.length} favoris enregistrés</span>
          <button class="btn btn--sm btn--secondary" onclick="exportFavorites()">
            📥 Exporter
          </button>
        </div>
        ${state.favorites.length > 0 ? `
          <div class="favorites-list">
            ${state.favorites.map(id => {
              const item = [...state.data.llms, ...state.data.tools].find(i => i.id === id);
              return item ? `
                <div class="favorite-item">
                  <span>${item.name}</span>
                  <button class="btn btn--icon btn--sm" onclick="toggleFavorite('${id}'); openSettings();">×</button>
                </div>
              ` : '';
            }).join('')}
          </div>
        ` : '<p class="settings-empty">Aucun favori pour le moment</p>'}
      </div>

      <div class="settings-section">
        <h3 class="settings-section__title">📊 Statistiques</h3>
        <div class="settings-stats">
          <div class="stat-item">
            <span class="stat-value">${state.data.llms.length}</span>
            <span class="stat-label">LLMs</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${state.data.tools.length}</span>
            <span class="stat-label">Outils</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${state.data.examples?.length || 0}</span>
            <span class="stat-label">Exemples</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section__title">⌨️ Raccourcis clavier</h3>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <kbd>/</kbd> <span>Rechercher</span>
          </div>
          <div class="shortcut-item">
            <kbd>Esc</kbd> <span>Fermer modal</span>
          </div>
          <div class="shortcut-item">
            <kbd>T</kbd> <span>Changer thème</span>
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <p>AI Reference Hub v3.2 - MR Tech Lab</p>
        <p>Données: Janvier 2025</p>
      </div>
    </div>
  `;

  openModal(modalHTML);
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('ai-hub-theme', theme);
  applyTheme(theme);
  openSettings(); // Refresh modal
}

function exportFavorites() {
  const favorites = state.favorites.map(id => {
    const item = [...state.data.llms, ...state.data.tools].find(i => i.id === id);
    return item ? { id: item.id, name: item.name, provider: item.provider } : null;
  }).filter(Boolean);

  const dataStr = JSON.stringify(favorites, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'ai-hub-favorites.json';
  link.click();

  URL.revokeObjectURL(url);
  showToast('Favoris exportés');
}

// Make settings functions global
window.setTheme = setTheme;
window.exportFavorites = exportFavorites;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', loadData);
