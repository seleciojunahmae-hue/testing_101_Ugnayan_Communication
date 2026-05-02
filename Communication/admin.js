/* ============================================
   Barangay Communication Module - Admin JavaScript
   ============================================ */

// Admin State
const adminState = {
  currentUser: {
    id: 100,
    name: 'Barangay Admin',
    role: 'Administrator',
    avatar: 'BA'
  },
  currentTab: 'inbox',
  currentMessageId: null,
  messages: [],
  logs: [],
  templates: [],
  isAdmin: true
};

// Mock Admin Messages
const mockAdminMessages = [
  {
    id: 1,
    sender: 'Maria Santos',
    avatar: 'MS',
    category: 'Complaint',
    preview: 'The street lights in our barangay are not working...',
    timestamp: '2 hours ago',
    unread: true,
    priority: true,
    messages: [
      { type: 'received', text: 'The street lights in our barangay are not working for a week now.', time: '2:30 PM', status: 'read' },
      { type: 'received', text: 'Can you please send someone to fix them?', time: '2:31 PM', status: 'read' },
      { type: 'sent', text: 'Thank you for reporting. We will send our maintenance team tomorrow.', time: '2:45 PM', status: 'read' }
    ]
  },
  {
    id: 2,
    sender: 'Pedro Reyes',
    avatar: 'PR',
    category: 'Request',
    preview: 'I need a barangay clearance for employment...',
    timestamp: '3 hours ago',
    unread: true,
    priority: false,
    messages: [
      { type: 'received', text: 'I need a barangay clearance for employment purposes.', time: '9:15 AM', status: 'read' },
      { type: 'sent', text: 'Sure! Please visit the barangay office with your ID and application form.', time: '9:30 AM', status: 'read' }
    ]
  },
  {
    id: 3,
    sender: 'Rosa Garcia',
    avatar: 'RG',
    category: 'Inquiry',
    preview: 'What are the office hours of the barangay?',
    timestamp: '5 hours ago',
    unread: false,
    priority: false,
    messages: [
      { type: 'received', text: 'What are the office hours of the barangay?', time: '1:00 PM', status: 'read' },
      { type: 'sent', text: 'Our office is open Monday to Friday, 8:00 AM to 5:00 PM.', time: '1:15 PM', status: 'read' }
    ]
  },
  {
    id: 4,
    sender: 'John Doe',
    avatar: 'JD',
    category: 'Feedback',
    preview: 'Great service from the barangay staff...',
    timestamp: '1 day ago',
    unread: false,
    priority: false,
    messages: [
      { type: 'received', text: 'Great service from the barangay staff. Very helpful and professional.', time: '3:00 PM', status: 'read' }
    ]
  },
  {
    id: 5,
    sender: 'Angela Cruz',
    avatar: 'AC',
    category: 'Complaint',
    preview: 'Noise complaint about construction...',
    timestamp: '2 days ago',
    unread: false,
    priority: true,
    messages: [
      { type: 'received', text: 'There has been construction noise at 6 AM every day. It\'s disturbing residents.', time: '8:00 AM', status: 'read' }
    ]
  }
];

// Mock Communication Logs
const mockLogs = [
  { id: 1, name: 'Maria Santos', category: 'Complaint', message: 'Street lights not working', timestamp: '2026-05-02 14:30', status: 'read' },
  { id: 2, name: 'Pedro Reyes', category: 'Request', message: 'Barangay clearance request', timestamp: '2026-05-02 12:15', status: 'read' },
  { id: 3, name: 'Rosa Garcia', category: 'Inquiry', message: 'Office hours inquiry', timestamp: '2026-05-02 10:00', status: 'read' },
  { id: 4, name: 'John Doe', category: 'Feedback', message: 'Positive feedback on service', timestamp: '2026-05-01 15:00', status: 'read' },
  { id: 5, name: 'Angela Cruz', category: 'Complaint', message: 'Noise complaint', timestamp: '2026-05-01 08:00', status: 'unread' }
];

// Mock Quick Reply Templates
const mockTemplates = [
  {
    id: 1,
    name: 'Complaint Acknowledgment',
    content: 'Thank you for reporting this issue. We have received your complaint and will investigate it immediately. We will get back to you within 24 hours.'
  },
  {
    id: 2,
    name: 'Request Confirmation',
    content: 'Thank you for your request. We have noted your request and will process it accordingly. Please visit our office with the required documents.'
  },
  {
    id: 3,
    name: 'Inquiry Response',
    content: 'Thank you for your inquiry. Our office is open Monday to Friday, 8:00 AM to 5:00 PM. For more information, please visit us or call our hotline.'
  },
  {
    id: 4,
    name: 'Feedback Thank You',
    content: 'Thank you for your valuable feedback. We appreciate your input and will use it to improve our services.'
  }
];

// Initialize Admin View
document.addEventListener('DOMContentLoaded', function() {
  initializeAdminEventListeners();
  loadAdminMessages();
  loadCommunicationLogs();
  loadQuickReplyTemplates();
});

// Admin Event Listeners
function initializeAdminEventListeners() {
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      switchAdminTab(this.dataset.tab);
    });
  });

  // Message selection
  const messageItems = document.querySelectorAll('.message-item');
  messageItems.forEach(item => {
    item.addEventListener('click', function() {
      selectAdminMessage(this.dataset.messageId);
    });
  });

  // Send reply
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendAdminReply);
  }

  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAdminReply();
      }
    });
  }

  // Broadcast button
  const broadcastBtn = document.getElementById('broadcastBtn');
  if (broadcastBtn) {
    broadcastBtn.addEventListener('click', openBroadcastModal);
  }

  // Quick reply button
  const quickReplyBtn = document.getElementById('quickReplyBtn');
  if (quickReplyBtn) {
    quickReplyBtn.addEventListener('click', openQuickReplyModal);
  }

  // Add template button
  const addTemplateBtn = document.getElementById('addTemplateBtn');
  if (addTemplateBtn) {
    addTemplateBtn.addEventListener('click', openAddTemplateModal);
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

  // Category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      filterAdminMessages(this.value);
    });
  }

  // Search functionality
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      searchAdminMessages(e.target.value);
    });
  }
}

// Load Admin Messages
function loadAdminMessages() {
  adminState.messages = mockAdminMessages;
  renderAdminMessageList();
}

// Render Admin Message List
function renderAdminMessageList() {
  const messageList = document.getElementById('adminMessageList');
  if (!messageList) return;

  messageList.innerHTML = '';
  adminState.messages.forEach(msg => {
    const messageItem = document.createElement('div');
    messageItem.className = `message-item ${msg.id === adminState.currentMessageId ? 'active' : ''}`;
    messageItem.dataset.messageId = msg.id;
    messageItem.innerHTML = `
      <div class="message-item-header">
        <div class="message-item-avatar">${msg.avatar}</div>
        <div class="message-item-info">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="message-item-name">${msg.sender}</div>
            <div style="display: flex; gap: 6px; align-items: center;">
              ${msg.priority ? '<span style="color: var(--primary-red); font-weight: bold;">⚠️</span>' : ''}
              ${msg.unread ? '<div class="unread-badge"></div>' : ''}
            </div>
          </div>
          <div class="message-item-time">${msg.timestamp}</div>
        </div>
      </div>
      <div class="message-item-preview">${msg.preview}</div>
      <span class="message-item-category">${msg.category}</span>
    `;
    messageItem.addEventListener('click', () => selectAdminMessage(msg.id));
    messageList.appendChild(messageItem);
  });
}

// Select Admin Message
function selectAdminMessage(messageId) {
  adminState.currentMessageId = messageId;
  renderAdminMessageList();
  renderAdminChatWindow();
}

// Render Admin Chat Window
function renderAdminChatWindow() {
  const message = adminState.messages.find(m => m.id === adminState.currentMessageId);
  if (!message) return;

  // Update header
  const chatHeaderInfo = document.querySelector('.chat-header-info');
  if (chatHeaderInfo) {
    chatHeaderInfo.innerHTML = `
      <div class="message-item-avatar" style="width: 44px; height: 44px; font-size: 16px;">${message.avatar}</div>
      <div class="chat-header-details">
        <h3>${message.sender}</h3>
        <p>${message.category} • ${message.timestamp}</p>
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

// Send Admin Reply
function sendAdminReply() {
  const messageInput = document.getElementById('messageInput');
  if (!messageInput || !messageInput.value.trim()) return;

  const message = adminState.messages.find(m => m.id === adminState.currentMessageId);
  if (!message) return;

  const newMsg = {
    type: 'sent',
    text: messageInput.value,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: 'sent'
  };

  message.messages.push(newMsg);
  messageInput.value = '';
  renderAdminChatWindow();
}

// Switch Admin Tab
function switchAdminTab(tab) {
  adminState.currentTab = tab;
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(t => t.classList.remove('active'));
  tabContents.forEach(tc => tc.classList.remove('active'));

  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`${tab}Tab`).classList.add('active');
}

// Filter Admin Messages
function filterAdminMessages(category) {
  if (!category) {
    loadAdminMessages();
    return;
  }

  const filtered = adminState.messages.filter(msg =>
    msg.category.toLowerCase() === category.toLowerCase()
  );

  const messageList = document.getElementById('adminMessageList');
  if (!messageList) return;

  messageList.innerHTML = '';
  filtered.forEach(msg => {
    const messageItem = document.createElement('div');
    messageItem.className = `message-item ${msg.id === adminState.currentMessageId ? 'active' : ''}`;
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
    messageItem.addEventListener('click', () => selectAdminMessage(msg.id));
    messageList.appendChild(messageItem);
  });
}

// Search Admin Messages
function searchAdminMessages(query) {
  if (!query.trim()) {
    loadAdminMessages();
    return;
  }

  const filtered = adminState.messages.filter(msg =>
    msg.sender.toLowerCase().includes(query.toLowerCase()) ||
    msg.preview.toLowerCase().includes(query.toLowerCase())
  );

  const messageList = document.getElementById('adminMessageList');
  if (!messageList) return;

  messageList.innerHTML = '';
  filtered.forEach(msg => {
    const messageItem = document.createElement('div');
    messageItem.className = `message-item ${msg.id === adminState.currentMessageId ? 'active' : ''}`;
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
    messageItem.addEventListener('click', () => selectAdminMessage(msg.id));
    messageList.appendChild(messageItem);
  });
}

// Load Communication Logs
function loadCommunicationLogs() {
  adminState.logs = mockLogs;
  renderCommunicationLogs();
}

// Render Communication Logs
function renderCommunicationLogs() {
  const logContainer = document.getElementById('logContainer');
  if (!logContainer) return;

  logContainer.innerHTML = '';
  adminState.logs.forEach(log => {
    const logRow = document.createElement('div');
    logRow.className = 'log-row';
    logRow.innerHTML = `
      <div class="log-name">${log.name}</div>
      <div><span class="log-category">${log.category}</span></div>
      <div>${log.message}</div>
      <div class="log-timestamp">${log.timestamp}</div>
      <div class="log-status">
        <span class="status-dot ${log.status}"></span>
        <span style="text-transform: capitalize;">${log.status}</span>
      </div>
    `;
    logContainer.appendChild(logRow);
  });
}

// Load Quick Reply Templates
function loadQuickReplyTemplates() {
  adminState.templates = mockTemplates;
  renderQuickReplyTemplates();
}

// Render Quick Reply Templates
function renderQuickReplyTemplates() {
  const templatesContainer = document.getElementById('templatesContainer');
  if (!templatesContainer) return;

  templatesContainer.innerHTML = '';
  adminState.templates.forEach(template => {
    const templateCard = document.createElement('div');
    templateCard.className = 'announcement-card';
    templateCard.style.borderLeft = '4px solid var(--primary-red)';
    templateCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div>
          <div class="announcement-title">${template.name}</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="action-btn" onclick="editTemplate(${template.id})" style="font-size: 12px; padding: 6px 12px;">✏️ Edit</button>
          <button class="action-btn" onclick="deleteTemplate(${template.id})" style="font-size: 12px; padding: 6px 12px;">🗑️ Delete</button>
        </div>
      </div>
      <div class="announcement-content">${template.content}</div>
      <button class="action-btn primary" onclick="useTemplate(${template.id})" style="width: 100%; margin-top: 12px;">Use This Template</button>
    `;
    templatesContainer.appendChild(templateCard);
  });

  // Render quick replies in modal
  const quickRepliesContainer = document.getElementById('quickRepliesContainer');
  if (quickRepliesContainer) {
    quickRepliesContainer.innerHTML = '';
    adminState.templates.forEach(template => {
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.style.width = '100%';
      btn.style.marginBottom = '8px';
      btn.style.textAlign = 'left';
      btn.innerHTML = `<strong>${template.name}</strong><br><small>${template.content.substring(0, 50)}...</small>`;
      btn.addEventListener('click', () => {
        useTemplate(template.id);
        document.getElementById('quickReplyModal').classList.remove('active');
      });
      quickRepliesContainer.appendChild(btn);
    });
  }
}

// Open Broadcast Modal
function openBroadcastModal() {
  const modal = document.getElementById('broadcastModal');
  if (modal) {
    modal.classList.add('active');
  }
}

// Send Broadcast
function sendBroadcast() {
  const title = document.getElementById('broadcastTitle').value;
  const category = document.getElementById('broadcastCategory').value;
  const message = document.getElementById('broadcastMessage').value;
  const recipients = document.getElementById('broadcastRecipients').value;

  if (!title || !category || !message || !recipients) {
    alert('Please fill in all fields');
    return;
  }

  alert(`Broadcast sent successfully!\n\nTitle: ${title}\nCategory: ${category}\nRecipients: ${recipients}`);
  document.getElementById('broadcastModal').classList.remove('active');
  document.getElementById('broadcastTitle').value = '';
  document.getElementById('broadcastMessage').value = '';
  document.getElementById('broadcastCategory').value = '';
  document.getElementById('broadcastRecipients').value = 'all';
}

// Open Quick Reply Modal
function openQuickReplyModal() {
  const modal = document.getElementById('quickReplyModal');
  if (modal) {
    modal.classList.add('active');
  }
}

// Use Template
function useTemplate(templateId) {
  const template = adminState.templates.find(t => t.id === templateId);
  if (!template) return;

  const messageInput = document.getElementById('messageInput');
  if (messageInput) {
    messageInput.value = template.content;
    messageInput.focus();
  }
}

// Open Add Template Modal
function openAddTemplateModal() {
  const modal = document.getElementById('addTemplateModal');
  if (modal) {
    modal.classList.add('active');
  }
}

// Add Template
function addTemplate() {
  const name = document.getElementById('templateName').value;
  const content = document.getElementById('templateContent').value;

  if (!name || !content) {
    alert('Please fill in all fields');
    return;
  }

  const newTemplate = {
    id: adminState.templates.length + 1,
    name,
    content
  };

  adminState.templates.push(newTemplate);
  loadQuickReplyTemplates();

  document.getElementById('addTemplateModal').classList.remove('active');
  document.getElementById('templateName').value = '';
  document.getElementById('templateContent').value = '';

  alert('Template added successfully!');
}

// Edit Template
function editTemplate(templateId) {
  const template = adminState.templates.find(t => t.id === templateId);
  if (!template) return;

  document.getElementById('templateName').value = template.name;
  document.getElementById('templateContent').value = template.content;
  openAddTemplateModal();
}

// Delete Template
function deleteTemplate(templateId) {
  if (confirm('Are you sure you want to delete this template?')) {
    adminState.templates = adminState.templates.filter(t => t.id !== templateId);
    loadQuickReplyTemplates();
  }
}

// Auto-adjust textarea height
const messageInput = document.getElementById('messageInput');
if (messageInput) {
  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });
}