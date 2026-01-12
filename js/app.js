/**
 * AI Reference Hub - Main Application
 * Version: 2.0.0
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
    difficulty: ''
  },
  comparison: [],
  maxComparison: 3,
  favorites: JSON.parse(localStorage.getItem('ai-hub-favorites') || '[]')
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
  categoriesGrid: document.getElementById('categories-grid'),
  itemsSection: document.getElementById('items-section'),
  itemsGrid: document.getElementById('items-grid'),
  itemsSectionTitle: document.getElementById('items-section-title'),
  examplesGrid: document.getElementById('examples-grid'),
  quickGuideList: document.getElementById('quick-guide-list'),
  quickGuideStack: document.getElementById('quick-guide-stack'),
  comparatorBtn: document.getElementById('comparator-btn'),
  comparatorCount: document.getElementById('comparator-count'),
  modalOverlay: document.getElementById('modal-overlay'),
  modalContent: document.getElementById('modal-content')
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
  updateCounts();
  populateFilters();
  renderCategories();
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

  renderCategories();
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

  if (state.currentCategory) {
    renderItems();
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

  return `
    <div class="item-card" data-id="${item.id}">
      <div class="item-card__header">
        <div class="item-card__info">
          <h3 class="item-card__name">
            ${item.name}
            ${item.isNew ? '<span class="item-card__new-badge">NEW</span>' : ''}
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

      <div class="item-card__badges">
        ${item.tier ? `<span class="badge badge--${item.tier}">${getTierLabel(item.tier)}</span>` : ''}
        ${item.apiAvailable !== undefined ?
          `<span class="badge badge--${item.apiAvailable ? 'api' : 'no-api'}">${item.apiAvailable ? 'API' : 'No API'}</span>`
          : ''}
        ${item.difficulty ? `<span class="badge badge--difficulty-${item.difficulty}">${getDifficultyLabel(item.difficulty)}</span>` : ''}
      </div>

      <p class="item-card__description">${item.description}</p>

      <div class="item-card__tags">
        ${item.tags.slice(0, 5).map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>

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

  // Show examples for current category or all if none selected
  const examples = state.currentCategory
    ? state.data.examples.filter(ex => ex.categoryId === state.currentCategory)
    : state.data.examples.slice(0, 6);

  elements.examplesGrid.innerHTML = examples.map(example => `
    <div class="example-card">
      <div class="example-card__header">
        <div class="example-card__icon">💡</div>
        <h4 class="example-card__title">${example.title}</h4>
      </div>
      <div class="example-card__content">
        <div class="example-card__step">
          <div class="example-card__step-label example-card__step-label--situation">Situation</div>
          <p class="example-card__step-text">${example.situation}</p>
        </div>
        <div class="example-card__step">
          <div class="example-card__step-label example-card__step-label--solution">Solution</div>
          <p class="example-card__step-text">${example.solution}</p>
        </div>
        <div class="example-card__step">
          <div class="example-card__step-label example-card__step-label--result">Resultat</div>
          <p class="example-card__step-text">${example.result}</p>
        </div>
        <div class="example-card__tools">
          ${example.tools.map(toolId => {
            const tool = [...state.data.llms, ...state.data.tools].find(t => t.id === toolId);
            return tool ? `<span class="example-card__tool">${tool.name}</span>` : '';
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

  const modalHTML = `
    <div class="modal__header">
      <h2 class="modal__title">Comparateur</h2>
      <button class="modal__close" onclick="closeModal()">&times;</button>
    </div>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Caracteristique</th>
          ${items.map(item => `<th>${item.name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Provider</td>
          ${items.map(item => `<td>${item.provider}</td>`).join('')}
        </tr>
        <tr>
          <td>Tier</td>
          ${items.map(item => `<td>${getTierLabel(item.tier) || '-'}</td>`).join('')}
        </tr>
        ${items[0]?.specs ? `
          <tr>
            <td>Contexte</td>
            ${items.map(item => `<td>${item.specs?.contextWindow || '-'}</td>`).join('')}
          </tr>
          <tr>
            <td>Vitesse</td>
            ${items.map(item => `<td>${item.specs?.speed || '-'}</td>`).join('')}
          </tr>
          <tr>
            <td>Prix Input</td>
            ${items.map(item => `<td>${item.specs?.inputPrice || '-'}</td>`).join('')}
          </tr>
          <tr>
            <td>Prix Output</td>
            ${items.map(item => `<td>${item.specs?.outputPrice || '-'}</td>`).join('')}
          </tr>
        ` : ''}
        <tr>
          <td>API</td>
          ${items.map(item => `<td>${item.apiAvailable ? '✓' : '✗'}</td>`).join('')}
        </tr>
        <tr>
          <td>Difficulte</td>
          ${items.map(item => `<td>${getDifficultyLabel(item.difficulty) || '-'}</td>`).join('')}
        </tr>
        <tr>
          <td></td>
          ${items.map(item => `
            <td>
              <button class="comparison-table__remove" onclick="removeFromComparison('${item.id}')">&times;</button>
            </td>
          `).join('')}
        </tr>
      </tbody>
    </table>
    <div style="margin-top: var(--space-lg); text-align: center;">
      <button class="btn btn--secondary" onclick="exportComparison()">📥 Exporter en PDF</button>
    </div>
  `;

  openModal(modalHTML);
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
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', loadData);
