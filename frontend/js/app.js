// Main app logic for snail list

// Check authentication
if (!api.isAuthenticated()) {
  window.location.href = 'index.html';
}

const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const snailGrid = document.getElementById('snailGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const logoutBtn = document.getElementById('logoutBtn');

let snails = [];

// Load snails
async function loadSnails() {
  try {
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    snailGrid.innerHTML = '';
    
    const search = searchInput.value;
    const sortBy = sortSelect.value;
    
    const data = await api.getSnails(search, sortBy);
    snails = data.snails;
    
    loading.classList.add('hidden');
    
    if (snails.length === 0) {
      emptyState.classList.remove('hidden');
      snailGrid.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      snailGrid.classList.remove('hidden');
      renderSnails();
    }
  } catch (error) {
    loading.classList.add('hidden');
    errorMessage.textContent = 'Failed to load snails. Please try again.';
    errorMessage.classList.remove('hidden');
    console.error('Error loading snails:', error);
  }
}

// Render snails
function renderSnails() {
  snailGrid.innerHTML = snails.map(snail => {
    const lastSeen = snail.last_seen 
      ? new Date(snail.last_seen).toLocaleDateString()
      : 'Never seen';
    
    const imageUrl = snail.primary_image || 'https://via.placeholder.com/300x200?text=No+Image';
    
    return `
      <div class="snail-card" onclick="window.location.href='snail.html?id=${encodeURIComponent(snail.id)}'">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(snail.name)}" class="snail-card-image">
        <div class="snail-card-content">
          <h3>${escapeHtml(snail.name)}</h3>
          <span class="snail-tag">${escapeHtml(snail.species_tag)}</span>
          <div class="snail-meta">
            <div>📍 Last seen: ${lastSeen}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Event listeners
searchInput.addEventListener('input', debounce(loadSnails, 500));
sortSelect.addEventListener('change', loadSnails);
logoutBtn.addEventListener('click', () => api.logout());

// Debounce function
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

// Initial load
loadSnails();
