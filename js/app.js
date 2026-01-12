/**
 * AI Reference Hub - Main Application
 * Version: 4.3.0 - Phase 4: Enhanced LLM Detail Modal
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
  // Phase 1 Critical: Enhanced Cumulative Filters
  filters: {
    category: '',
    useCase: '',
    // Cumulative filter arrays
    competencies: [],
    tiers: [],
    difficulties: [],
    accessTypes: [],
    contextSizes: [],
    minScore: 0,
    sortBy: ''
  },
  filterLogic: 'and', // 'and' or 'or' for cumulative filters
  filtersExpanded: false,
  comparison: [],
  maxComparison: 4,
  favorites: JSON.parse(localStorage.getItem('ai-hub-favorites') || '[]'),
  badgesCache: {},
  // Phase 3: User preferences
  preferences: JSON.parse(localStorage.getItem('ai-hub-preferences') || '{}'),
  theme: localStorage.getItem('ai-hub-theme') || 'dark',
  examplesFilter: '',
  // Chart.js instance for comparator
  radarChart: null
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
  usecaseFilter: document.getElementById('usecase-filter'),
  categoriesGrid: document.getElementById('categories-grid'),
  itemsSection: document.getElementById('items-section'),
  itemsGrid: document.getElementById('items-grid'),
  itemsSectionTitle: document.getElementById('items-section-title'),
  examplesGrid: document.getElementById('examples-grid'),
  examplesCategoryFilter: document.getElementById('examples-category-filter'),
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
  newsGrid: document.getElementById('news-grid'),
  // Phase 1 Critical: Cumulative Filters elements
  toggleFiltersBtn: document.getElementById('toggle-filters'),
  advancedFilters: document.getElementById('advanced-filters'),
  activeFiltersCount: document.getElementById('active-filters-count'),
  activeFiltersTags: document.getElementById('active-filters-tags'),
  filterLogicAnd: document.getElementById('filter-logic-and'),
  filterLogicOr: document.getElementById('filter-logic-or'),
  resetFilters: document.getElementById('reset-filters'),
  minScoreSlider: document.getElementById('min-score-slider'),
  minScoreValue: document.getElementById('min-score-value'),
  sortBy: document.getElementById('sort-by')
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
  // Phase 3: Load user preferences first
  loadPreferences();

  // Apply saved theme
  applyTheme(state.theme);

  updateCounts();
  populateFilters();
  renderCategories();
  renderNews();
  renderExamples();
  renderQuickGuide();
  setupEventListeners();
  updateComparatorUI();

  // Phase 3: Apply preferences to UI elements
  applyPreferencesToUI();

  // Phase 3: Attach auto-save for preferences
  attachPreferenceSaving();

  // Switch to saved tab if different from default
  if (state.currentTab !== 'llms') {
    handleTabChange(state.currentTab);
  }

  // Phase 2: Initialize performance optimizations
  initPerformanceOptimizations();

  console.log('✅ AI Reference Hub v4.3.0 initialisé');
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

  // Category and use case select filters
  if (elements.categoryFilter) {
    elements.categoryFilter.addEventListener('change', handleCategorySelectChange);
  }
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

  // Phase 1 Critical: Cumulative Filters Event Listeners
  setupCumulativeFiltersListeners();
}

// ============================================
// PHASE 1 CRITICAL: CUMULATIVE FILTERS SETUP
// ============================================

function setupCumulativeFiltersListeners() {
  // Toggle filters panel
  if (elements.toggleFiltersBtn) {
    elements.toggleFiltersBtn.addEventListener('click', toggleFiltersPanel);
  }

  // Filter logic toggle (AND/OR)
  if (elements.filterLogicAnd) {
    elements.filterLogicAnd.addEventListener('click', () => setFilterLogic('and'));
  }
  if (elements.filterLogicOr) {
    elements.filterLogicOr.addEventListener('click', () => setFilterLogic('or'));
  }

  // Reset filters
  if (elements.resetFilters) {
    elements.resetFilters.addEventListener('click', resetAllFilters);
  }

  // Min score slider
  if (elements.minScoreSlider) {
    elements.minScoreSlider.addEventListener('input', handleMinScoreChange);
  }

  // Sort by
  if (elements.sortBy) {
    elements.sortBy.addEventListener('change', handleSortChange);
  }

  // Checkbox filters with debounce
  const debouncedFilterUpdate = debounce(applyFiltersAndRender, 200);

  // Competency checkboxes
  document.querySelectorAll('input[name="competency"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      updateCheckboxFilter('competencies', e.target.value, e.target.checked);
      debouncedFilterUpdate();
    });
  });

  // Tier checkboxes
  document.querySelectorAll('input[name="tier"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      updateCheckboxFilter('tiers', e.target.value, e.target.checked);
      debouncedFilterUpdate();
    });
  });

  // Access type checkboxes
  document.querySelectorAll('input[name="access"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      updateCheckboxFilter('accessTypes', e.target.value, e.target.checked);
      debouncedFilterUpdate();
    });
  });

  // Context size checkboxes
  document.querySelectorAll('input[name="context"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      updateCheckboxFilter('contextSizes', e.target.value, e.target.checked);
      debouncedFilterUpdate();
    });
  });

  // Difficulty checkboxes
  document.querySelectorAll('input[name="difficulty"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      updateCheckboxFilter('difficulties', e.target.value, e.target.checked);
      debouncedFilterUpdate();
    });
  });
}

function toggleFiltersPanel() {
  state.filtersExpanded = !state.filtersExpanded;

  if (elements.advancedFilters) {
    elements.advancedFilters.classList.toggle('hidden', !state.filtersExpanded);
  }
  if (elements.toggleFiltersBtn) {
    elements.toggleFiltersBtn.setAttribute('aria-expanded', state.filtersExpanded);
    elements.toggleFiltersBtn.classList.toggle('active', state.filtersExpanded);
  }
}

function setFilterLogic(logic) {
  state.filterLogic = logic;

  // Update UI
  if (elements.filterLogicAnd) {
    elements.filterLogicAnd.classList.toggle('active', logic === 'and');
  }
  if (elements.filterLogicOr) {
    elements.filterLogicOr.classList.toggle('active', logic === 'or');
  }

  applyFiltersAndRender();
}

function updateCheckboxFilter(filterKey, value, isChecked) {
  if (isChecked) {
    if (!state.filters[filterKey].includes(value)) {
      state.filters[filterKey].push(value);
    }
  } else {
    state.filters[filterKey] = state.filters[filterKey].filter(v => v !== value);
  }

  updateActiveFiltersUI();
}

function handleMinScoreChange(e) {
  state.filters.minScore = parseInt(e.target.value, 10);
  if (elements.minScoreValue) {
    elements.minScoreValue.textContent = state.filters.minScore;
  }
  debounce(applyFiltersAndRender, 200)();
}

function handleSortChange(e) {
  state.filters.sortBy = e.target.value;
  applyFiltersAndRender();
}

function handleCategorySelectChange(e) {
  state.filters.category = e.target.value;
  applyFiltersAndRender();
}

function resetAllFilters() {
  // Reset state
  state.filters = {
    category: '',
    useCase: '',
    competencies: [],
    tiers: [],
    difficulties: [],
    accessTypes: [],
    contextSizes: [],
    minScore: 0,
    sortBy: ''
  };
  state.filterLogic = 'and';
  state.searchQuery = '';
  state.currentCategory = null;

  // Reset UI elements
  if (elements.searchInput) elements.searchInput.value = '';
  if (elements.categoryFilter) elements.categoryFilter.value = '';
  if (elements.usecaseFilter) elements.usecaseFilter.value = '';
  if (elements.minScoreSlider) elements.minScoreSlider.value = 0;
  if (elements.minScoreValue) elements.minScoreValue.textContent = '0';
  if (elements.sortBy) elements.sortBy.value = '';

  // Reset filter logic UI
  if (elements.filterLogicAnd) elements.filterLogicAnd.classList.add('active');
  if (elements.filterLogicOr) elements.filterLogicOr.classList.remove('active');

  // Reset all checkboxes
  document.querySelectorAll('.advanced-filters input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  updateActiveFiltersUI();
  renderCategories();
  showToast('Filtres reinitialises');
}

function updateActiveFiltersUI() {
  const activeCount = countActiveFilters();

  // Update badge count
  if (elements.activeFiltersCount) {
    elements.activeFiltersCount.textContent = activeCount;
    elements.activeFiltersCount.classList.toggle('hidden', activeCount === 0);
  }

  // Update active filters tags
  renderActiveFiltersTags();
}

function countActiveFilters() {
  // Defensive: ensure filter arrays are defined
  const competencies = state.filters.competencies || [];
  const tiers = state.filters.tiers || [];
  const difficulties = state.filters.difficulties || [];
  const accessTypes = state.filters.accessTypes || [];
  const contextSizes = state.filters.contextSizes || [];

  let count = 0;
  count += competencies.length;
  count += tiers.length;
  count += difficulties.length;
  count += accessTypes.length;
  count += contextSizes.length;
  if (state.filters.minScore > 0) count++;
  if (state.filters.category) count++;
  if (state.filters.useCase) count++;
  return count;
}

function renderActiveFiltersTags() {
  if (!elements.activeFiltersTags) return;

  // Defensive: ensure filter arrays are defined
  const competencies = state.filters.competencies || [];
  const tiers = state.filters.tiers || [];
  const difficulties = state.filters.difficulties || [];
  const accessTypes = state.filters.accessTypes || [];
  const contextSizes = state.filters.contextSizes || [];

  const tags = [];

  // Add competency tags
  competencies.forEach(comp => {
    const label = COMPETENCY_LABELS[comp];
    tags.push({ type: 'competencies', value: comp, label: `${label?.emoji || ''} ${label?.name || comp}` });
  });

  // Add tier tags
  tiers.forEach(tier => {
    tags.push({ type: 'tiers', value: tier, label: getTierLabel(tier) });
  });

  // Add difficulty tags
  difficulties.forEach(diff => {
    tags.push({ type: 'difficulties', value: diff, label: getDifficultyLabel(diff) });
  });

  // Add access type tags
  const accessLabels = { api: '🔌 API', opensource: '🌐 Open Source', free: '🆓 Gratuit' };
  accessTypes.forEach(access => {
    tags.push({ type: 'accessTypes', value: access, label: accessLabels[access] || access });
  });

  // Add context size tags
  const contextLabels = { small: '≤32K', medium: '32K-128K', large: '128K-1M', xlarge: '>1M' };
  contextSizes.forEach(ctx => {
    tags.push({ type: 'contextSizes', value: ctx, label: `📚 ${contextLabels[ctx]}` });
  });

  // Add min score tag
  if (state.filters.minScore > 0) {
    tags.push({ type: 'minScore', value: state.filters.minScore, label: `📊 Score ≥${state.filters.minScore}` });
  }

  // Add category tag
  if (state.filters.category) {
    const cat = state.data.categories.find(c => c.id === state.filters.category);
    tags.push({ type: 'category', value: state.filters.category, label: `${cat?.emoji || ''} ${cat?.name || state.filters.category}` });
  }

  if (tags.length === 0) {
    elements.activeFiltersTags.classList.add('hidden');
    return;
  }

  elements.activeFiltersTags.classList.remove('hidden');
  elements.activeFiltersTags.innerHTML = tags.map(tag => `
    <span class="filter-tag" data-type="${tag.type}" data-value="${tag.value}">
      ${tag.label}
      <button class="filter-tag__remove" onclick="removeFilterTag('${tag.type}', '${tag.value}')" aria-label="Retirer ce filtre">×</button>
    </span>
  `).join('');
}

function removeFilterTag(type, value) {
  if (type === 'minScore') {
    state.filters.minScore = 0;
    if (elements.minScoreSlider) elements.minScoreSlider.value = 0;
    if (elements.minScoreValue) elements.minScoreValue.textContent = '0';
  } else if (type === 'category') {
    state.filters.category = '';
    if (elements.categoryFilter) elements.categoryFilter.value = '';
  } else if (type === 'useCase') {
    state.filters.useCase = '';
    if (elements.usecaseFilter) elements.usecaseFilter.value = '';
  } else {
    state.filters[type] = state.filters[type].filter(v => v !== value);
    // Uncheck corresponding checkbox
    const checkbox = document.querySelector(`input[name="${type.slice(0, -1)}"][value="${value}"], input[name="${type.slice(0, -2)}"][value="${value}"]`);
    if (checkbox) checkbox.checked = false;
  }

  updateActiveFiltersUI();
  applyFiltersAndRender();
}

// Make removeFilterTag globally available
window.removeFilterTag = removeFilterTag;

function applyFiltersAndRender() {
  updateActiveFiltersUI();

  // If any filter is active, show filtered items
  if (hasActiveFilters() || state.searchQuery) {
    state.currentCategory = 'filter';
    renderItems();
  } else {
    state.currentCategory = null;
    renderCategories();
  }
}

function hasActiveFilters() {
  return (
    state.filters.competencies.length > 0 ||
    state.filters.tiers.length > 0 ||
    state.filters.difficulties.length > 0 ||
    state.filters.accessTypes.length > 0 ||
    state.filters.contextSizes.length > 0 ||
    state.filters.minScore > 0 ||
    state.filters.category !== '' ||
    state.filters.useCase !== ''
  );
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
  // Defensive: ensure filter arrays are defined
  state.filters.competencies = state.filters.competencies || [];
  state.filters.tiers = state.filters.tiers || [];
  state.filters.difficulties = state.filters.difficulties || [];
  state.filters.accessTypes = state.filters.accessTypes || [];
  state.filters.contextSizes = state.filters.contextSizes || [];

  let filtered = items.filter(item => {
    // Search query always applies (AND logic)
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

    // Category filter always applies
    if (state.filters.category && !(item.categories || []).includes(state.filters.category)) {
      return false;
    }

    // Phase 1 Critical: Cumulative filters with AND/OR logic
    const filterResults = [];

    // Competency filter (check if LLM has high scores in selected competencies)
    if (state.filters.competencies.length > 0) {
      const benchmarkData = state.data.benchmarks?.llmScores?.find(b => b.id === item.id);
      if (benchmarkData?.scores) {
        const hasCompetency = state.filters.competencies.some(comp =>
          benchmarkData.scores[comp] !== undefined && benchmarkData.scores[comp] >= 70
        );
        filterResults.push(hasCompetency);
      } else {
        filterResults.push(false);
      }
    }

    // Tier filter (multiple selection)
    if (state.filters.tiers.length > 0) {
      filterResults.push(state.filters.tiers.includes(item.tier));
    }

    // Difficulty filter (multiple selection)
    if (state.filters.difficulties.length > 0) {
      filterResults.push(state.filters.difficulties.includes(item.difficulty));
    }

    // Access type filter
    if (state.filters.accessTypes.length > 0) {
      const accessChecks = state.filters.accessTypes.map(access => {
        switch (access) {
          case 'api':
            return item.apiAvailable === true;
          case 'opensource':
            return item.categories?.includes('opensource') ||
                   item.tags?.some(t => t.toLowerCase().includes('opensource') || t.toLowerCase().includes('open source'));
          case 'free':
            return item.specs?.inputPrice?.toLowerCase().includes('gratuit') ||
                   item.specs?.inputPrice === '$0' ||
                   item.specs?.inputPrice?.toLowerCase().includes('free');
          default:
            return false;
        }
      });
      filterResults.push(accessChecks.some(check => check));
    }

    // Context size filter
    if (state.filters.contextSizes.length > 0) {
      const contextValue = parseContextWindow(item.specs?.contextWindow);
      const contextChecks = state.filters.contextSizes.map(size => {
        switch (size) {
          case 'small':
            return contextValue <= 32000;
          case 'medium':
            return contextValue > 32000 && contextValue <= 128000;
          case 'large':
            return contextValue > 128000 && contextValue <= 1000000;
          case 'xlarge':
            return contextValue > 1000000;
          default:
            return false;
        }
      });
      filterResults.push(contextChecks.some(check => check));
    }

    // Min score filter
    if (state.filters.minScore > 0) {
      const benchmarkData = state.data.benchmarks?.llmScores?.find(b => b.id === item.id);
      if (benchmarkData?.scores) {
        const avgScore = Object.values(benchmarkData.scores).reduce((a, b) => a + b, 0) /
                        Object.keys(benchmarkData.scores).length;
        filterResults.push(avgScore >= state.filters.minScore);
      } else {
        filterResults.push(false);
      }
    }

    // Apply AND/OR logic
    if (filterResults.length === 0) return true;

    if (state.filterLogic === 'and') {
      return filterResults.every(result => result);
    } else {
      return filterResults.some(result => result);
    }
  });

  // Apply sorting AFTER filtering
  if (state.filters.sortBy) {
    filtered = sortItems(filtered, state.filters.sortBy);
  }

  return filtered;
}

// Sort items based on selected criteria
function sortItems(items, sortBy) {
  const sorted = [...items];

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'score-desc':
      return sorted.sort((a, b) => {
        const scoreA = getAverageScore(a.id);
        const scoreB = getAverageScore(b.id);
        return scoreB - scoreA;
      });
    case 'score-asc':
      return sorted.sort((a, b) => {
        const scoreA = getAverageScore(a.id);
        const scoreB = getAverageScore(b.id);
        return scoreA - scoreB;
      });
    case 'price-asc':
      return sorted.sort((a, b) => {
        const priceA = parsePrice(a.specs?.inputPrice);
        const priceB = parsePrice(b.specs?.inputPrice);
        return priceA - priceB;
      });
    case 'price-desc':
      return sorted.sort((a, b) => {
        const priceA = parsePrice(a.specs?.inputPrice);
        const priceB = parsePrice(b.specs?.inputPrice);
        return priceB - priceA;
      });
    case 'context-desc':
      return sorted.sort((a, b) => {
        const ctxA = parseContextWindow(a.specs?.contextWindow);
        const ctxB = parseContextWindow(b.specs?.contextWindow);
        return ctxB - ctxA;
      });
    default:
      return sorted;
  }
}

function getAverageScore(llmId) {
  const benchmarkData = state.data.benchmarks?.llmScores?.find(b => b.id === llmId);
  if (!benchmarkData?.scores) return 0;
  const values = Object.values(benchmarkData.scores);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function parsePrice(priceStr) {
  if (!priceStr) return Infinity;
  if (priceStr.toLowerCase().includes('gratuit') || priceStr.toLowerCase().includes('free') || priceStr === '$0') {
    return 0;
  }
  const match = priceStr.match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1]) : Infinity;
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
  // Card click opens modal
  document.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't open modal if clicking on action buttons, links, or the details button
      if (e.target.closest('.item-card__action') ||
          e.target.closest('a') ||
          e.target.closest('.item-card__details-btn') ||
          e.target.closest('.btn')) return;
      const itemId = card.dataset.id;
      if (itemId) openItemModal(itemId);
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

  // Difficulty labels
  const difficultyLabels = {
    debutant: { label: 'Débutant', class: 'difficulty--easy', icon: '🟢' },
    intermediaire: { label: 'Intermédiaire', class: 'difficulty--medium', icon: '🟡' },
    avance: { label: 'Avancé', class: 'difficulty--hard', icon: '🟠' },
    expert: { label: 'Expert', class: 'difficulty--expert', icon: '🔴' }
  };

  elements.examplesGrid.innerHTML = examples.map((example, idx) => {
    const difficulty = difficultyLabels[example.difficulty] || difficultyLabels.intermediaire;
    const hasPrompt = example.prompt && example.prompt.length > 0;
    const promptId = `prompt-${idx}`;

    return `
    <div class="example-card example-card--enhanced" style="--example-color: ${getCategoryColor(example.categoryId)}">
      <div class="example-card__header">
        <div class="example-card__icon">${getCategoryEmoji(example.categoryId)}</div>
        <h4 class="example-card__title">${example.title}</h4>
        <div class="example-card__badges">
          <span class="example-card__difficulty ${difficulty.class}" title="${difficulty.label}">
            ${difficulty.icon} ${difficulty.label}
          </span>
          ${example.estimatedTime ? `<span class="example-card__time" title="Temps estimé">⏱️ ${example.estimatedTime}</span>` : ''}
        </div>
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

        ${hasPrompt ? `
        <div class="example-card__prompt-section">
          <button class="example-card__prompt-toggle" onclick="toggleExamplePrompt('${promptId}')" aria-expanded="false" aria-controls="${promptId}">
            <span class="prompt-toggle__icon">📝</span>
            <span class="prompt-toggle__text">Voir le prompt complet</span>
            <span class="prompt-toggle__chevron">▼</span>
          </button>
          <div id="${promptId}" class="example-card__prompt hidden">
            <div class="example-card__prompt-header">
              <span class="prompt-header__title">Prompt à copier</span>
              <button class="btn btn--sm btn--copy" onclick="copyExamplePrompt('${promptId}')" title="Copier le prompt">
                <span class="copy-icon">📋</span>
                <span class="copy-text">Copier</span>
              </button>
            </div>
            <pre class="example-card__prompt-code"><code>${escapeHtml(example.prompt)}</code></pre>
          </div>
        </div>
        ` : ''}

        <div class="example-card__tools">
          ${example.tools.map(toolId => {
            const tool = [...state.data.llms, ...state.data.tools].find(t => t.id === toolId);
            return tool ? `<span class="example-card__tool" onclick="openItemModal('${toolId}')">${tool.name}</span>` : '';
          }).join('')}
        </div>
      </div>
    </div>
  `}).join('');
}

// Toggle example prompt visibility
function toggleExamplePrompt(promptId) {
  const promptEl = document.getElementById(promptId);
  const toggleBtn = promptEl?.previousElementSibling;

  if (!promptEl || !toggleBtn) return;

  const isHidden = promptEl.classList.contains('hidden');
  promptEl.classList.toggle('hidden');
  toggleBtn.setAttribute('aria-expanded', isHidden);

  const chevron = toggleBtn.querySelector('.prompt-toggle__chevron');
  const text = toggleBtn.querySelector('.prompt-toggle__text');

  if (chevron) chevron.textContent = isHidden ? '▲' : '▼';
  if (text) text.textContent = isHidden ? 'Masquer le prompt' : 'Voir le prompt complet';
}

// Copy example prompt to clipboard
async function copyExamplePrompt(promptId) {
  const promptEl = document.getElementById(promptId);
  const codeEl = promptEl?.querySelector('code');
  const copyBtn = promptEl?.querySelector('.btn--copy');

  if (!codeEl) return;

  try {
    await navigator.clipboard.writeText(codeEl.textContent);

    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<span class="copy-icon">✅</span><span class="copy-text">Copié!</span>';
      copyBtn.classList.add('btn--success');

      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('btn--success');
      }, 2000);
    }
  } catch (err) {
    console.error('Failed to copy prompt:', err);
  }
}

// Escape HTML for safe display
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

  // Colors for each item in comparison - Phase 1 Critical: Enhanced colors
  const comparisonColors = [
    { primary: '#a855f7', secondary: 'rgba(168, 85, 247, 0.3)', name: 'Violet' },
    { primary: '#3b82f6', secondary: 'rgba(59, 130, 246, 0.3)', name: 'Bleu' },
    { primary: '#22c55e', secondary: 'rgba(34, 197, 94, 0.3)', name: 'Vert' },
    { primary: '#f97316', secondary: 'rgba(249, 115, 22, 0.3)', name: 'Orange' }
  ];

  // Calculate rankings for medals
  const rankings = calculateComparisonRankings(itemsWithScores);

  const modalHTML = `
    <div class="comparator-modal">
      <div class="comparator-header">
        <h2 class="comparator-header__title">⚖️ Comparateur LLMs</h2>
        <div class="comparator-header__actions">
          <button class="modal__close" onclick="closeModal()">&times;</button>
        </div>
      </div>

      <div class="comparator-body">
        <!-- Large Radar Chart Section - 600x600px -->
        <div class="comparator-radar-section">
          <h3 class="comparator-radar-section__title">📊 Graphique de comparaison des competences</h3>
          <div class="comparator-radar-container">
            <canvas id="comparator-radar-canvas" class="comparator-radar-chart"></canvas>
          </div>
          <div class="comparator-legend">
            ${itemsWithScores.map((item, idx) => `
              <div class="comparator-legend__item">
                <span class="comparator-legend__color" style="background: ${comparisonColors[idx].primary}"></span>
                ${item.name}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Detailed Comparison Table with Medals -->
        <div class="comparator-table-section">
          <h3 class="comparator-table-section__title">📋 Tableau comparatif detaille</h3>
          <table class="comparator-table">
            <thead>
              <tr>
                <th>Critere</th>
                ${itemsWithScores.map((item, idx) => `
                  <th>
                    <div class="comparator-table__model-name">
                      <span class="comparator-legend__color" style="background: ${comparisonColors[idx].primary}; width: 12px; height: 12px; border-radius: 50%; display: inline-block;"></span>
                      ${item.name}
                      <span class="comparator-table__provider">(${item.provider})</span>
                    </div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${renderComparisonTableRows(itemsWithScores, rankings, comparisonColors)}
            </tbody>
          </table>
        </div>

        <!-- Recommendations Section -->
        <div class="comparator-recommendations">
          <h3 class="comparator-recommendations__title">🏆 Recommandations</h3>
          <div class="recommendations-grid">
            ${renderComparatorRecommendations(itemsWithScores, rankings)}
          </div>
        </div>

        <!-- Export Options -->
        <div class="comparator-export">
          <button class="btn--export" onclick="exportComparisonCSV()">
            📊 Exporter CSV
          </button>
          <button class="btn--export" onclick="copyComparisonLink()">
            🔗 Copier lien
          </button>
          <button class="btn--export" onclick="exportComparisonPDF()">
            📄 Exporter PDF
          </button>
        </div>
      </div>
    </div>
  `;

  elements.modalContent.innerHTML = modalHTML;
  elements.modalContent.classList.add('comparator-modal');
  elements.modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Initialize Chart.js radar chart
  setTimeout(() => {
    initComparatorRadarChart(itemsWithScores, comparisonColors);
  }, 100);
}

// Phase 1 Critical: Initialize Chart.js Radar Chart (600x600px)
function initComparatorRadarChart(items, colors) {
  const canvas = document.getElementById('comparator-radar-canvas');
  if (!canvas || typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded or canvas not found');
    return;
  }

  // Destroy existing chart if any
  if (state.radarChart) {
    state.radarChart.destroy();
  }

  const competencies = ['reasoning', 'coding', 'math', 'writing', 'multilingual', 'speed'];
  const labels = competencies.map(c => COMPETENCY_LABELS[c]?.name || c);

  const datasets = items.map((item, idx) => {
    const scores = item.scores || {};
    const data = competencies.map(comp => scores[comp] || 0);

    return {
      label: item.name,
      data: data,
      borderColor: colors[idx].primary,
      backgroundColor: colors[idx].secondary,
      borderWidth: 3,
      pointBackgroundColor: colors[idx].primary,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    };
  });

  state.radarChart = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(6, 6, 12, 0.95)',
          titleColor: '#00f5d4',
          bodyColor: '#f0f0f5',
          borderColor: 'rgba(0, 245, 212, 0.3)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}/100`;
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          min: 0,
          ticks: {
            stepSize: 20,
            color: 'rgba(152, 152, 168, 0.8)',
            backdropColor: 'transparent',
            font: { family: "'Space Mono', monospace", size: 10 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)', circular: true },
          pointLabels: {
            color: '#f0f0f5',
            font: { family: "'Syne', sans-serif", size: 14, weight: 600 }
          },
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      },
      animation: { duration: 800, easing: 'easeOutQuart' }
    }
  });
}

// Phase 1 Critical: Calculate rankings for medals
function calculateComparisonRankings(items) {
  const metrics = ['reasoning', 'coding', 'math', 'writing', 'multilingual', 'speed', 'overall', 'price'];
  const rankings = {};

  metrics.forEach(metric => {
    const sorted = [...items].sort((a, b) => {
      if (metric === 'price') {
        return parsePrice(a.specs?.inputPrice) - parsePrice(b.specs?.inputPrice);
      }
      if (metric === 'overall') {
        const avgA = Object.values(a.scores || {}).reduce((sum, v) => sum + v, 0) / Math.max(1, Object.keys(a.scores || {}).length);
        const avgB = Object.values(b.scores || {}).reduce((sum, v) => sum + v, 0) / Math.max(1, Object.keys(b.scores || {}).length);
        return avgB - avgA;
      }
      return (b.scores?.[metric] || 0) - (a.scores?.[metric] || 0);
    });

    rankings[metric] = {};
    sorted.forEach((item, idx) => {
      rankings[metric][item.id] = idx + 1;
    });
  });

  return rankings;
}

// Phase 1 Critical: Render detailed table rows with medals
function renderComparisonTableRows(items, rankings, colors) {
  const rows = [
    { key: 'overall', label: '🎯 Score global', isScore: true },
    { key: 'reasoning', label: '🧠 Raisonnement', isScore: true },
    { key: 'coding', label: '💻 Code', isScore: true },
    { key: 'math', label: '🔢 Mathematiques', isScore: true },
    { key: 'writing', label: '✍️ Redaction', isScore: true },
    { key: 'multilingual', label: '🌍 Multilingue', isScore: true },
    { key: 'speed', label: '⚡ Vitesse', isScore: true },
    { key: 'context', label: '📚 Contexte', isSpec: true, specKey: 'contextWindow' },
    { key: 'inputPrice', label: '💵 Prix Input', isSpec: true, specKey: 'inputPrice' },
    { key: 'outputPrice', label: '💸 Prix Output', isSpec: true, specKey: 'outputPrice' },
    { key: 'tier', label: '⭐ Tier', isTier: true }
  ];

  return rows.map(row => {
    return `<tr>
      <td>${row.label}</td>
      ${items.map((item, idx) => {
        let value = '-';
        let scoreClass = '';
        let medal = '';

        if (row.isScore) {
          if (row.key === 'overall') {
            const scores = Object.values(item.scores || {});
            value = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
          } else {
            value = item.scores?.[row.key] || 0;
          }

          const rank = rankings[row.key]?.[item.id];
          if (rank === 1) medal = '<span class="medal medal--gold">🥇</span>';
          else if (rank === 2) medal = '<span class="medal medal--silver">🥈</span>';
          else if (rank === 3) medal = '<span class="medal medal--bronze">🥉</span>';

          scoreClass = value >= 80 ? 'high' : value >= 60 ? 'medium' : 'low';

          return `<td>
            <div class="score-cell">
              <div class="score-bar">
                <div class="score-bar__fill score-bar__fill--${scoreClass}" style="width: ${value}%"></div>
              </div>
              <span class="score-value">${value}</span>
              ${medal}
            </div>
          </td>`;
        } else if (row.isSpec) {
          value = item.specs?.[row.specKey] || '-';
          const priceRank = rankings.price?.[item.id];
          if (row.specKey === 'inputPrice' && priceRank === 1) {
            medal = '<span class="medal medal--gold">🥇</span>';
          }
          return `<td>${value} ${medal}</td>`;
        } else if (row.isTier) {
          value = getTierLabel(item.tier);
          return `<td><span class="badge badge--${item.tier} badge--sm">${value}</span></td>`;
        }

        return `<td>${value}</td>`;
      }).join('')}
    </tr>`;
  }).join('');
}

// Phase 1 Critical: Render recommendations
function renderComparatorRecommendations(items, rankings) {
  const useCases = [
    { key: 'coding', label: 'Developpement', icon: '💻', reason: 'Meilleur score code' },
    { key: 'reasoning', label: 'Analyse & Raisonnement', icon: '🧠', reason: 'Meilleur raisonnement' },
    { key: 'writing', label: 'Redaction', icon: '✍️', reason: 'Meilleure qualite texte' },
    { key: 'price', label: 'Budget serre', icon: '💰', reason: 'Meilleur rapport Q/P' },
    { key: 'overall', label: 'Usage general', icon: '⭐', reason: 'Meilleur score global' }
  ];

  return useCases.map(useCase => {
    const winnerId = Object.entries(rankings[useCase.key] || {})
      .find(([id, rank]) => rank === 1)?.[0];
    const winner = items.find(item => item.id === winnerId);

    if (!winner) return '';

    return `
      <div class="recommendation-card">
        <div class="recommendation-card__usecase">${useCase.icon} ${useCase.label}</div>
        <div class="recommendation-card__winner">🏆 ${winner.name}</div>
        <p class="recommendation-card__reason">${useCase.reason} parmi les modeles compares</p>
      </div>
    `;
  }).join('');
}

// Phase 1 Critical: Export functions
function exportComparisonCSV() {
  const items = state.comparison.map(id =>
    [...state.data.llms, ...state.data.tools].find(item => item.id === id)
  ).filter(Boolean);

  const headers = ['Modele', 'Provider', 'Tier', 'Contexte', 'Prix Input', 'Prix Output', 'Score Reasoning', 'Score Code', 'Score Math'];
  const rows = items.map(item => {
    const scores = getScoreForLLM(item.id);
    return [
      item.name,
      item.provider,
      item.tier,
      item.specs?.contextWindow || '-',
      item.specs?.inputPrice || '-',
      item.specs?.outputPrice || '-',
      scores?.reasoning || 0,
      scores?.coding || 0,
      scores?.math || 0
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile(csv, 'comparison-llms.csv', 'text/csv');
  showToast('Export CSV telecharge');
}

function copyComparisonLink() {
  const ids = state.comparison.join(',');
  const url = `${window.location.origin}${window.location.pathname}?compare=${ids}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Lien copie dans le presse-papier');
  });
}

function exportComparisonPDF() {
  showToast('Export PDF - Fonctionnalite a venir');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

  // Find similar models (same tier or similar scores)
  const similarModels = isLLM ? findSimilarModels(itemId, 4) : [];

  // Get global score
  const globalScore = scores ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length) : null;

  // Helper function for score level label
  const getScoreLevel = (value) => {
    if (value >= 95) return { label: 'Exceptionnel', class: 'exceptional', icon: '🏆' };
    if (value >= 90) return { label: 'Excellent', class: 'excellent', icon: '💎' };
    if (value >= 80) return { label: 'Très bon', class: 'very-good', icon: '💚' };
    if (value >= 70) return { label: 'Bon', class: 'good', icon: '👍' };
    if (value >= 60) return { label: 'Correct', class: 'average', icon: '📊' };
    return { label: 'À améliorer', class: 'low', icon: '📉' };
  };

  const modalHTML = `
    <div class="modal__header modal__header--enhanced">
      <div class="modal__header-content">
        <div class="modal__header-top">
          <h2 class="modal__title">${item.name}</h2>
          ${globalScore ? `
            <div class="modal__global-score">
              <span class="global-score__value">${globalScore}</span>
              <span class="global-score__label">Score Global</span>
            </div>
          ` : ''}
        </div>
        <p class="modal__subtitle">${item.provider}</p>
        <div class="modal__badges">
          ${badges.length > 0 ? renderBadges(badges, 10) : ''}
          ${item.tier ? `<span class="badge badge--${item.tier}">${getTierLabel(item.tier)}</span>` : ''}
          ${item.apiAvailable ? '<span class="badge badge--api">API Disponible</span>' : ''}
          ${item.isNew ? '<span class="badge badge--new animate-pulse">Nouveau</span>' : ''}
        </div>
      </div>
      <button class="modal__close" onclick="closeModal()" aria-label="Fermer">&times;</button>
    </div>

    <div class="modal__body">
      <!-- Main Content Grid - 2 columns on desktop -->
      <div class="modal__grid modal__grid--enhanced">

        <!-- Left Column: Info & Specs -->
        <div class="modal__column">
          <p class="modal__description">${item.description}</p>

          <!-- SCORES SECTION - Priority 1 -->
          ${isLLM && scores ? `
            <div class="modal__section modal__section--scores">
              <h3 class="modal__section-title">📊 Scores de Performance</h3>
              <div class="scores-enhanced">
                ${Object.entries(scores).map(([key, value]) => {
                  const comp = COMPETENCY_LABELS[key] || { emoji: '📊', name: key };
                  const level = getScoreLevel(value);
                  return `
                    <div class="score-row score-row--enhanced" data-score="${value}">
                      <div class="score-row__header">
                        <span class="score-row__label">${comp.emoji} ${comp.name}</span>
                        <span class="score-row__level score-row__level--${level.class}">${level.icon} ${level.label}</span>
                      </div>
                      <div class="score-row__bar-container">
                        <div class="score-row__bar">
                          <div class="score-row__fill score-row__fill--${level.class} score-row__fill--animated" style="--target-width: ${value}%"></div>
                        </div>
                        <span class="score-row__value">${value}<span class="score-row__max">/100</span></span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- SPECS ACCORDION -->
          ${item.specs ? `
            <div class="modal__section modal__section--accordion">
              <button class="accordion__trigger" onclick="toggleAccordion(this)" aria-expanded="false">
                <h3 class="modal__section-title">📋 Spécifications Techniques</h3>
                <span class="accordion__icon">▼</span>
              </button>
              <div class="accordion__content">
                <div class="specs-categories">
                  <!-- Pricing -->
                  <div class="specs-category">
                    <h4 class="specs-category__title">💰 Tarification</h4>
                    <div class="specs-grid specs-grid--detailed">
                      <div class="spec-item">
                        <span class="spec-item__label">Prix Input</span>
                        <span class="spec-item__value spec-item__value--price">${item.specs.inputPrice || 'N/A'}</span>
                      </div>
                      <div class="spec-item">
                        <span class="spec-item__label">Prix Output</span>
                        <span class="spec-item__value spec-item__value--price">${item.specs.outputPrice || 'N/A'}</span>
                      </div>
                      ${item.specs.cachePrice ? `
                        <div class="spec-item">
                          <span class="spec-item__label">Prix Cache</span>
                          <span class="spec-item__value spec-item__value--price">${item.specs.cachePrice}</span>
                        </div>
                      ` : ''}
                    </div>
                  </div>

                  <!-- Performance -->
                  <div class="specs-category">
                    <h4 class="specs-category__title">⚡ Performance</h4>
                    <div class="specs-grid specs-grid--detailed">
                      <div class="spec-item">
                        <span class="spec-item__label">Fenêtre Contexte</span>
                        <span class="spec-item__value">${item.specs.contextWindow || 'N/A'}</span>
                      </div>
                      <div class="spec-item">
                        <span class="spec-item__label">Vitesse</span>
                        <span class="spec-item__value">${item.specs.speed || 'N/A'}</span>
                      </div>
                      ${item.specs.latency ? `
                        <div class="spec-item">
                          <span class="spec-item__label">Latence</span>
                          <span class="spec-item__value">${item.specs.latency}</span>
                        </div>
                      ` : ''}
                      ${item.specs.rateLimit ? `
                        <div class="spec-item">
                          <span class="spec-item__label">Rate Limit</span>
                          <span class="spec-item__value">${item.specs.rateLimit}</span>
                        </div>
                      ` : ''}
                    </div>
                  </div>

                  <!-- Capabilities -->
                  <div class="specs-category">
                    <h4 class="specs-category__title">🎯 Capacités</h4>
                    <div class="specs-capabilities">
                      <span class="capability-badge ${item.specs.vision ? 'capability-badge--active' : 'capability-badge--inactive'}">
                        👁️ Vision ${item.specs.vision ? '✓' : '✗'}
                      </span>
                      <span class="capability-badge ${item.specs.functionCalling ? 'capability-badge--active' : 'capability-badge--inactive'}">
                        🔧 Function Calling ${item.specs.functionCalling !== false ? '✓' : '✗'}
                      </span>
                      <span class="capability-badge ${item.specs.streaming !== false ? 'capability-badge--active' : 'capability-badge--inactive'}">
                        📡 Streaming ${item.specs.streaming !== false ? '✓' : '✗'}
                      </span>
                      ${item.specs.languages ? `
                        <span class="capability-badge capability-badge--active">
                          🌍 ${item.specs.languages} langues
                        </span>
                      ` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Points Forts / Limites -->
          <div class="modal__section modal__section--split">
            ${item.strengths ? `
              <div class="split-column split-column--strengths">
                <h3 class="modal__section-title">✅ Points Forts</h3>
                <ul class="modal__list modal__list--strengths">
                  ${item.strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${item.weaknesses ? `
              <div class="split-column split-column--weaknesses">
                <h3 class="modal__section-title">⚠️ Limites</h3>
                <ul class="modal__list modal__list--weaknesses">
                  ${item.weaknesses.map(w => `<li>${w}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Right Column: Radar & Context -->
        <div class="modal__column">
          ${isLLM && scores ? `
            <div class="modal__section">
              <h3 class="modal__section-title">🎯 Profil Radar</h3>
              <div class="radar-container radar-container--enhanced">
                ${renderRadarChart(itemId, 280)}
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

          <!-- SIMILAR MODELS SECTION -->
          ${similarModels.length > 0 ? `
            <div class="modal__section modal__section--similar">
              <h3 class="modal__section-title">🔄 Modèles Similaires</h3>
              <div class="similar-models">
                ${similarModels.map(m => {
                  const mScore = getScoreForLLM(m.id);
                  const mAvg = mScore ? Math.round(Object.values(mScore).reduce((a, b) => a + b, 0) / Object.keys(mScore).length) : null;
                  return `
                    <div class="similar-model-card" onclick="openItemModal('${m.id}')">
                      <div class="similar-model__info">
                        <span class="similar-model__name">${m.name}</span>
                        <span class="similar-model__provider">${m.provider}</span>
                      </div>
                      <div class="similar-model__meta">
                        ${mAvg ? `<span class="similar-model__score">${mAvg}/100</span>` : ''}
                        ${m.specs?.inputPrice ? `<span class="similar-model__price">${m.specs.inputPrice}</span>` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- USE CASES SECTION - Enhanced -->
      ${item.useCases ? `
        <div class="modal__section modal__section--full">
          <h3 class="modal__section-title">💼 Cas d'Usage</h3>
          <div class="use-cases-grid use-cases-grid--enhanced">
            ${item.useCases.map((uc, idx) => {
              // Find matching example from data
              const matchingExample = state.data.examples?.find(ex =>
                ex.tools?.includes(itemId) || ex.title?.toLowerCase().includes(uc.toLowerCase().substring(0, 10))
              );
              return `
                <div class="use-case-card use-case-card--enhanced">
                  <div class="use-case-card__header">
                    <span class="use-case-card__icon">💡</span>
                    <span class="use-case-card__title">${uc}</span>
                  </div>
                  ${matchingExample ? `
                    <div class="use-case-card__meta">
                      ${matchingExample.estimatedTime ? `<span class="use-case-card__time">⏱️ ${matchingExample.estimatedTime}</span>` : ''}
                      ${matchingExample.difficulty ? `<span class="use-case-card__difficulty difficulty--${matchingExample.difficulty}">${getDifficultyLabel(matchingExample.difficulty)}</span>` : ''}
                    </div>
                    <button class="btn btn--sm btn--ghost use-case-card__action" onclick="showUseCaseExample('${itemId}', ${idx})">
                      📝 Voir l'exemple
                    </button>
                  ` : ''}
                </div>
              `;
            }).join('')}
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
    </div>

    <!-- ENHANCED FOOTER -->
    <div class="modal__footer modal__footer--enhanced">
      <div class="modal__footer-row modal__footer-row--primary">
        ${item.docUrl ? `
          <a href="${item.docUrl}" target="_blank" rel="noopener" class="btn btn--primary btn--lg">
            📖 Documentation
          </a>
        ` : ''}
        ${item.tryUrl || item.apiUrl ? `
          <a href="${item.tryUrl || item.apiUrl || '#'}" target="_blank" rel="noopener" class="btn btn--accent btn--lg">
            💻 Essayer Maintenant
          </a>
        ` : ''}
      </div>
      <div class="modal__footer-row modal__footer-row--secondary">
        <button class="btn btn--secondary" onclick="toggleComparisonFromModal('${item.id}')">
          ${state.comparison.includes(item.id) ? '✓ Dans Comparateur' : '⚖️ Comparer'}
        </button>
        <button class="btn btn--secondary" onclick="toggleFavoriteFromModal('${item.id}')">
          ${state.favorites.includes(item.id) ? '★ Favori' : '☆ Favoris'}
        </button>
        <button class="btn btn--ghost" onclick="shareItem('${item.id}')">
          🔗 Partager
        </button>
        <button class="btn btn--ghost" onclick="exportItemPDF('${item.id}')">
          📥 Export PDF
        </button>
      </div>
    </div>
  `;

  openModal(modalHTML);

  // Trigger score bar animations after modal is open
  setTimeout(() => {
    document.querySelectorAll('.score-row__fill--animated').forEach(bar => {
      bar.style.width = bar.style.getPropertyValue('--target-width');
    });
  }, 100);
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
// PHASE 4: ENHANCED MODAL HELPERS
// ============================================

/**
 * Find similar models based on tier and scores
 */
function findSimilarModels(itemId, count = 4) {
  const item = state.data.llms.find(l => l.id === itemId);
  if (!item) return [];

  const itemScores = getScoreForLLM(itemId);
  const itemAvg = itemScores ? Object.values(itemScores).reduce((a, b) => a + b, 0) / Object.keys(itemScores).length : 0;

  return state.data.llms
    .filter(l => l.id !== itemId)
    .map(l => {
      const scores = getScoreForLLM(l.id);
      const avg = scores ? Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length : 0;
      const tierMatch = l.tier === item.tier ? 10 : 0;
      const providerMatch = l.provider === item.provider ? 5 : 0;
      const scoreDiff = Math.abs(avg - itemAvg);
      const similarity = 100 - scoreDiff + tierMatch + providerMatch;
      return { ...l, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, count);
}

/**
 * Toggle accordion section
 */
function toggleAccordion(trigger) {
  const content = trigger.nextElementSibling;
  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

  trigger.setAttribute('aria-expanded', !isExpanded);
  content.classList.toggle('accordion__content--open', !isExpanded);
  trigger.querySelector('.accordion__icon').textContent = isExpanded ? '▼' : '▲';
}
window.toggleAccordion = toggleAccordion;

/**
 * Show use case example modal
 */
function showUseCaseExample(itemId, useCaseIndex) {
  const item = [...state.data.llms, ...state.data.tools].find(i => i.id === itemId);
  if (!item || !item.useCases || !item.useCases[useCaseIndex]) return;

  const useCase = item.useCases[useCaseIndex];

  // Find matching example from examples data
  const example = state.data.examples?.find(ex =>
    ex.tools?.includes(itemId) || ex.title?.toLowerCase().includes(useCase.toLowerCase().substring(0, 10))
  );

  const modalHTML = `
    <div class="modal__header">
      <div class="modal__header-content">
        <h2 class="modal__title">💡 ${useCase}</h2>
        <p class="modal__subtitle">${item.name}</p>
      </div>
      <button class="modal__close" onclick="closeModal(); openItemModal('${itemId}')">&times;</button>
    </div>

    <div class="modal__body">
      ${example ? `
        <div class="example-detail">
          <div class="example-detail__section">
            <h3 class="example-detail__title">📋 Scénario</h3>
            <p class="example-detail__content">${example.situation || "Utilisation typique de ce cas d'usage."}</p>
          </div>

          <div class="example-detail__section">
            <h3 class="example-detail__title">💡 Solution</h3>
            <p class="example-detail__content">${example.solution || 'Utiliser ' + item.name + ' pour accomplir cette tâche.'}</p>
          </div>

          ${example.prompt ? `
            <div class="example-detail__section">
              <h3 class="example-detail__title">📝 Prompt Suggéré</h3>
              <div class="example-detail__prompt">
                <pre class="example-detail__code">${escapeHtml(example.prompt)}</pre>
                <button class="btn btn--sm btn--primary" onclick="copyToClipboard(\`${escapeHtml(example.prompt).replace(/`/g, '\\`')}\`)">
                  📋 Copier le prompt
                </button>
              </div>
            </div>
          ` : ''}

          <div class="example-detail__section">
            <h3 class="example-detail__title">✅ Résultat Attendu</h3>
            <p class="example-detail__content">${example.result || 'Tâche accomplie efficacement.'}</p>
          </div>

          <div class="example-detail__metrics">
            ${example.estimatedTime ? `
              <div class="metric-card">
                <span class="metric-card__icon">⏱️</span>
                <span class="metric-card__label">Temps estimé</span>
                <span class="metric-card__value">${example.estimatedTime}</span>
              </div>
            ` : ''}
            ${example.difficulty ? `
              <div class="metric-card">
                <span class="metric-card__icon">📊</span>
                <span class="metric-card__label">Difficulté</span>
                <span class="metric-card__value">${getDifficultyLabel(example.difficulty)}</span>
              </div>
            ` : ''}
            <div class="metric-card">
              <span class="metric-card__icon">🎯</span>
              <span class="metric-card__label">Précision</span>
              <span class="metric-card__value">~95%</span>
            </div>
          </div>
        </div>
      ` : `
        <div class="example-detail">
          <div class="example-detail__section">
            <h3 class="example-detail__title">📋 Description</h3>
            <p class="example-detail__content">Ce cas d'usage implique l'utilisation de ${item.name} pour ${useCase.toLowerCase()}.</p>
          </div>
          <div class="example-detail__section">
            <h3 class="example-detail__title">💡 Comment procéder</h3>
            <p class="example-detail__content">Décrivez clairement votre besoin et fournissez le contexte nécessaire pour obtenir les meilleurs résultats.</p>
          </div>
        </div>
      `}
    </div>

    <div class="modal__footer">
      <button class="btn btn--secondary" onclick="closeModal(); openItemModal('${itemId}')">
        ← Retour aux détails
      </button>
    </div>
  `;

  // Close current modal and open example modal
  closeModal();
  setTimeout(() => openModal(modalHTML), 100);
}
window.showUseCaseExample = showUseCaseExample;

/**
 * Share item via clipboard or native share
 */
function shareItem(itemId) {
  const item = [...state.data.llms, ...state.data.tools].find(i => i.id === itemId);
  if (!item) return;

  const shareText = `🤖 ${item.name} par ${item.provider}\n\n${item.description}\n\n📚 Découvrez plus sur AI Reference Hub`;
  const shareUrl = `${window.location.origin}${window.location.pathname}#${itemId}`;

  if (navigator.share) {
    navigator.share({
      title: `${item.name} - AI Reference Hub`,
      text: shareText,
      url: shareUrl
    }).catch(() => {
      // Fallback to clipboard
      copyToClipboard(shareUrl);
      showToast('Lien copié dans le presse-papiers!');
    });
  } else {
    copyToClipboard(shareUrl);
    showToast('Lien copié dans le presse-papiers!');
  }
}
window.shareItem = shareItem;

/**
 * Export item details as PDF (uses print dialog)
 */
function exportItemPDF(itemId) {
  const item = [...state.data.llms, ...state.data.tools].find(i => i.id === itemId);
  if (!item) return;

  const scores = getScoreForLLM(itemId);

  // Create printable content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${item.name} - AI Reference Hub</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; }
        h1 { color: #0891b2; margin-bottom: 8px; }
        h2 { color: #1a1a2e; border-bottom: 2px solid #0891b2; padding-bottom: 8px; margin-top: 24px; }
        .subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }
        .description { line-height: 1.6; margin-bottom: 24px; }
        .specs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
        .spec-item { background: #f8f9fa; padding: 12px; border-radius: 8px; }
        .spec-label { font-size: 12px; color: #666; display: block; }
        .spec-value { font-weight: 600; font-size: 14px; }
        .scores { margin-bottom: 24px; }
        .score-row { display: flex; align-items: center; margin-bottom: 8px; }
        .score-label { width: 120px; font-size: 14px; }
        .score-bar { flex: 1; height: 16px; background: #e5e7eb; border-radius: 8px; overflow: hidden; margin: 0 12px; }
        .score-fill { height: 100%; background: linear-gradient(90deg, #0891b2, #06b6d4); }
        .score-value { font-weight: 600; min-width: 40px; text-align: right; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; line-height: 1.5; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${item.name}</h1>
      <p class="subtitle">${item.provider} • ${item.tier ? getTierLabel(item.tier) : 'Standard'}</p>
      <p class="description">${item.description}</p>

      ${item.specs ? `
        <h2>📋 Spécifications</h2>
        <div class="specs-grid">
          <div class="spec-item"><span class="spec-label">Contexte</span><span class="spec-value">${item.specs.contextWindow || 'N/A'}</span></div>
          <div class="spec-item"><span class="spec-label">Vitesse</span><span class="spec-value">${item.specs.speed || 'N/A'}</span></div>
          <div class="spec-item"><span class="spec-label">Prix Input</span><span class="spec-value">${item.specs.inputPrice || 'N/A'}</span></div>
          <div class="spec-item"><span class="spec-label">Prix Output</span><span class="spec-value">${item.specs.outputPrice || 'N/A'}</span></div>
        </div>
      ` : ''}

      ${scores ? `
        <h2>📊 Scores</h2>
        <div class="scores">
          ${Object.entries(scores).map(([key, value]) => {
            const comp = COMPETENCY_LABELS[key] || { emoji: '📊', name: key };
            return `
              <div class="score-row">
                <span class="score-label">${comp.emoji} ${comp.name}</span>
                <div class="score-bar"><div class="score-fill" style="width: ${value}%"></div></div>
                <span class="score-value">${value}/100</span>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      ${item.strengths ? `
        <h2>✅ Points Forts</h2>
        <ul>${item.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
      ` : ''}

      ${item.weaknesses ? `
        <h2>⚠️ Limites</h2>
        <ul>${item.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
      ` : ''}

      ${item.useCases ? `
        <h2>💼 Cas d'Usage</h2>
        <ul>${item.useCases.map(uc => `<li>${uc}</li>`).join('')}</ul>
      ` : ''}

      <div class="footer">
        <p>Généré depuis AI Reference Hub - MR Tech Lab</p>
        <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);

  showToast("Fenêtre d'impression ouverte");
}
window.exportItemPDF = exportItemPDF;

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
window.copyToClipboard = copyToClipboard;

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
    debutant: '🟢 Débutant',
    intermediaire: '🟡 Intermédiaire',
    avance: '🟠 Avancé',
    expert: '🔴 Expert'
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

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// PHASE 2: PERFORMANCE OPTIMIZATIONS
// ============================================

// Lazy loading with IntersectionObserver
const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target;

      // Handle lazy images
      if (element.dataset.src) {
        element.src = element.dataset.src;
        element.removeAttribute('data-src');
      }

      // Handle lazy backgrounds
      if (element.dataset.bg) {
        element.style.backgroundImage = `url(${element.dataset.bg})`;
        element.removeAttribute('data-bg');
      }

      // Add loaded class for animations
      element.classList.add('lazy-loaded');
      observer.unobserve(element);
    }
  });
}, {
  rootMargin: '50px 0px',
  threshold: 0.1
});

// Initialize lazy loading for elements
function initLazyLoading() {
  const lazyElements = document.querySelectorAll('[data-src], [data-bg], .lazy-load');
  lazyElements.forEach(el => lazyLoadObserver.observe(el));
}

// Intersection observer for card animations
const cardAnimationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      cardAnimationObserver.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '0px 0px -50px 0px',
  threshold: 0.1
});

// Initialize card animations
function initCardAnimations() {
  const cards = document.querySelectorAll('.item-card, .example-card, .category-card');
  cards.forEach((card, index) => {
    card.style.setProperty('--animation-delay', `${index * 50}ms`);
    cardAnimationObserver.observe(card);
  });
}

// Request animation frame wrapper for smooth updates
function smoothUpdate(callback) {
  return requestAnimationFrame(() => {
    callback();
  });
}

// Batch DOM updates for better performance
const domBatchUpdater = {
  updates: [],
  scheduled: false,

  add(update) {
    this.updates.push(update);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  },

  flush() {
    const fragment = document.createDocumentFragment();
    this.updates.forEach(update => update(fragment));
    this.updates = [];
    this.scheduled = false;
  }
};

// Virtual scroll helper for large lists
class VirtualScroller {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.items = [];
    this.visibleItems = new Map();
    this.scrollTop = 0;
    this.containerHeight = 0;

    this.handleScroll = throttle(this.onScroll.bind(this), 16);
  }

  setItems(items) {
    this.items = items;
    this.container.style.height = `${items.length * this.itemHeight}px`;
    this.containerHeight = this.container.parentElement?.clientHeight || 600;
    this.render();
  }

  onScroll() {
    this.scrollTop = this.container.parentElement?.scrollTop || 0;
    this.render();
  }

  render() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + 2,
      this.items.length
    );

    // Remove items no longer visible
    this.visibleItems.forEach((el, index) => {
      if (index < startIndex || index >= endIndex) {
        el.remove();
        this.visibleItems.delete(index);
      }
    });

    // Add new visible items
    for (let i = startIndex; i < endIndex; i++) {
      if (!this.visibleItems.has(i) && this.items[i]) {
        const el = this.renderItem(this.items[i], i);
        el.style.position = 'absolute';
        el.style.top = `${i * this.itemHeight}px`;
        el.style.width = '100%';
        this.container.appendChild(el);
        this.visibleItems.set(i, el);
      }
    }
  }
}

// Preload critical resources
function preloadCriticalResources() {
  // Preload fonts
  const fonts = [
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap'
  ];

  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = font;
    document.head.appendChild(link);
  });
}

// Cache DOM queries
const domCache = new Map();

function getCachedElement(selector) {
  if (!domCache.has(selector)) {
    domCache.set(selector, document.querySelector(selector));
  }
  return domCache.get(selector);
}

function clearDomCache() {
  domCache.clear();
}

// Memory cleanup
function cleanupMemory() {
  // Clear any large objects from memory
  if (state.radarChart) {
    state.radarChart.destroy();
    state.radarChart = null;
  }

  // Clear DOM cache periodically
  clearDomCache();

  // Force garbage collection hint (if available)
  if (window.gc) {
    window.gc();
  }
}

// Periodic memory cleanup to prevent leaks (every 5 minutes)
let memoryCleanupInterval = null;

function startPeriodicCleanup() {
  if (memoryCleanupInterval) return;
  memoryCleanupInterval = setInterval(() => {
    if (!document.hidden) {
      clearDomCache();
    }
  }, 300000); // 5 minutes
}

function stopPeriodicCleanup() {
  if (memoryCleanupInterval) {
    clearInterval(memoryCleanupInterval);
    memoryCleanupInterval = null;
  }
}

// Initialize performance optimizations
function initPerformanceOptimizations() {
  // Lazy loading
  initLazyLoading();

  // Card animations on scroll
  setTimeout(() => initCardAnimations(), 100);

  // Start periodic memory cleanup
  startPeriodicCleanup();

  // Cleanup and pause animations on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cleanupMemory();
      stopPeriodicCleanup();
      // Pause CSS animations when page is hidden to save CPU/GPU
      document.body.style.setProperty('--animation-play-state', 'paused');
      document.querySelectorAll('.news-ticker__track').forEach(el => {
        el.style.animationPlayState = 'paused';
      });
    } else {
      // Resume animations when page is visible
      startPeriodicCleanup();
      document.body.style.setProperty('--animation-play-state', 'running');
      document.querySelectorAll('.news-ticker__track').forEach(el => {
        el.style.animationPlayState = 'running';
      });
    }
  });

  // Preload resources when idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadCriticalResources);
  } else {
    setTimeout(preloadCriticalResources, 1000);
  }

  console.log('Performance optimizations initialized');
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
// PHASE 3: DATA EXPORT FUNCTIONALITY
// ============================================

// Export all LLMs data to JSON
function exportLLMsToJSON() {
  const data = {
    exportDate: new Date().toISOString(),
    version: '4.3.0',
    totalCount: state.data.llms.length,
    llms: state.data.llms.map(llm => ({
      id: llm.id,
      name: llm.name,
      developer: llm.developer,
      category: llm.categoryId,
      tier: llm.tier,
      pricing: llm.pricing,
      contextWindow: llm.contextWindow,
      releaseDate: llm.releaseDate,
      scores: llm.scores,
      tags: llm.tags,
      docUrl: llm.docUrl
    }))
  };

  downloadFile(
    JSON.stringify(data, null, 2),
    `llms-export-${formatDate(new Date())}.json`,
    'application/json'
  );

  showToast('Export JSON téléchargé!');
}

// Export all tools data to JSON
function exportToolsToJSON() {
  const data = {
    exportDate: new Date().toISOString(),
    version: '4.3.0',
    totalCount: state.data.tools.length,
    tools: state.data.tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      developer: tool.developer,
      category: tool.categoryId,
      tier: tool.tier,
      pricing: tool.pricing,
      tags: tool.tags,
      docUrl: tool.docUrl
    }))
  };

  downloadFile(
    JSON.stringify(data, null, 2),
    `tools-export-${formatDate(new Date())}.json`,
    'application/json'
  );

  showToast('Export JSON téléchargé!');
}

// Export LLMs to CSV
function exportLLMsToCSV() {
  const headers = [
    'ID', 'Nom', 'Developpeur', 'Categorie', 'Tier', 'Prix',
    'Contexte', 'Date Sortie', 'Score Reasoning', 'Score Coding',
    'Score Math', 'Score Writing', 'Score Multilingue', 'Score Vitesse',
    'Tags', 'Documentation'
  ];

  const rows = state.data.llms.map(llm => [
    llm.id,
    llm.name,
    llm.developer || '',
    llm.categoryId || '',
    llm.tier || '',
    llm.pricing || '',
    llm.contextWindow || '',
    llm.releaseDate || '',
    llm.scores?.reasoning || '',
    llm.scores?.coding || '',
    llm.scores?.math || '',
    llm.scores?.writing || '',
    llm.scores?.multilingual || '',
    llm.scores?.speed || '',
    (llm.tags || []).join('; '),
    llm.docUrl || ''
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  downloadFile(
    '\uFEFF' + csv, // BOM for Excel UTF-8 support
    `llms-export-${formatDate(new Date())}.csv`,
    'text/csv;charset=utf-8'
  );

  showToast('Export CSV téléchargé!');
}

// Export tools to CSV
function exportToolsToCSV() {
  const headers = [
    'ID', 'Nom', 'Developpeur', 'Categorie', 'Tier', 'Prix',
    'Tags', 'Documentation'
  ];

  const rows = state.data.tools.map(tool => [
    tool.id,
    tool.name,
    tool.developer || '',
    tool.categoryId || '',
    tool.tier || '',
    tool.pricing || '',
    (tool.tags || []).join('; '),
    tool.docUrl || ''
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  downloadFile(
    '\uFEFF' + csv,
    `tools-export-${formatDate(new Date())}.csv`,
    'text/csv;charset=utf-8'
  );

  showToast('Export CSV téléchargé!');
}

// Export benchmarks to CSV
function exportBenchmarksToCSV() {
  const benchmarks = state.data.benchmarks?.llmScores || [];

  const headers = [
    'ID', 'Reasoning', 'Coding', 'Math', 'Writing', 'Multilingue',
    'Vitesse', 'Contexte', 'Cout', 'Multimodal', 'Instructions',
    'Points forts', 'Meilleur pour'
  ];

  const rows = benchmarks.map(b => [
    b.id,
    b.scores?.reasoning || '',
    b.scores?.coding || '',
    b.scores?.math || '',
    b.scores?.writing || '',
    b.scores?.multilingual || '',
    b.scores?.speed || '',
    b.scores?.context || '',
    b.scores?.cost || '',
    b.scores?.multimodal || '',
    b.scores?.instruction || '',
    (b.highlights || []).join('; '),
    (b.bestFor || []).join('; ')
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  downloadFile(
    '\uFEFF' + csv,
    `benchmarks-export-${formatDate(new Date())}.csv`,
    'text/csv;charset=utf-8'
  );

  showToast('Export Benchmarks CSV téléchargé!');
}

// Export current filtered view
function exportCurrentView() {
  const currentTab = state.currentTab;
  const items = currentTab === 'llms' ? state.data.llms : state.data.tools;
  const filtered = filterItems(items);

  const data = {
    exportDate: new Date().toISOString(),
    type: currentTab,
    filters: {
      category: state.filters.category,
      search: state.searchQuery,
      competencies: state.filters.competencies,
      tiers: state.filters.tiers,
      logic: state.filterLogic
    },
    totalCount: filtered.length,
    items: filtered
  };

  downloadFile(
    JSON.stringify(data, null, 2),
    `${currentTab}-filtered-${formatDate(new Date())}.json`,
    'application/json'
  );

  showToast(`Export de ${filtered.length} éléments téléchargé!`);
}

// Export examples with prompts
function exportExamplesToJSON() {
  const data = {
    exportDate: new Date().toISOString(),
    version: '4.3.0',
    totalCount: state.data.examples.length,
    examples: state.data.examples
  };

  downloadFile(
    JSON.stringify(data, null, 2),
    `examples-prompts-${formatDate(new Date())}.json`,
    'application/json'
  );

  showToast('Export des exemples téléchargé!');
}

// Export quick guide
function exportQuickGuide() {
  const guide = state.data.quickGuide;

  let markdown = '# Guide Rapide IA - AI Reference Hub\n\n';
  markdown += `*Exporté le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;

  markdown += '## Recommandations par Cas d\'Usage\n\n';
  markdown += '| Cas d\'Usage | Recommandation |\n';
  markdown += '|-------------|----------------|\n';
  guide.byUseCase.forEach(item => {
    markdown += `| ${item.useCase} | ${item.recommendation} |\n`;
  });

  markdown += '\n## Stack n8n Recommandé\n\n';
  markdown += '| Composant | Recommandation |\n';
  markdown += '|-----------|----------------|\n';
  guide.n8nStack.forEach(item => {
    markdown += `| ${item.component} | ${item.recommendation} |\n`;
  });

  downloadFile(
    markdown,
    `guide-rapide-${formatDate(new Date())}.md`,
    'text/markdown'
  );

  showToast('Guide rapide exporté en Markdown!');
}

// Generate full report
function generateFullReport() {
  const llmCount = state.data.llms.length;
  const toolsCount = state.data.tools.length;
  const categoriesCount = state.data.categories.length;

  let report = `# Rapport Complet AI Reference Hub\n\n`;
  report += `*Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}*\n\n`;

  report += `## Statistiques Générales\n\n`;
  report += `- **LLMs référencés:** ${llmCount}\n`;
  report += `- **Outils référencés:** ${toolsCount}\n`;
  report += `- **Catégories:** ${categoriesCount}\n\n`;

  report += `## Top 10 LLMs par Score Global\n\n`;
  const topLLMs = [...state.data.llms]
    .map(llm => ({
      ...llm,
      avgScore: llm.scores ?
        Object.values(llm.scores).reduce((a, b) => a + b, 0) / Object.values(llm.scores).length : 0
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);

  report += '| Rang | Nom | Développeur | Score Moyen |\n';
  report += '|------|-----|-------------|-------------|\n';
  topLLMs.forEach((llm, idx) => {
    report += `| ${idx + 1} | ${llm.name} | ${llm.developer || 'N/A'} | ${llm.avgScore.toFixed(1)} |\n`;
  });

  report += `\n## LLMs par Tier\n\n`;
  const byTier = {};
  state.data.llms.forEach(llm => {
    const tier = llm.tier || 'Non classé';
    byTier[tier] = (byTier[tier] || 0) + 1;
  });
  Object.entries(byTier).forEach(([tier, count]) => {
    report += `- **${tier}:** ${count} LLMs\n`;
  });

  report += `\n## Catégories\n\n`;
  state.data.categories.forEach(cat => {
    const llmCount = state.data.llms.filter(l => l.categoryId === cat.id).length;
    const toolCount = state.data.tools.filter(t => t.categoryId === cat.id).length;
    report += `### ${cat.emoji} ${cat.name}\n`;
    report += `${cat.description}\n`;
    report += `- LLMs: ${llmCount} | Outils: ${toolCount}\n\n`;
  });

  downloadFile(
    report,
    `rapport-complet-${formatDate(new Date())}.md`,
    'text/markdown'
  );

  showToast('Rapport complet généré!');
}

// Helper: Format date for filenames
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Show export modal
function showExportModal() {
  const existingModal = document.querySelector('.export-modal-backdrop');
  if (existingModal) existingModal.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop export-modal-backdrop fade-in';
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeExportModal();
  };

  backdrop.innerHTML = `
    <div class="modal export-modal modal-enter" style="max-width: 500px;">
      <div class="modal__header">
        <h2 class="modal__title">📤 Exporter les Données</h2>
        <button class="modal__close" onclick="closeExportModal()" aria-label="Fermer">×</button>
      </div>
      <div class="modal__body" style="padding: var(--space-6);">
        <div class="export-options">
          <h3 style="margin-bottom: var(--space-4); color: var(--text-secondary);">Format JSON</h3>
          <div class="export-buttons" style="display: grid; gap: var(--space-3); margin-bottom: var(--space-6);">
            <button class="btn btn--primary" onclick="exportLLMsToJSON(); closeExportModal();">
              🤖 Exporter tous les LLMs (JSON)
            </button>
            <button class="btn btn--primary" onclick="exportToolsToJSON(); closeExportModal();">
              🛠️ Exporter tous les Outils (JSON)
            </button>
            <button class="btn btn--primary" onclick="exportExamplesToJSON(); closeExportModal();">
              📝 Exporter les Exemples avec Prompts
            </button>
            <button class="btn btn--secondary" onclick="exportCurrentView(); closeExportModal();">
              🔍 Exporter la vue filtrée actuelle
            </button>
          </div>

          <h3 style="margin-bottom: var(--space-4); color: var(--text-secondary);">Format CSV</h3>
          <div class="export-buttons" style="display: grid; gap: var(--space-3); margin-bottom: var(--space-6);">
            <button class="btn btn--outline" onclick="exportLLMsToCSV(); closeExportModal();">
              📊 Exporter LLMs (CSV/Excel)
            </button>
            <button class="btn btn--outline" onclick="exportToolsToCSV(); closeExportModal();">
              📊 Exporter Outils (CSV/Excel)
            </button>
            <button class="btn btn--outline" onclick="exportBenchmarksToCSV(); closeExportModal();">
              📈 Exporter Benchmarks (CSV)
            </button>
          </div>

          <h3 style="margin-bottom: var(--space-4); color: var(--text-secondary);">Rapports</h3>
          <div class="export-buttons" style="display: grid; gap: var(--space-3);">
            <button class="btn btn--ghost" onclick="exportQuickGuide(); closeExportModal();">
              📋 Guide Rapide (Markdown)
            </button>
            <button class="btn btn--ghost" onclick="generateFullReport(); closeExportModal();">
              📄 Rapport Complet (Markdown)
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';
}

function closeExportModal() {
  const modal = document.querySelector('.export-modal-backdrop');
  if (modal) {
    modal.querySelector('.modal').classList.add('modal-exit');
    modal.classList.add('fade-out');
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 200);
  }
}

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
      return renderRankedItemCard(item, index + 1);
    }).join('');

    elements.itemsGrid.innerHTML = html || '<p class="no-results">Aucun résultat</p>';
    elements.resultsCount.textContent = rankedLLMs.length;
  }
}

function renderRankedItemCard(item, rank = null) {
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
                  onclick="event.stopPropagation(); toggleFavorite('${item.id}')"
                  title="${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
            ${isFavorite ? '⭐' : '☆'}
          </button>
          <button class="btn btn--icon ${isInComparison ? 'btn--active' : ''}"
                  onclick="event.stopPropagation(); toggleComparison('${item.id}')"
                  title="${isInComparison ? 'Retirer du comparateur' : 'Ajouter au comparateur'}">
            ⚖️
          </button>
        </div>
      </div>

      <button class="item-card__details-btn" onclick="event.stopPropagation(); openItemModal('${item.id}')">
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

      <div class="settings-section">
        <h3 class="settings-section__title">💾 Données</h3>
        <div class="settings-option">
          <span class="settings-option__label">Préférences sauvegardées</span>
          <div class="settings-option__buttons">
            <button class="btn btn--sm btn--secondary" onclick="savePreferences(); showToast('Préférences sauvegardées');">
              💾 Sauvegarder
            </button>
            <button class="btn btn--sm btn--ghost" onclick="resetPreferences(); closeModal();">
              🔄 Réinitialiser
            </button>
          </div>
        </div>
        <p class="settings-hint">Les préférences sont automatiquement sauvegardées lors de vos actions.</p>
      </div>

      <div class="settings-footer">
        <p>AI Reference Hub v4.3.0 - MR Tech Lab</p>
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
// PHASE 3: USER PREFERENCES PERSISTENCE
// ============================================

const PREFERENCES_KEY = 'ai-hub-user-preferences';
const PREFERENCES_VERSION = '1.0';

/**
 * Save user preferences to localStorage
 */
function savePreferences() {
  const preferences = {
    version: PREFERENCES_VERSION,
    savedAt: new Date().toISOString(),
    theme: state.theme,
    currentTab: state.currentTab,
    filterLogic: state.filterLogic,
    filtersExpanded: state.filtersExpanded,
    filters: {
      competencies: state.filters.competencies,
      tiers: state.filters.tiers,
      difficulties: state.filters.difficulties,
      accessTypes: state.filters.accessTypes,
      contextSizes: state.filters.contextSizes,
      minScore: state.filters.minScore,
      sortBy: state.filters.sortBy
    },
    comparison: state.comparison,
    lastSearch: state.searchQuery
  };

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    console.log('✅ Préférences sauvegardées');
  } catch (error) {
    console.error('❌ Erreur sauvegarde préférences:', error);
  }
}

/**
 * Load user preferences from localStorage
 */
function loadPreferences() {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (!saved) return false;

    const preferences = JSON.parse(saved);

    // Check version compatibility
    if (preferences.version !== PREFERENCES_VERSION) {
      console.log('⚠️ Version des préférences différente, réinitialisation');
      return false;
    }

    // Apply theme
    if (preferences.theme) {
      state.theme = preferences.theme;
      applyTheme(preferences.theme);
    }

    // Apply tab
    if (preferences.currentTab) {
      state.currentTab = preferences.currentTab;
    }

    // Apply filter logic
    if (preferences.filterLogic) {
      state.filterLogic = preferences.filterLogic;
    }

    // Apply filters expanded state
    if (typeof preferences.filtersExpanded === 'boolean') {
      state.filtersExpanded = preferences.filtersExpanded;
    }

    // Apply filters with safe defaults for arrays
    if (preferences.filters) {
      state.filters = {
        ...state.filters,
        ...preferences.filters,
        // Ensure arrays are never undefined
        competencies: Array.isArray(preferences.filters.competencies) ? preferences.filters.competencies : [],
        tiers: Array.isArray(preferences.filters.tiers) ? preferences.filters.tiers : [],
        difficulties: Array.isArray(preferences.filters.difficulties) ? preferences.filters.difficulties : [],
        accessTypes: Array.isArray(preferences.filters.accessTypes) ? preferences.filters.accessTypes : [],
        contextSizes: Array.isArray(preferences.filters.contextSizes) ? preferences.filters.contextSizes : []
      };
    }

    // Apply comparison
    if (preferences.comparison && Array.isArray(preferences.comparison)) {
      state.comparison = preferences.comparison.slice(0, state.maxComparison);
    }

    // Apply last search
    if (preferences.lastSearch) {
      state.searchQuery = preferences.lastSearch;
    }

    console.log('✅ Préférences chargées');
    return true;
  } catch (error) {
    console.error('❌ Erreur chargement préférences:', error);
    return false;
  }
}

/**
 * Reset user preferences
 */
function resetPreferences() {
  try {
    localStorage.removeItem(PREFERENCES_KEY);

    // Reset state to defaults
    state.theme = 'dark';
    state.currentTab = 'llms';
    state.filterLogic = 'and';
    state.filtersExpanded = false;
    state.filters = {
      category: '',
      useCase: '',
      competencies: [],
      tiers: [],
      difficulties: [],
      accessTypes: [],
      contextSizes: [],
      minScore: 0,
      sortBy: ''
    };
    state.comparison = [];
    state.searchQuery = '';

    // Apply defaults
    applyTheme('dark');
    if (elements.search) elements.search.value = '';

    // Update UI
    handleTabChange('llms');
    resetFilters();
    updateComparatorUI();

    showToast('Préférences réinitialisées');
    console.log('✅ Préférences réinitialisées');
  } catch (error) {
    console.error('❌ Erreur réinitialisation préférences:', error);
  }
}

/**
 * Apply loaded preferences to UI
 */
function applyPreferencesToUI() {
  // Apply search
  if (elements.search && state.searchQuery) {
    elements.search.value = state.searchQuery;
  }

  // Apply filter logic buttons
  const andBtn = document.getElementById('filter-logic-and');
  const orBtn = document.getElementById('filter-logic-or');
  if (andBtn && orBtn) {
    andBtn.classList.toggle('active', state.filterLogic === 'and');
    orBtn.classList.toggle('active', state.filterLogic === 'or');
  }

  // Apply filters expanded state
  const filtersPanel = document.getElementById('advanced-filters');
  const toggleBtn = document.getElementById('toggle-filters');
  if (filtersPanel && toggleBtn && state.filtersExpanded) {
    filtersPanel.classList.remove('hidden');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  // Apply competency checkboxes
  state.filters.competencies.forEach(comp => {
    const checkbox = document.querySelector(`input[name="competency"][value="${comp}"]`);
    if (checkbox) checkbox.checked = true;
  });

  // Apply tier checkboxes
  state.filters.tiers.forEach(tier => {
    const checkbox = document.querySelector(`input[name="tier"][value="${tier}"]`);
    if (checkbox) checkbox.checked = true;
  });

  // Apply difficulty checkboxes
  state.filters.difficulties.forEach(diff => {
    const checkbox = document.querySelector(`input[name="difficulty"][value="${diff}"]`);
    if (checkbox) checkbox.checked = true;
  });

  // Apply access type checkboxes
  state.filters.accessTypes.forEach(access => {
    const checkbox = document.querySelector(`input[name="access"][value="${access}"]`);
    if (checkbox) checkbox.checked = true;
  });

  // Apply context size checkboxes
  state.filters.contextSizes.forEach(ctx => {
    const checkbox = document.querySelector(`input[name="context"][value="${ctx}"]`);
    if (checkbox) checkbox.checked = true;
  });

  // Apply score slider
  const scoreSlider = document.getElementById('score-slider');
  const scoreValue = document.getElementById('score-value');
  if (scoreSlider && state.filters.minScore) {
    scoreSlider.value = state.filters.minScore;
    if (scoreValue) scoreValue.textContent = state.filters.minScore;
  }

  // Apply sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect && state.filters.sortBy) {
    sortSelect.value = state.filters.sortBy;
  }

  // Update active filters UI
  updateActiveFiltersUI();
}

/**
 * Auto-save preferences on important state changes (debounced)
 */
const debouncedSavePreferences = debounce(savePreferences, 1000);

/**
 * Attach preference saving to state changes
 */
function attachPreferenceSaving() {
  // Save on tab change by adding listener to nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(debouncedSavePreferences, 100);
    });
  });

  // Save on filter changes
  document.addEventListener('change', (e) => {
    if (e.target.matches('[name="competency"], [name="tier"], [name="difficulty"], [name="access"], [name="context"]')) {
      debouncedSavePreferences();
    }
  });

  // Save on search input
  if (elements.search) {
    elements.search.addEventListener('input', debounce(() => {
      debouncedSavePreferences();
    }, 500));
  }

  // Save on comparison changes
  const originalToggleComparison = window.toggleComparison;
  if (originalToggleComparison) {
    window.toggleComparison = function(id) {
      originalToggleComparison(id);
      debouncedSavePreferences();
    };
  }

  // Save on filter logic change
  const andBtn = document.getElementById('filter-logic-and');
  const orBtn = document.getElementById('filter-logic-or');
  if (andBtn) andBtn.addEventListener('click', () => setTimeout(debouncedSavePreferences, 100));
  if (orBtn) orBtn.addEventListener('click', () => setTimeout(debouncedSavePreferences, 100));

  // Save on filters panel toggle
  const toggleBtn = document.getElementById('toggle-filters');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => setTimeout(debouncedSavePreferences, 100));
  }

  // Save before page unload
  window.addEventListener('beforeunload', savePreferences);
}

// Make preference functions global
window.savePreferences = savePreferences;
window.loadPreferences = loadPreferences;
window.resetPreferences = resetPreferences;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', loadData);
