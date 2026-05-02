/* ============================================
   Barangay Communication Module - Main JavaScript
   ============================================ */

// Global State Management
const appState = {
  currentUser: {
    id: 1,
    name: 'Juan Dela Cruz',
    role: 'Resident',
    avatar: 'JD'
  },
  currentTab: 'messages',
  currentMessageId: null,
  messages: [],
  announcements: [],
  feedback: [],
  isAdmin: false,
  selectedRating: 0
};

// Mock Data
const mockMessages = [
  {
    id: 1,
    sender: 'Maria Santos',
    avatar: 'MS',
    category: 'Complaint',
    preview: 'The street lights in our barangay are not working...',
    timestamp: '2 hours ago',
    unread: true,
    messages: [
      { type: 'received', text: 'The street lights in our barangay are not working for a week now.', time: '2:30 PM', status: 'read' },
      { type: 'received', text: 'Can you please send someone to fix them?', time: '2:31 PM', status: 'read' },
      { type: 'sent', text: 'Thank you for reporting. We will send our maintenance team tomorrow.', time: '2:45 PM', status: 'read' }
    ]
  },
  {
    id: 2,
    sender: 'Barangay Office',
    avatar: 'BO',
    category: 'Announcement',
    preview: 'Community Outreach Program this Saturday...',
    timestamp: '1 day ago',
    unread: false,
    messages: [
      { type: 'received', text: 'Community Outreach Program this Saturday at 9:00 AM', time: '10:00 AM', status: 'read' },
      { type: 'received', text: 'Location: Barangay Plaza\nBring your family and friends!', time: '10:01 AM', status: 'read' }
    ]
  },
  {
    id: 3,
    sender: 'Pedro Reyes',
    avatar: 'PR',
    category: 'Request',
    preview: 'I need a barangay clearance for employment...',
    timestamp: '3 days ago',
    unread: false,
    messages: [
      { type: 'received', text: 'I need a barangay clearance for employment purposes.', time: '9:15 AM', status: 'read' },
      { type: 'sent', text: 'Sure! Please visit the barangay office with your ID and application form.', time: '9:30 AM', status: 'read' }
    ]
  },
  {
    id: 4,
    sender: 'Rosa Garcia',
    avatar: 'RG',
    category: 'Inquiry',
    preview: 'What are the office hours of the barangay?',
    timestamp: '5 days ago',
    unread: false,
    messages: [
      { type: 'received', text: 'What are the office hours of the barangay?', time: '1:00 PM', status: 'read' },
      { type: 'sent', text: 'Our office is open Monday to Friday, 8:00 AM to 5:00 PM.', time: '1:15 PM', status: 'read' }
    ]
  }
];

const mockAnnouncements = [
  {
    id: 1,
    title: 'Community Outreach Program',
    category: 'Event',
    date: 'May 5, 2026',
    icon: '📢',
    content: 'Join us for our monthly community outreach program. We will be distributing health kits and conducting free medical consultations.'
  },
  {
    id: 2,
    title: 'Road Maintenance Alert',
    category: 'Alert',
    date: 'May 3, 2026',
    icon: '⚠️',
    content: 'Please be advised that Rizal Street will be closed for maintenance from May 6-8. Please use alternative routes.'
  },
  {
    id: 3,
    title: 'Healthcare Campaign',
    category: 'Healthcare',
    date: 'May 1, 2026',
    icon: '🏥',
    content: 'Free vaccination and health screening will be conducted every Saturday at the Barangay Health Center.'
  }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  initializeEventListeners();
  loadMessages();
  loadAnnouncements();
  selectMessage(mockMessages[0].id);
});

// Event Listeners
function initializeEventListeners() {
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });

  // Message list filtering
  const filterTabs = document.querySelectorAll('.tab-btn');
  filterTabs.forEach(btn => {
    btn.addEventListener('click', function() {
      filterMessages(this.dataset.filter);
    });
  });

  // Message selection
  const messageItems = document.querySelectorAll('.message-item');
  messageItems.forEach(item => {
    item.addEventListener('click', function() {
      selectMessage(this.dataset.messageId);
    });
  });

  // Send message
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // New message button
  const newMessageBtn = document.getElementById('newMessageBtn');
  if (newMessageBtn) {
    newMessageBtn.addEventListener('click', openNewMessageModal);
  }

  // Rating stars
  const ratingStars = document.querySelectorAll('.rating-star');
  ratingStars.forEach((star, index) => {
    star.addEventListener('click', function() {
      appState.selectedRating = index + 1;
      updateRatingDisplay();
    });
  });

  // Submit feedback
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', submitFeedback);
  }

  // Search functionality
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      searchMessages(e.target.value);
    });
  }

  // Modal close buttons
  const closeButtons = document.querySelectorAll('.modal-close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.modal').classList.remove('active');
    });
  });

  // Modal background click
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
      }
    });
  });
}

// Load Messages
function loadMessages() {
  appState.messages = mockMessages;
  renderMessageList();
}

// Render Message List
function renderMessageList() {
  const messageList = document.getElementById('messageList');
  if (!messageList) return;

  messageList.innerHTML = '';
  appState.messages.forEach(msg => {
    const messageItem = document.createElement('div');
    messageItem.className = `message-item ${msg.id === appState.currentMessageId ? 'active' : ''}`;
    messageItem.dataset.messageId = msg.id;
    messageItem.innerHTML = `
      <div class="message-item-header">
        <div class="message-item-avatar">${msg.avatar}</div>
        <div class="message-item-info">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="message-item-name">${msg.sender}</div>
            ${msg.unread ? '<div class="unread-badge"></div>' : ''}
          </div>
          <div class="message-item-time">${msg.timestamp}</div>
        </div>
      </div>
      <div class="message-item-preview">${msg.preview}</div>
      <span class="message-item-category">${msg.category}</span>
    `;
    messageItem.addEventListener('click', () => selectMessage(msg.id));
    messageList.appendChild(messageItem);
  });
}

// Select Message
function selectMessage(messageId) {
  appState.currentMessageId = messageId;
  renderMessageList();
  renderChatWindow();
}

// Render Chat Window
function renderChatWindow() {
  const message = appState.messages.find(m => m.id === appState.currentMessageId);
  if (!message) return;

  // Update header
  const chatHeaderInfo = document.querySelector('.chat-header-info');
  if (chatHeaderInfo) {
    chatHeaderInfo.innerHTML = `
      <div class="message-item-avatar" style="width: 44px; height: 44px; font-size: 16px;">${message.avatar}</div>
      <div class="chat-header-details">
        <h3>${message.sender}</h3>
        <p>${message.category}</p>
      </div>
    `;
  }

  // Render messages
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
    message.messages.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `message-bubble ${msg.type}`;
      bubble.innerHTML = `
        <div class="bubble-content">
          <div class="bubble-text">${msg.text}</div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="message-time">${msg.time}</span>
            ${msg.type === 'sent' ? `<span class="message-status ${msg.status === 'read' ? 'status-read' : ''}"><span class="status-icon">✓</span></span>` : ''}
          </div>
        </div>
      `;
      chatMessages.appendChild(bubble);
    });

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Clear input
  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.value = '';
  }
}

// Send Message
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  if (!messageInput || !messageInput.value.trim()) return;

  const message = appState.messages.find(m => m.id === appState.currentMessageId);
  if (!message) return;

  const newMsg = {
    type: 'sent',
    text: messageInput.value,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: 'sent'
  };

  message.messages.push(newMsg);
  messageInput.value = '';
  renderChatWindow();

  // Simulate auto-reply after 2 seconds
  setTimeout(() => {
    const reply = {
      type: 'received',
      text: 'Thank you for your message. We will get back to you shortly.',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    };
    message.messages.push(reply);
    renderChatWindow();
  }, 2000);
}

// Filter Messages
function filterMessages(filter) {
  const filterTabs = document.querySelectorAll('.tab-btn');
  filterTabs.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });

  // In a real app, filter the messages array
  console.log('Filter by:', filter);
}

// Switch Tab
function switchTab(tab) {
  appState.currentTab = tab;
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(t => t.classList.remove('active'));
  tabContents.forEach(tc => tc.classList.remove('active'));

  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`${tab}Tab`).classList.add('active');
}

// Load Announcements
function loadAnnouncements() {
  appState.announcements = mockAnnouncements;
  renderAnnouncements();
}

// Render Announcements
function renderAnnouncements() {
  const announcementsContainer = document.getElementById('announcementsContainer');
  if (!announcementsContainer) return;

  announcementsContainer.innerHTML = '';
  appState.announcements.forEach(announcement => {
    const card = document.createElement('div');
    card.className = 'announcement-card';
    card.innerHTML = `
      <div class="announcement-header">
        <div class="announcement-icon">${announcement.icon}</div>
        <div class="announcement-meta">
          <div class="announcement-title">${announcement.title}</div>
          <div class="announcement-date">${announcement.date}</div>
        </div>
      </div>
      <div class="announcement-content">${announcement.content}</div>
      <span class="announcement-category">${announcement.category}</span>
    `;
    announcementsContainer.appendChild(card);
  });
}

// Update Rating Display
function updateRatingDisplay() {
  const ratingStars = document.querySelectorAll('.rating-star');
  ratingStars.forEach((star, index) => {
    if (index < appState.selectedRating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// Submit Feedback
function submitFeedback(e) {
  e.preventDefault();

  const category = document.getElementById('feedbackCategory').value;
  const comment = document.getElementById('feedbackComment').value;
  const rating = appState.selectedRating;

  if (!category || !comment || rating === 0) {
    alert('Please fill in all fields and select a rating.');
    return;
  }

  const feedback = {
    id: appState.feedback.length + 1,
    category,
    comment,
    rating,
    date: new Date().toLocaleDateString(),
    status: 'submitted'
  };

  appState.feedback.push(feedback);

  // Reset form
  document.getElementById('feedbackForm').reset();
  appState.selectedRating = 0;
  updateRatingDisplay();

  alert('Thank you for your feedback!');
}

// Search Messages
function searchMessages(query) {
  if (!query.trim()) {
    loadMessages();
    return;
  }

  const filtered = appState.messages.filter(msg =>
    msg.sender.toLowerCase().includes(query.toLowerCase()) ||
    msg.preview.toLowerCase().includes(query.toLowerCase())
  );

  const messageList = document.getElementById('messageList');
  if (!messageList) return;

  messageList.innerHTML = '';
  filtered.forEach(msg => {
    const messageItem = document.createElement('div');
    messageItem.className = `message-item ${msg.id === appState.currentMessageId ? 'active' : ''}`;
    messageItem.dataset.messageId = msg.id;
    messageItem.innerHTML = `
      <div class="message-item-header">
        <div class="message-item-avatar">${msg.avatar}</div>
        <div class="message-item-info">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="message-item-name">${msg.sender}</div>
            ${msg.unread ? '<div class="unread-badge"></div>' : ''}
          </div>
          <div class="message-item-time">${msg.timestamp}</div>
        </div>
      </div>
      <div class="message-item-preview">${msg.preview}</div>
      <span class="message-item-category">${msg.category}</span>
    `;
    messageItem.addEventListener('click', () => selectMessage(msg.id));
    messageList.appendChild(messageItem);
  });
}

// Open New Message Modal
function openNewMessageModal() {
  const modal = document.getElementById('newMessageModal');
  if (modal) {
    modal.classList.add('active');
  }
}

// Admin Functions
function switchToAdminView() {
  appState.isAdmin = true;
  window.location.href = 'admin.html';
}

function switchToResidentView() {
  appState.isAdmin = false;
  window.location.href = 'index.html';
}