// Mock Data for initial state
const initialMessages = [
    {
        id: 1,
        sender: "John Doe",
        purok: "Purok 1",
        lastMessage: "Thank you for the update regarding the vaccination schedule.",
        time: "10:30 AM",
        unread: true,
        replied: false,
        history: [
            { type: 'received', text: "Hello Admin, when is the next vaccination schedule?", time: "09:00 AM" },
            { type: 'sent', text: "Hi John! It's scheduled for this coming Saturday, May 12th.", time: "10:15 AM" },
            { type: 'received', text: "Thank you for the update regarding the vaccination schedule.", time: "10:30 AM" }
        ]
    },
    {
        id: 2,
        sender: "Maria Santos",
        purok: "Purok 3",
        lastMessage: "I would like to report a broken street light near my house.",
        time: "Yesterday",
        unread: false,
        replied: true,
        history: [
            { type: 'received', text: "I would like to report a broken street light near my house.", time: "Yesterday" },
            { type: 'sent', text: "Thank you for reporting, Maria. We will send a maintenance team tomorrow.", time: "Yesterday" }
        ]
    },
    {
        id: 3,
        sender: "Juan Dela Cruz",
        purok: "Purok 2",
        lastMessage: "Is the barangay hall open today?",
        time: "May 7",
        unread: false,
        replied: false,
        history: [
            { type: 'received', text: "Is the barangay hall open today?", time: "May 7" }
        ]
    }
];

// State Management
let messages = JSON.parse(localStorage.getItem('admin_messages')) || initialMessages;
let activeConversationId = null;
let currentFilter = 'all';

// DOM Elements
const messageList = document.getElementById('message-list');
const noSelection = document.getElementById('no-selection');
const conversationView = document.getElementById('conversation-view');
const chatHistory = document.getElementById('chat-history');
const activeUserName = document.getElementById('active-user-name');
const activeAvatar = document.getElementById('active-avatar');
const replyInput = document.getElementById('reply-input');
const sendReplyBtn = document.getElementById('send-reply-btn');
const searchInput = document.getElementById('search-messages');
const filterTabs = document.querySelectorAll('.filter-tab');
const newMessageBtn = document.getElementById('new-message-btn');
const newMessageModal = document.getElementById('new-message-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const newMessageForm = document.getElementById('new-message-form');
const deleteConvoBtn = document.getElementById('delete-convo-btn');

// Initialize
function init() {
    renderMessageList();
    setupEventListeners();
}

// Render Message List
function renderMessageList() {
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredMessages = messages.filter(msg => {
        const matchesSearch = msg.sender.toLowerCase().includes(searchTerm);
        const matchesFilter = 
            currentFilter === 'all' || 
            (currentFilter === 'unread' && msg.unread) || 
            (currentFilter === 'replied' && msg.replied);
        return matchesSearch && matchesFilter;
    });

    messageList.innerHTML = '';
    
    if (filteredMessages.length === 0) {
        messageList.innerHTML = '<div class="empty-list">No messages found</div>';
        return;
    }

    filteredMessages.forEach(msg => {
        const div = document.createElement('div');
        div.className = `message-item ${msg.unread ? 'unread' : ''} ${activeConversationId === msg.id ? 'active' : ''}`;
        div.onclick = () => selectConversation(msg.id);
        
        const initials = msg.sender.split(' ').map(n => n[0]).join('');
        
        div.innerHTML = `
            <div class="avatar" style="background-color: ${getAvatarColor(msg.sender)}">${initials}</div>
            <div class="message-info">
                <div class="message-info-header">
                    <h4>${msg.sender}</h4>
                    <span class="message-time">${msg.time}</span>
                </div>
                <p class="message-preview">${msg.lastMessage}</p>
            </div>
        `;
        messageList.appendChild(div);
    });
}

// Select Conversation
function selectConversation(id) {
    activeConversationId = id;
    const convo = messages.find(m => m.id === id);
    
    if (!convo) return;

    // Mark as read
    convo.unread = false;
    saveToStorage();
    
    // Update UI
    noSelection.classList.add('hidden');
    conversationView.classList.remove('hidden');
    activeUserName.textContent = convo.sender;
    activeAvatar.textContent = convo.sender.split(' ').map(n => n[0]).join('');
    activeAvatar.style.backgroundColor = getAvatarColor(convo.sender);
    
    renderChatHistory(convo.history);
    renderMessageList();
    
    // Mobile view handling
    if (window.innerWidth <= 768) {
        document.querySelector('.app-container').classList.add('show-detail');
    }
}

// Render Chat History
function renderChatHistory(history) {
    chatHistory.innerHTML = '';
    history.forEach(msg => {
        const div = document.createElement('div');
        div.className = `message-bubble ${msg.type}`;
        div.innerHTML = `
            ${msg.text}
            <span class="bubble-time">${msg.time}</span>
        `;
        chatHistory.appendChild(div);
    });
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Event Listeners
function setupEventListeners() {
    // Search
    searchInput.oninput = renderMessageList;

    // Filter Tabs
    filterTabs.forEach(tab => {
        tab.onclick = () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderMessageList();
        };
    });

    // Send Reply
    sendReplyBtn.onclick = sendReply;
    replyInput.onkeypress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendReply();
        }
    };

    // New Message Modal
    newMessageBtn.onclick = () => newMessageModal.classList.remove('hidden');
    closeModalBtns.forEach(btn => {
        btn.onclick = () => newMessageModal.classList.add('hidden');
    });

    // Form Submission
    newMessageForm.onsubmit = (e) => {
        e.preventDefault();
        const recipient = document.getElementById('recipient').value;
        const body = document.getElementById('message-body').value;
        
        const newConvo = {
            id: Date.now(),
            sender: recipient,
            purok: "Resident",
            lastMessage: body,
            time: "Just now",
            unread: false,
            replied: true,
            history: [{ type: 'sent', text: body, time: "Just now" }]
        };
        
        messages.unshift(newConvo);
        saveToStorage();
        newMessageModal.classList.add('hidden');
        newMessageForm.reset();
        selectConversation(newConvo.id);
    };

    // Delete Conversation
    deleteConvoBtn.onclick = () => {
        if (confirm('Are you sure you want to delete this conversation?')) {
            messages = messages.filter(m => m.id !== activeConversationId);
            saveToStorage();
            activeConversationId = null;
            conversationView.classList.add('hidden');
            noSelection.classList.remove('hidden');
            renderMessageList();
        }
    };
}

function sendReply() {
    const text = replyInput.value.trim();
    if (!text || !activeConversationId) return;

    const convo = messages.find(m => m.id === activeConversationId);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    convo.history.push({ type: 'sent', text, time: now });
    convo.lastMessage = text;
    convo.time = now;
    convo.replied = true;
    
    saveToStorage();
    renderChatHistory(convo.history);
    renderMessageList();
    replyInput.value = '';
}

// Helpers
function saveToStorage() {
    localStorage.setItem('admin_messages', JSON.stringify(messages));
}

function getAvatarColor(name) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Auto-resize textarea
replyInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

init();
