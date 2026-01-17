// Snail detail page logic

// Check authentication
if (!api.isAuthenticated()) {
  window.location.href = 'index.html';
}

const urlParams = new URLSearchParams(window.location.search);
const snailId = urlParams.get('id');

if (!snailId) {
  window.location.href = 'app.html';
}

const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const snailDetail = document.getElementById('snailDetail');
const snailName = document.getElementById('snailName');
const snailTag = document.getElementById('snailTag');
const snailImages = document.getElementById('snailImages');
const ageValue = document.getElementById('ageValue');
const notesValue = document.getElementById('notesValue');
const sightingsList = document.getElementById('sightingsList');
const noSightings = document.getElementById('noSightings');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const addSightingBtn = document.getElementById('addSightingBtn');
const sightingModal = document.getElementById('sightingModal');
const sightingForm = document.getElementById('sightingForm');
const sightingError = document.getElementById('sightingError');
const sightingImages = document.getElementById('sightingImages');
const sightingImagePreview = document.getElementById('sightingImagePreview');

let currentSnail = null;
let uploadedSightingImages = [];

// Load snail details
async function loadSnail() {
  try {
    loading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    snailDetail.classList.add('hidden');
    
    const data = await api.getSnail(snailId);
    currentSnail = data.snail;
    
    loading.classList.add('hidden');
    snailDetail.classList.remove('hidden');
    
    renderSnail();
  } catch (error) {
    loading.classList.add('hidden');
    errorMessage.textContent = 'Failed to load snail. Please try again.';
    errorMessage.classList.remove('hidden');
    console.error('Error loading snail:', error);
  }
}

// Render snail details
function renderSnail() {
  snailName.textContent = currentSnail.name;
  snailTag.textContent = currentSnail.species_tag;
  editBtn.href = `add-snail.html?id=${snailId}`;
  
  // Render images
  if (currentSnail.images && currentSnail.images.length > 0) {
    snailImages.innerHTML = currentSnail.images.map(img => 
      `<img src="${escapeHtml(img.image_url)}" alt="${escapeHtml(currentSnail.name)}" class="snail-image">`
    ).join('');
  } else {
    snailImages.innerHTML = '<p>No images</p>';
  }
  
  // Render age info
  if (currentSnail.approx_age) {
    ageValue.innerHTML = `
      <strong>${escapeHtml(currentSnail.approx_age)}</strong>
      ${currentSnail.age_confidence ? `<span class="confidence-${escapeHtml(currentSnail.age_confidence)}">(${escapeHtml(currentSnail.age_confidence)} confidence)</span>` : ''}
      ${currentSnail.age_explanation ? `<br><em>${escapeHtml(currentSnail.age_explanation)}</em>` : ''}
    `;
  } else {
    ageValue.textContent = 'Not estimated yet';
  }
  
  // Render notes
  notesValue.textContent = currentSnail.notes || 'No notes';
  
  // Render sightings
  if (currentSnail.sightings && currentSnail.sightings.length > 0) {
    noSightings.classList.add('hidden');
    sightingsList.innerHTML = currentSnail.sightings.map(sighting => {
      const date = new Date(sighting.timestamp);
      const formattedDate = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
      
      const imagesHtml = sighting.images && sighting.images.length > 0
        ? `<div class="sighting-images">
            ${sighting.images.map(img => 
              `<img src="${escapeHtml(img.thumbnail_url || img.image_url)}" alt="Sighting" class="sighting-image">`
            ).join('')}
           </div>`
        : '';
      
      return `
        <div class="sighting-item">
          <div class="sighting-header">
            <span class="sighting-location">📍 ${escapeHtml(sighting.garden_location)}</span>
            <span class="sighting-date">${formattedDate}</span>
          </div>
          ${sighting.notes ? `<p>${escapeHtml(sighting.notes)}</p>` : ''}
          ${imagesHtml}
        </div>
      `;
    }).join('');
  } else {
    noSightings.classList.remove('hidden');
    sightingsList.innerHTML = '';
  }
}

// Delete snail
deleteBtn.addEventListener('click', async () => {
  if (!confirm(`Are you sure you want to delete ${currentSnail.name}? This will also delete all sightings.`)) {
    return;
  }
  
  try {
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting...';
    
    await api.deleteSnail(snailId);
    window.location.href = 'app.html';
  } catch (error) {
    alert('Failed to delete snail. Please try again.');
    deleteBtn.disabled = false;
    deleteBtn.textContent = 'Delete';
    console.error('Error deleting snail:', error);
  }
});

// Add sighting modal
addSightingBtn.addEventListener('click', () => {
  sightingModal.classList.add('active');
  uploadedSightingImages = [];
  sightingImagePreview.innerHTML = '';
  sightingForm.reset();
});

function closeSightingModal() {
  sightingModal.classList.remove('active');
}

// Handle sighting image upload
sightingImages.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  
  for (const file of files) {
    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        div.innerHTML = `
          <img src="${e.target.result}" class="image-preview-img">
        `;
        sightingImagePreview.appendChild(div);
      };
      reader.readAsDataURL(file);
      
      // Upload to server
      const result = await api.uploadImage(file);
      uploadedSightingImages.push(result);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }
  
  // Clear file input
  sightingImages.value = '';
});

// Submit sighting
sightingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const location = document.getElementById('location').value;
  const notes = document.getElementById('sightingNotes').value;
  
  try {
    sightingError.classList.add('hidden');
    
    await api.createSighting(snailId, {
      garden_location: location,
      notes,
      images: uploadedSightingImages
    });
    
    closeSightingModal();
    loadSnail(); // Reload to show new sighting
  } catch (error) {
    sightingError.textContent = 'Failed to add sighting. Please try again.';
    sightingError.classList.remove('hidden');
    console.error('Error adding sighting:', error);
  }
});

// Initial load
loadSnail();
