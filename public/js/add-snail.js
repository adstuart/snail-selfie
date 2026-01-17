// Add/Edit snail page logic

// Check authentication
if (!api.isAuthenticated()) {
  window.location.href = 'index.html';
}

const urlParams = new URLSearchParams(window.location.search);
const snailId = urlParams.get('id');
const isEditMode = !!snailId;

const pageTitle = document.getElementById('pageTitle');
const snailForm = document.getElementById('snailForm');
const nameInput = document.getElementById('name');
const speciesInput = document.getElementById('species');
const notesInput = document.getElementById('notes');
const imagesInput = document.getElementById('images');
const imagePreview = document.getElementById('imagePreview');
const estimateAgeBtn = document.getElementById('estimateAgeBtn');
const ageResult = document.getElementById('ageResult');
const ageLabelSelect = document.getElementById('ageLabel');
const ageExplanationInput = document.getElementById('ageExplanation');
const ageConfidenceSelect = document.getElementById('ageConfidence');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const saveBtn = document.getElementById('saveBtn');
const aiAnalysisLoading = document.getElementById('aiAnalysisLoading');
const possibleMatches = document.getElementById('possibleMatches');
const matchesList = document.getElementById('matchesList');
const dismissMatches = document.getElementById('dismissMatches');

let uploadedImages = [];
let currentMatches = [];

// Set page title
if (isEditMode) {
  pageTitle.textContent = 'Edit Snail';
  loadSnail();
}

let existingImages = [];

// Load existing snail for editing
async function loadSnail() {
  try {
    const data = await api.getSnail(snailId);
    const snail = data.snail;
    
    nameInput.value = snail.name;
    speciesInput.value = snail.species_tag;
    notesInput.value = snail.notes || '';
    
    if (snail.approx_age) {
      ageLabelSelect.value = snail.approx_age;
      ageExplanationInput.value = snail.age_explanation || '';
      ageConfidenceSelect.value = snail.age_confidence || '';
      ageResult.classList.remove('hidden');
    }
    
    // Show existing images (but don't add to uploadedImages as they're already saved)
    if (snail.images && snail.images.length > 0) {
      existingImages = snail.images;
      imagePreview.innerHTML = snail.images.map(img => `
        <div class="image-preview-item">
          <img src="${escapeHtml(img.thumbnail_url || img.image_url)}" class="image-preview-img">
        </div>
      `).join('');
      estimateAgeBtn.disabled = false;
    }
  } catch (error) {
    errorMessage.textContent = 'Failed to load snail. Please try again.';
    errorMessage.classList.remove('hidden');
    console.error('Error loading snail:', error);
  }
}

// Handle image upload
imagesInput.addEventListener('change', async (e) => {
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
          <button type="button" class="image-preview-remove" onclick="removeImage(${uploadedImages.length})">×</button>
        `;
        imagePreview.appendChild(div);
      };
      reader.readAsDataURL(file);
      
      // Upload to server
      const result = await api.uploadImage(file);
      uploadedImages.push(result);
      
      // Enable age estimation button
      estimateAgeBtn.disabled = false;
      
      // Auto-analyze the first uploaded image
      if (uploadedImages.length === 1 && !isEditMode) {
        await autoAnalyzeSnail(result.url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }
  
  // Clear file input
  imagesInput.value = '';
});

// Remove image
window.removeImage = function(index) {
  uploadedImages.splice(index, 1);
  renderImagePreviews();
  
  if (uploadedImages.length === 0 && !isEditMode) {
    estimateAgeBtn.disabled = true;
  }
};

function renderImagePreviews() {
  imagePreview.innerHTML = uploadedImages.map((img, index) => `
    <div class="image-preview-item">
      <img src="${escapeHtml(img.thumbnail_url || img.url)}" class="image-preview-img">
      <button type="button" class="image-preview-remove" onclick="removeImage(${index})">×</button>
    </div>
  `).join('');
}

// Auto-analyze snail after image upload
async function autoAnalyzeSnail(imageUrl) {
  try {
    // Show loading state
    aiAnalysisLoading.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    possibleMatches.classList.add('hidden');
    
    // Call the analyze API
    const result = await api.analyzeSnail(imageUrl);
    
    // Auto-fill species field
    if (result.species) {
      speciesInput.value = result.species;
    }
    
    // Auto-fill age fields
    if (result.age) {
      ageLabelSelect.value = result.age.label;
      ageExplanationInput.value = result.age.explanation;
      ageConfidenceSelect.value = result.age.confidence;
      ageResult.classList.remove('hidden');
    }
    
    // Show matches if found
    if (result.matches && result.matches.length > 0) {
      currentMatches = result.matches;
      displayMatches(result.matches);
    }
    
    // Hide loading state
    aiAnalysisLoading.classList.add('hidden');
    
    // Show success message
    successMessage.textContent = '✅ AI analysis complete! Species and age auto-filled.';
    successMessage.classList.remove('hidden');
    
  } catch (error) {
    console.error('Error analyzing snail:', error);
    aiAnalysisLoading.classList.add('hidden');
    errorMessage.textContent = 'AI analysis failed. You can still manually fill in the details.';
    errorMessage.classList.remove('hidden');
  }
}

// Display possible matches
function displayMatches(matches) {
  matchesList.innerHTML = matches.map(match => `
    <div class="match-item" onclick="viewSnail('${escapeHtml(match.snail_id)}')">
      <img src="${escapeHtml(match.thumbnail_url)}" class="match-thumbnail" alt="${escapeHtml(match.snail_name)}">
      <div class="match-info">
        <strong>${escapeHtml(match.snail_name)}</strong>
        <div style="font-size: 0.9rem; color: #666;">${escapeHtml(match.species_tag || 'Garden snail')}</div>
        <div class="match-confidence confidence-${match.confidence >= 80 ? 'high' : match.confidence >= 60 ? 'medium' : 'low'}">
          ${match.confidence}% match
        </div>
      </div>
      <button type="button" class="btn-small" onclick="event.stopPropagation(); viewSnail('${escapeHtml(match.snail_id)}')">View</button>
    </div>
  `).join('');
  
  possibleMatches.classList.remove('hidden');
}

// View existing snail
window.viewSnail = function(snailId) {
  window.location.href = `snail.html?id=${snailId}`;
};

// Dismiss matches
dismissMatches.addEventListener('click', () => {
  possibleMatches.classList.add('hidden');
  currentMatches = [];
});

// Estimate age
estimateAgeBtn.addEventListener('click', async () => {
  // Use uploaded images first, fall back to existing images in edit mode
  const imagesToUse = uploadedImages.length > 0 ? uploadedImages : existingImages;
  
  if (imagesToUse.length === 0) {
    alert('Please upload at least one image first.');
    return;
  }
  
  try {
    estimateAgeBtn.disabled = true;
    estimateAgeBtn.textContent = 'AI is thinking...';
    errorMessage.classList.add('hidden');
    
    const imageUrl = imagesToUse[0].url || imagesToUse[0].image_url;
    const result = await api.estimateAge(imageUrl);
    
    ageLabelSelect.value = result.approxAgeLabel;
    ageExplanationInput.value = result.explanation;
    ageConfidenceSelect.value = result.confidence;
    
    ageResult.classList.remove('hidden');
    
    successMessage.textContent = 'Age estimated! You can edit the values if needed.';
    successMessage.classList.remove('hidden');
    
    estimateAgeBtn.disabled = false;
    estimateAgeBtn.textContent = 'Estimate Age';
  } catch (error) {
    errorMessage.textContent = 'Failed to estimate age. Please try again.';
    errorMessage.classList.remove('hidden');
    estimateAgeBtn.disabled = false;
    estimateAgeBtn.textContent = 'Estimate Age';
    console.error('Error estimating age:', error);
  }
});

// Submit form
snailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = nameInput.value.trim();
  const species = speciesInput.value.trim();
  const notes = notesInput.value.trim();
  const approxAge = ageLabelSelect.value;
  const ageExplanation = ageExplanationInput.value.trim();
  const ageConfidence = ageConfidenceSelect.value;
  
  if (!name) {
    errorMessage.textContent = 'Name is required.';
    errorMessage.classList.remove('hidden');
    return;
  }
  
  if (!isEditMode && uploadedImages.length === 0) {
    errorMessage.textContent = 'At least one image is required.';
    errorMessage.classList.remove('hidden');
    return;
  }
  
  try {
    saveBtn.disabled = true;
    saveBtn.textContent = isEditMode ? 'Updating...' : 'Creating...';
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    
    const data = {
      name,
      species_tag: species,
      notes,
      approx_age: approxAge || null,
      age_explanation: ageExplanation || null,
      age_confidence: ageConfidence || null
    };
    
    if (isEditMode) {
      await api.updateSnail(snailId, data);
      window.location.href = `snail.html?id=${snailId}`;
    } else {
      data.images = uploadedImages;
      const result = await api.createSnail(data);
      window.location.href = `snail.html?id=${result.snail.id}`;
    }
  } catch (error) {
    errorMessage.textContent = `Failed to ${isEditMode ? 'update' : 'create'} snail. Please try again.`;
    errorMessage.classList.remove('hidden');
    saveBtn.disabled = false;
    saveBtn.textContent = isEditMode ? 'Update Snail' : 'Save Snail';
    console.error('Error saving snail:', error);
  }
});
