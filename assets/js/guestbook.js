/**
 * Jason Chong Portfolio - Guestbook Comment System
 * 
 * Supports two modes:
 * 1. Supabase Mode (Production): Syncs comments globally. Provide keys below.
 * 2. Local Mode (Fallback): Saves to browser LocalStorage + loads mock entries.
 */

// ==========================================
// CONFIGURATION
// ==========================================
// To connect to a real database, set your Supabase details here:
const SUPABASE_URL = 'https://rzrsuvnmyxgapeufxfwg.supabase.co';       // e.g. 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_38oDVT8li0UWnWmmuamgTw_mcMr1niz';  // e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const COMMENTS_TABLE = 'comments';

// ==========================================
// STATE & CONSTANTS
// ==========================================
let detectedLocation = 'Unknown Region';
let commentsList = [];

// Pre-seeded mock comments to show region functionality out-of-the-box
const MOCK_COMMENTS = [
    {
        id: 'mock-1',
        name: 'Sarah Jenkins',
        ip_region: 'London, GB 🇬🇧',
        message: 'Awesome portfolio, Jason! Love the VR projects and the Macau LRT concept app. Keep up the great work!',
        created_at: new Date(Date.now() - 3600000 * 2.5).toISOString() // 2.5 hours ago
    },
    {
        id: 'mock-2',
        name: 'Kenji Sato',
        ip_region: 'Tokyo, JP 🇯🇵',
        message: '非常にかっこいい (Very cool)! The design aesthetics of the site are stunning. Your Arduino work is also inspiring.',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    },
    {
        id: 'mock-3',
        name: 'Alex Rivera',
        ip_region: 'California, US 🇺🇸',
        message: 'The wire loop game project is really clever! Let me know if you are open to collaborating on some Python scripts.',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
    }
];

// ==========================================
// GEOLOCATION ENGINE
// ==========================================
/**
 * Convert 2-letter country code (ISO 3166-1 alpha-2) to Flag Emoji
 */
function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

/**
 * Fetch visitor's location using free HTTPS IP Geolocation APIs
 */
async function fetchUserLocation() {
    const locationText = document.getElementById('location-text');
    
    // Try API 1: ipwho.is (Detailed, supports HTTPS, no key required, 10k free requests/mo)
    try {
        const response = await fetch('https://ipwho.is/');
        if (!response.ok) throw new Error('API 1 Failed');
        const data = await response.json();
        
        if (data && data.success) {
            const city = data.city || '';
            const region = data.region || '';
            const countryCode = data.country_code || '';
            const flag = getFlagEmoji(countryCode);
            
            // Build pretty location string
            const place = city || region || data.country || 'Unknown';
            detectedLocation = `${place}, ${countryCode} ${flag}`.trim();
            if (locationText) {
                locationText.textContent = `From ${detectedLocation}`;
            }
            return;
        }
    } catch (e) {
        console.warn('Primary Geo API failed, attempting fallback...', e);
    }

    // Try API 2: freeipapi.com (Fallback, HTTPS, no key, 60 reqs/min)
    try {
        const response = await fetch('https://freeipapi.com/api/json');
        if (!response.ok) throw new Error('API 2 Failed');
        const data = await response.json();
        
        if (data && data.countryCode) {
            const city = data.cityName || '';
            const region = data.regionName || '';
            const countryCode = data.countryCode || '';
            const flag = getFlagEmoji(countryCode);
            
            const place = city || region || data.countryName || 'Unknown';
            detectedLocation = `${place}, ${countryCode} ${flag}`.trim();
            if (locationText) {
                locationText.textContent = `From ${detectedLocation}`;
            }
            return;
        }
    } catch (e) {
        console.error('All Geolocation APIs failed:', e);
        detectedLocation = 'Unknown Region';
        if (locationText) {
            locationText.textContent = 'Location Unknown';
        }
    }
}

// ==========================================
// AVATAR & DATE FORMATTING UTILITIES
// ==========================================
/**
 * Generates a consistent, colorful gradient avatar based on commenter name
 */
function getAvatarStyle(name) {
    const gradients = [
        'linear-gradient(135deg, #7F00FF, #E100FF)', // Deep Purple -> Violet
        'linear-gradient(135deg, #FF512F, #DD2476)', // Orange -> Pink
        'linear-gradient(135deg, #1FA2FF, #12D8FA, #A6FFCB)', // Ocean
        'linear-gradient(135deg, #11998e, #38ef7d)', // Green -> Emerald
        'linear-gradient(135deg, #f9d423, #ff4e50)', // Gold -> Coral
        'linear-gradient(135deg, #f80759, #bc4e9c)'  // Magenta -> Purple
    ];
    
    // Hash function to pick gradient index
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return `background: ${gradients[index]}; text-shadow: 0 1px 2px rgba(0,0,0,0.3);`;
}

/**
 * Format timestamp into relative time or clean date
 */
function formatCommentDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (isNaN(date.getTime())) return 'Recently';
    if (diffMs < 0) return 'Just now'; // Handle clock skew
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// ==========================================
// STORAGE LAYER (HYBRID: LOCAL / SUPABASE)
// ==========================================
function isSupabaseConfigured() {
    return SUPABASE_URL.trim() !== '' && SUPABASE_ANON_KEY.trim() !== '';
}

/**
 * Fetch comments from database or local fallback
 */
async function loadComments() {
    const feed = document.getElementById('comments-feed');
    const countSpan = document.getElementById('comments-count');

    if (isSupabaseConfigured()) {
        try {
            const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${COMMENTS_TABLE}?select=*&order=created_at.desc`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            commentsList = await response.json();
        } catch (e) {
            console.error('Supabase fetch failed, falling back to LocalStorage:', e);
            loadLocalComments();
        }
    } else {
        loadLocalComments();
    }

    renderComments();
}

/**
 * Fetch comments from local storage
 */
function loadLocalComments() {
    const stored = localStorage.getItem('jason_guestbook_comments');
    if (stored) {
        commentsList = JSON.parse(stored);
    } else {
        // Pre-seed with mock comments if empty
        commentsList = [...MOCK_COMMENTS];
        localStorage.setItem('jason_guestbook_comments', JSON.stringify(commentsList));
    }
}

/**
 * Save comment to database or local storage
 */
async function saveComment(comment) {
    if (isSupabaseConfigured()) {
        try {
            const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${COMMENTS_TABLE}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(comment)
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();
            return data[0] || comment; // Return database record with generated ID
        } catch (e) {
            console.error('Supabase save failed, falling back to LocalStorage:', e);
            return saveLocalComment(comment);
        }
    } else {
        return saveLocalComment(comment);
    }
}

/**
 * Save comment to local storage
 */
function saveLocalComment(comment) {
    comment.id = 'local-' + Date.now();
    commentsList.unshift(comment);
    localStorage.setItem('jason_guestbook_comments', JSON.stringify(commentsList));
    return comment;
}

// ==========================================
// UI RENDER ENGINE
// ==========================================
/**
 * Render all comments in the feed
 */
function renderComments() {
    const feed = document.getElementById('comments-feed');
    const countSpan = document.getElementById('comments-count');
    
    if (!feed) return;
    
    // Update count indicator
    if (countSpan) {
        countSpan.textContent = commentsList.length;
    }

    if (commentsList.length === 0) {
        feed.innerHTML = '<div class="feed__loading">No comments yet. Be the first to leave a message!</div>';
        return;
    }

    feed.innerHTML = '';
    commentsList.forEach(comment => {
        feed.appendChild(createCommentCard(comment));
    });
}

/**
 * Build a comment card DOM Node
 */
function createCommentCard(comment) {
    const card = document.createElement('div');
    card.className = 'comment-card';
    card.setAttribute('data-id', comment.id);

    const firstLetter = comment.name ? comment.name.charAt(0) : '?';
    const avatarStyle = getAvatarStyle(comment.name || 'Anonymous');
    const dateText = formatCommentDate(comment.created_at);
    
    // Split IP location into text and emoji flag
    let locationHTML = '';
    if (comment.ip_region && comment.ip_region !== 'Unknown Region') {
        locationHTML = `<span class="comment__region"><i class='bx bx-map-pin'></i> ${comment.ip_region}</span>`;
    }

    card.innerHTML = `
        <div class="comment__avatar" style="${avatarStyle}">
            ${firstLetter}
        </div>
        <div class="comment__content">
            <div class="comment__header">
                <div class="comment__author-box">
                    <span class="comment__author">${comment.name}</span>
                    ${locationHTML}
                </div>
                <span class="comment__date">${dateText}</span>
            </div>
            <p class="comment__message">${escapeHTML(comment.message)}</p>
        </div>
    `;

    return card;
}

/**
 * Simple HTML sanitizer
 */
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==========================================
// INITIALIZATION & ACTIONS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch user's IP-based location
    fetchUserLocation();

    // 2. Fetch and render comments list
    loadComments();

    // 3. Listen to form submission
    const form = document.getElementById('guestbook-form');
    const nameInput = document.getElementById('guestbook-name');
    const messageInput = document.getElementById('guestbook-message');
    const submitBtn = document.getElementById('guestbook-submit');
    const feed = document.getElementById('comments-feed');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const message = messageInput.value.trim();

            if (!name || !message) return;

            // Submit loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            const commentPayload = {
                name: name,
                message: message,
                ip_region: detectedLocation,
                created_at: new Date().toISOString()
            };

            // Save via storage API
            const savedComment = await saveComment(commentPayload);

            // UI updates
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            messageInput.value = ''; // Keep name in form for easier double posts

            // Prepend new comment visually
            if (commentsList.length === 1 && commentsList[0].id === savedComment.id) {
                // If it was the first comment, clear empty placeholder first
                feed.innerHTML = '';
            }
            
            const newCard = createCommentCard(savedComment);
            feed.insertBefore(newCard, feed.firstChild);

            // Update count
            const countSpan = document.getElementById('comments-count');
            if (countSpan) {
                countSpan.textContent = commentsList.length;
            }

            // Scroll the feed to the top to see the new comment
            feed.scrollTop = 0;
        });
    }
});
