// ═══════════════════════════════════════════════════════════
// VO FORCE (VOF) — MAIN JAVASCRIPT
// ═══════════════════════════════════════════════════════════

// ── MOBILE DETECTION ──
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function getViewportWidth() {
  return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
}

// ── MOBILE MENU TOGGLE ──
function toggleMobMenu() {
  const mobMenu = document.getElementById('mobMenu');
  mobMenu?.classList.toggle('open');
  
  // Prevent body scroll when mobile menu is open
  document.body.style.overflow = mobMenu?.classList.contains('open') ? 'hidden' : 'auto';
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', function() {
  const mobMenuLinks = document.querySelectorAll('.mob-menu a');
  mobMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMobMenu();
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    const mobMenu = document.getElementById('mobMenu');
    const nav = document.querySelector('nav');
    
    if (mobMenu?.classList.contains('open') && 
        !mobMenu.contains(event.target) && 
        !nav.contains(event.target)) {
      toggleMobMenu();
    }
  });

  // Close mobile menu on window resize
  window.addEventListener('resize', () => {
    if (getViewportWidth() > 768 && document.getElementById('mobMenu')?.classList.contains('open')) {
      toggleMobMenu();
    }
  });

  // Set active nav link
  updateActiveNavLink();

  // Load artists on gallery page
  if (document.getElementById('artistsGrid')) {
    loadAndDisplayArtists();
  }

  // Setup search and filter
  setupSearchAndFilter();
});


// ── UPDATE ACTIVE NAV LINK ──
function updateActiveNavLink() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    if (
      (path.includes(href) && href !== '#') ||
      (path.endsWith('/') && href === 'index.html') ||
      (path.includes('index.html') && href === 'index.html')
    ) {
      link.classList.add('active');
    }
  });
}

// ── LOAD ARTISTS FROM JSON ──
async function loadArtists() {
  try {
    const response = await fetch('./data/artists.json');
    const data = await response.json();
    return data.artists;
  } catch (error) {
    console.error('Error loading artists:', error);
    return [];
  }
}

// ── LOAD AND DISPLAY ARTISTS ──
async function loadAndDisplayArtists() {
  const artists = await loadArtists();
  const artistsGrid = document.getElementById('artistsGrid');
  
  if (!artistsGrid) return;
  
  artistsGrid.innerHTML = artists.map(artist => `
    <div class="artist-card">
      <div class="artist-image">
        <img src="${artist.picture}" alt="${artist.name}" onerror="this.style.display='none'">
      </div>
      <div class="artist-info">
        <h3>${artist.name}</h3>
        <div class="artist-niche">
          ${artist.niche.map(n => `<span class="niche-tag">${n}</span>`).join('')}
        </div>
        <p><strong>Experience:</strong> ${artist.experience}</p>
        <div class="artist-contact">
          <a href="mailto:${artist.email}" title="Email">📧</a>
          <a href="tel:${artist.phone.replace(/\s/g, '')}" title="Call">📱</a>
          ${artist.website && artist.website !== '#' ? `<a href="${artist.website}" target="_blank" title="Website">🌐</a>` : ''}
        </div>
        <a href="artist-profile.html?id=${artist.id}" class="view-profile">View Profile</a>
      </div>
    </div>
  `).join('');
}

// ── SETUP SEARCH AND FILTER ──
function setupSearchAndFilter() {
  const searchInput = document.getElementById('searchInput');
  const nicheFilter = document.getElementById('nicheFilter');
  const experienceFilter = document.getElementById('experienceFilter');

  if (searchInput) {
    searchInput.addEventListener('input', filterArtists);
  }
  if (nicheFilter) {
    nicheFilter.addEventListener('change', filterArtists);
  }
  if (experienceFilter) {
    experienceFilter.addEventListener('change', filterArtists);
  }
}

// ── FILTER ARTISTS ──
async function filterArtists() {
  const artists = await loadArtists();
  const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const nicheFilter = document.getElementById('nicheFilter')?.value || '';
  const experienceFilter = document.getElementById('experienceFilter')?.value || '';

  const filtered = artists.filter(artist => {
    const matchesSearch = 
      artist.name.toLowerCase().includes(searchInput) ||
      artist.shortBio.toLowerCase().includes(searchInput);
    
    const matchesNiche = !nicheFilter || artist.niche.includes(nicheFilter);
    const matchesExperience = !experienceFilter || artist.experience === experienceFilter;

    return matchesSearch && matchesNiche && matchesExperience;
  });

  const artistsGrid = document.getElementById('artistsGrid');
  
  if (filtered.length === 0) {
    artistsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #777;"><h3>No artists found matching your criteria</h3></div>';
    return;
  }

  artistsGrid.innerHTML = filtered.map(artist => `
    <div class="artist-card">
      <div class="artist-image">
        <img src="${artist.picture}" alt="${artist.name}" onerror="this.style.display='none'">
      </div>
      <div class="artist-info">
        <h3>${artist.name}</h3>
        <div class="artist-niche">
          ${artist.niche.map(n => `<span class="niche-tag">${n}</span>`).join('')}
        </div>
        <p><strong>Experience:</strong> ${artist.experience}</p>
        <div class="artist-contact">
          <a href="mailto:${artist.email}" title="Email">📧</a>
          <a href="tel:${artist.phone.replace(/\s/g, '')}" title="Call">📱</a>
          ${artist.website && artist.website !== '#' ? `<a href="${artist.website}" target="_blank" title="Website">🌐</a>` : ''}
        </div>
        <a href="artist-profile.html?id=${artist.id}" class="view-profile">View Profile</a>
      </div>
    </div>
  `).join('');
}

// ── GET URL PARAMETERS ──
function getUrlParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ── LOAD ARTIST PROFILE ──
async function loadArtistProfile() {
  const artistId = getUrlParameter('id');
  
  if (!artistId) {
    document.body.innerHTML = '<div style="text-align: center; padding: 100px;"><h1>Artist not found</h1></div>';
    return;
  }

  const artists = await loadArtists();
  const artist = artists.find(a => a.id == artistId);

  if (!artist) {
    document.body.innerHTML = '<div style="text-align: center; padding: 100px;"><h1>Artist not found</h1></div>';
    return;
  }

  // Update page title
  document.title = `${artist.name} - VO FORCE (VOF)`;

  // Fill in profile data
  const profileHero = document.querySelector('.profile-hero');
  const profileImage = profileHero?.querySelector('.profile-image');
  const profileDetails = profileHero?.querySelector('.profile-details');

  if (profileImage) {
    profileImage.innerHTML = `<img src="${artist.picture}" alt="${artist.name}" onerror="this.style.display='none'">`;
  }

  if (profileDetails) {
    profileDetails.innerHTML = `
      <h2>${artist.name}</h2>
      <p>${artist.shortBio}</p>
      
      <div class="profile-meta">
        <div class="meta-item">
          <strong>Experience Level</strong>
          <span>${artist.experience}</span>
        </div>
        <div class="meta-item">
          <strong>Years In Industry</strong>
          <span>${artist.yearsInIndustry} years</span>
        </div>
        <div class="meta-item">
          <strong>Languages</strong>
          <span>${artist.languages.join(', ')}</span>
        </div>
        <div class="meta-item">
          <strong>Rates</strong>
          <span>${artist.rates}</span>
        </div>
      </div>

      <div>
        <strong style="display: block; margin-bottom: 12px;">Specializations:</strong>
        <div class="profile-tags">
          ${artist.specializations.map(s => `<span class="niche-tag">${s}</span>`).join('')}
        </div>
      </div>

      <div>
        <strong style="display: block; margin-bottom: 12px; margin-top: 30px;">Niches:</strong>
        <div class="profile-tags">
          ${artist.niche.map(n => `<span class="niche-tag">${n}</span>`).join('')}
        </div>
      </div>

      <strong style="display: block; margin-top: 20px; margin-bottom: 12px;">Strengths:</strong>
      <ul style="margin-left: 20px;">
        ${artist.strengths.map(s => `<li>${s}</li>`).join('')}
      </ul>

      <div class="profile-links" style="margin-top: 30px;">
        <a href="mailto:${artist.email}" class="btn">📧 Email</a>
        <a href="tel:${artist.phone.replace(/\s/g, '')}" class="btn">📱 Call</a>
        ${artist.website && artist.website !== '#' ? `<a href="${artist.website}" target="_blank" class="btn">🌐 Website</a>` : ''}
      </div>
    `;
  }

  // Update demo section
  const demoEmbed = document.querySelector('.demo-embed');
  if (demoEmbed) {
    // Check if it's a Google Drive link
    if (artist.demoLink.includes('drive.google.com')) {
      const googleDriveId = extractGoogleDriveId(artist.demoLink);
      
      demoEmbed.innerHTML = `
        <div style="background: var(--off-white); padding: 20px; border-radius: 8px;">
          <h4 style="margin-bottom: 15px; color: var(--primary-red); text-align: center;">🎤 Voice Demo</h4>
          <iframe src="https://drive.google.com/file/d/${googleDriveId}/preview" 
            width="100%" height="100" style="border: none; border-radius: 4px;"></iframe>
          <p style="margin-top: 15px; color: var(--text-muted); font-size: 0.9rem; text-align: center;">Listen to ${artist.name}'s voiceover demo</p>
        </div>
      `;
    } 
    // Otherwise treat as YouTube link
    else {
      demoEmbed.innerHTML = `
        <iframe width="100%" height="400" src="https://www.youtube.com/embed/${extractYoutubeId(artist.demoLink)}" 
          title="${artist.name} - Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen></iframe>
      `;
    }
  }
}

// ── EXTRACT GOOGLE DRIVE ID ──
function extractGoogleDriveId(url) {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// ── EXTRACT YOUTUBE VIDEO ID ──
function extractYoutubeId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : 'placeholder';
}

// ── LOAD PROFILE ON PAGE LOAD ──
if (window.location.pathname.includes('artist-profile.html')) {
  document.addEventListener('DOMContentLoaded', loadArtistProfile);
}

// ── POPULATE FILTER DROPDOWNS ──
async function populateFilters() {
  const artists = await loadArtists();
  
  // Get unique niches
  const niches = [...new Set(artists.flatMap(a => a.niche))];
  const nicheFilter = document.getElementById('nicheFilter');
  
  if (nicheFilter) {
    nicheFilter.innerHTML = '<option value="">All Niches</option>' + 
      niches.map(n => `<option value="${n}">${n}</option>`).join('');
  }

  // Get unique experience levels
  const experiences = [...new Set(artists.map(a => a.experience))];
  const experienceFilter = document.getElementById('experienceFilter');
  
  if (experienceFilter) {
    experienceFilter.innerHTML = '<option value="">All Experience Levels</option>' + 
      experiences.map(e => `<option value="${e}">${e}</option>`).join('');
  }
}

// Populate filters on page load
document.addEventListener('DOMContentLoaded', populateFilters);

// ── SMOOTH SCROLL FOR ANCHOR LINKS ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});
