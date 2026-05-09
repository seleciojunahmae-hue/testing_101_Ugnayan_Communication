// Mock Data
const initialMessages = [
    {
        id: 1,
        subject: "Vaccination Schedule",
        lastMessage: "Thank you for the update regarding the vaccination schedule.",
        sender: "Barangay Admin",
        time: "10:30 AM",
        status: "replied",
        history: [
            { type: 'received', text: "Hi John! It's scheduled for this coming Saturday, May 12th.", time: "10:15 AM" },
            { type: 'sent', text: "Thank you for the update regarding the vaccination schedule.", time: "10:30 AM" }
        ]
    },
    {
        id: 2,
        subject: "Broken Street Light",
        lastMessage: "Thank you for reporting, Maria. We will send a maintenance team tomorrow.",
        sender: "Barangay Admin",
        time: "Yesterday",
        status: "unread",
        history: [
            { type: 'sent', text: "I would like to report a broken street light near my house.", time: "Yesterday" },
            { type: 'received', text: "Thank you for reporting, Maria. We will send a maintenance team tomorrow.", time: "Yesterday" }
        ]
    }
];

const initialAnnouncements = [
    {
        id: 1,
        title: "Monthly Community Meeting",
        category: "Event",
        date: "May 8, 2026",
        content: "Please join us for our monthly community meeting this Saturday at 2 PM in the Barangay Hall."
    },
    {
        id: 2,
        title: "Water Service Interruption",
        category: "Alert",
        date: "May 7, 2026",
        content: "There will be a temporary water service interruption tomorrow from 8 AM to 12 PM due to pipe maintenance."
    }
];

// State
let messages = JSON.parse(localStorage.getItem('resident_messages')) || initialMessages;
let announcements = JSON.parse(localStorage.getItem('broadcast_history')) || initialAnnouncements;
let feedback = JSON.parse(localStorage.getItem('resident_feedback')) || [];

// DOM Elements
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');
const messagesGrid = document.getElementById('messages-grid');
const announcementsGrid = document.getElementById('announcements-grid');
const feedbackList = document.getElementById('feedback-list');
const feedbackForm = document.getElementById('feedback-form');
const msgModal = document.getElementById('msg-modal');
const newMsgModal = document.getElementById('new-msg-modal');
const newMsgBtn = document.getElementById('new-msg-btn');
const closeModalBtns = document.querySelectorAll('.close-modal');

// Initialize
function init() {
    renderMessages();
    renderAnnouncements();
    renderFeedback();
    setupEventListeners();
}

function setupEventListeners() {
    // Tab Switching
    navTabs.forEach(tab => {
        tab.onclick = () => {
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const target = tab.dataset.tab;
            tabContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `${target}-tab`) {
                    content.classList.remove('hidden');
                }
            });
        };
    });

    // Modals
    newMsgBtn.onclick = () => newMsgModal.classList.remove('hidden');
    closeModalBtns.forEach(btn => {
        btn.onclick = () => {
            msgModal.classList.add('hidden');
            newMsgModal.classList.add('hidden');
        };
    });

    // New Message Form
    document.getElementById('new-msg-form').onsubmit = (e) => {
        e.preventDefault();
        const subject = document.getElementById('msg-subject').value;
        const body = document.getElementById('msg-body').value;
        
        const newMsg = {
            id: Date.now(),
            subject,
            lastMessage: body,
            sender: "Barangay Admin",
            time: "Just now",
            status: "sent",
            history: [{ type: 'sent', text: body, time: "Just now" }]
        };
        
        messages.unshift(newMsg);
        localStorage.setItem('resident_messages', JSON.stringify(messages));
        renderMessages();
        newMsgModal.classList.add('hidden');
        e.target.reset();
    };

    // Feedback Form
    feedbackForm.onsubmit = (e) => {
        e.preventDefault();
        const rating = feedbackForm.querySelector('input[name="rating"]:checked')?.value || 0;
        const category = document.getElementById('fb-category').value;
        const comment = document.getElementById('fb-comment').value;
        
        const newFB = {
            id: Date.now(),
            rating,
            category,
            comment,
            date: new Date().toLocaleDateString()
        };
        
        feedback.unshift(newFB);
        localStorage.setItem('resident_feedback', JSON.stringify(feedback));
        renderFeedback();
        feedbackForm.reset();
        alert('Thank you for your feedback!');
    };
}

function renderMessages() {
    messagesGrid.innerHTML = '';
    messages.forEach(msg => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openMessage(msg.id);
        card.innerHTML = `
            <div class="card-header">
                <span class="status-badge ${msg.status}">${msg.status.toUpperCase()}</span>
                <span class="time">${msg.time}</span>
            </div>
            <h3 class="card-title">${msg.subject}</h3>
            <p class="card-preview">${msg.lastMessage}</p>
            <div class="card-footer">
                <span>From: ${msg.sender}</span>
            </div>
        `;
        messagesGrid.appendChild(card);
    });
}

function renderAnnouncements() {
    announcementsGrid.innerHTML = '';
    announcements.forEach(ann => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <span class="status-badge sent">${ann.category || 'Announcement'}</span>
                <span class="time">${ann.date}</span>
            </div>
            <h3 class="card-title">${ann.title}</h3>
            <p class="card-preview">${ann.message || ann.content}</p>
        `;
        announcementsGrid.appendChild(card);
    });
}

function renderFeedback() {
    feedbackList.innerHTML = '';
    if (feedback.length === 0) {
        feedbackList.innerHTML = '<p class="text-muted">No feedback submitted yet.</p>';
        return;
    }
    
    feedback.forEach(fb => {
        const item = document.createElement('div');
        item.className = 'card mb-3';
        item.style.padding = '1rem';
        item.innerHTML = `
            <div class="d-flex justify-content-between">
                <strong>${fb.category}</strong>
                <span class="text-warning">${'★'.repeat(fb.rating)}</span>
            </div>
            <p class="small mb-0">${fb.comment}</p>
            <small class="text-muted">${fb.date}</small>
        `;
        feedbackList.appendChild(item);
    });
}

function openMessage(id) {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    
    document.getElementById('modal-title').textContent = msg.subject;
    const historyEl = document.getElementById('modal-chat-history');
    historyEl.innerHTML = '';
    
    msg.history.forEach(chat => {
        const bubble = document.createElement('div');
        bubble.className = `bubble ${chat.type}`;
        bubble.innerHTML = `
            ${chat.text}
            <div style="font-size: 0.7rem; opacity: 0.7; margin-top: 0.3rem;">${chat.time}</div>
        `;
        historyEl.appendChild(bubble);
    });
    
    msgModal.classList.remove('hidden');
    historyEl.scrollTop = historyEl.scrollHeight;
}

init();
