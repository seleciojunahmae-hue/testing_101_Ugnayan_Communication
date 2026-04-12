/**
 * UGNAYAN | Barangay Communication System
 * Main Application Logic
 */

const app = {
    // Application State
    state: {
        currentUser: null, // 'resident' or 'admin'
        messages: [],
        broadcasts: [],
        feedbacks: [],
        logs: [],
        activeTab: 'new-message',
        selectedMessageId: null
    },

    // Initialize the application
    init() {
        this.loadData();
        this.updateDate();
        
        // Set up auto-refresh for "real-time" feel
        setInterval(() => {
            if (this.state.currentUser) {
                this.loadData();
                this.refreshCurrentView();
            }
        }, 5000);
    },

    // Data Management
    loadData() {
        const savedMessages = localStorage.getItem('ugnayan_messages');
        const savedBroadcasts = localStorage.getItem('ugnayan_broadcasts');
        const savedFeedbacks = localStorage.getItem('ugnayan_feedbacks');
        const savedLogs = localStorage.getItem('ugnayan_logs');

        this.state.messages = savedMessages ? JSON.parse(savedMessages) : [];
        this.state.broadcasts = savedBroadcasts ? JSON.parse(savedBroadcasts) : [];
        this.state.feedbacks = savedFeedbacks ? JSON.parse(savedFeedbacks) : [];
        this.state.logs = savedLogs ? JSON.parse(savedLogs) : [];
    },

    saveData() {
        localStorage.setItem('ugnayan_messages', JSON.stringify(this.state.messages));
        localStorage.setItem('ugnayan_broadcasts', JSON.stringify(this.state.broadcasts));
        localStorage.setItem('ugnayan_feedbacks', JSON.stringify(this.state.feedbacks));
        localStorage.setItem('ugnayan_logs', JSON.stringify(this.state.logs));
    },

    // Authentication
    login(role) {
        this.state.currentUser = role;
        
        // Update UI for role
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('app-screen').classList.add('active');
        
        const residentNav = document.getElementById('resident-nav');
        const adminNav = document.getElementById('admin-nav');
        const userRoleDisplay = document.getElementById('user-role-display');
        const userAvatar = document.getElementById('user-avatar-initial');

        if (role === 'admin') {
            residentNav.classList.add('hidden');
            adminNav.classList.remove('hidden');
            userRoleDisplay.textContent = 'Administrator';
            userAvatar.textContent = 'A';
            this.switchTab('inbox');
            this.addLog('System', 'Admin Login', 'Administrator accessed the system');
        } else {
            residentNav.classList.remove('hidden');
            adminNav.classList.add('hidden');
            userRoleDisplay.textContent = 'Resident';
            userAvatar.textContent = 'R';
            this.switchTab('new-message');
            this.addLog('Resident', 'User Login', 'A resident accessed the system');
        }

        this.showToast(`Welcome back, ${role}!`);
    },

    logout() {
        this.addLog(this.state.currentUser, 'Logout', 'User logged out of the system');
        this.state.currentUser = null;
        document.getElementById('app-screen').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
    },

    // Navigation
    switchTab(tabId) {
        this.state.activeTab = tabId;
        
        // Update Nav UI
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Find and activate the clicked nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('onclick').includes(`'${tabId}'`)) {
                item.classList.add('active');
            }
        });

        // Update Content UI
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`tab-${tabId}`).classList.add('active');

        // Update Header Title
        const titles = {
            'new-message': 'Send Message',
            'history': 'Conversation History',
            'feedback': 'Submit Feedback',
            'inbox': 'Resident Inquiries',
            'broadcast': 'Community Broadcasts',
            'logs': 'System Activity Logs'
        };
        document.getElementById('tab-title').textContent = titles[tabId] || 'Dashboard';

        // Refresh specific tab data
        this.refreshCurrentView();
    },

    refreshCurrentView() {
        if (this.state.activeTab === 'history') this.renderResidentHistory();
        if (this.state.activeTab === 'inbox') this.renderAdminInbox();
        if (this.state.activeTab === 'broadcast') this.renderBroadcasts();
        if (this.state.activeTab === 'logs') this.renderLogs();
    },

    // Resident Actions
    sendMessage(event) {
        event.preventDefault();
        const category = document.getElementById('msg-category').value;
        const content = document.getElementById('msg-content').value;

        const newMessage = {
            id: Date.now(),
            sender: 'Resident',
            category: category,
            content: content,
            timestamp: new Date().toLocaleString(),
            replies: [],
            status: 'Pending'
        };

        this.state.messages.unshift(newMessage);
        this.saveData();
        this.addLog('Resident', 'Sent Message', `Category: ${category}`);
        
        // Reset form and show success
        event.target.reset();
        this.showToast('Message sent to Barangay Office!');
        
        // Auto-reply simulation for "Inquiry"
        if (category === 'Inquiry') {
            setTimeout(() => this.simulateAutoReply(newMessage.id), 2000);
        }
    },

    simulateAutoReply(messageId) {
        const msgIndex = this.state.messages.findIndex(m => m.id === messageId);
        if (msgIndex !== -1) {
            const autoReply = {
                sender: 'System (Auto)',
                content: 'Thank you for your inquiry! Our staff will get back to you shortly. For urgent matters, please visit the Barangay Hall.',
                timestamp: new Date().toLocaleString()
            };
            this.state.messages[msgIndex].replies.push(autoReply);
            this.state.messages[msgIndex].status = 'Replied';
            this.saveData();
            if (this.state.activeTab === 'history') this.renderResidentHistory();
        }
    },

    submitFeedback(event) {
        event.preventDefault();
        const rating = document.querySelector('input[name="rating"]:checked')?.value || '5';
        const content = document.getElementById('feedback-content').value;

        const feedback = {
            id: Date.now(),
            rating: rating,
            content: content,
            timestamp: new Date().toLocaleString()
        };

        this.state.feedbacks.push(feedback);
        this.saveData();
        this.addLog('Resident', 'Submitted Feedback', `Rating: ${rating} stars`);
        
        event.target.reset();
        this.showToast('Thank you for your feedback!');
    },

    renderResidentHistory() {
        const container = document.getElementById('resident-chat-history');
        if (this.state.messages.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>No messages yet. Start a conversation!</p></div>';
            return;
        }

        let html = '';
        this.state.messages.forEach(msg => {
            html += `
                <div class="chat-bubble resident">
                    <span class="category-tag tag-${msg.category.toLowerCase()}">${msg.category}</span>
                    <p>${msg.content}</p>
                    <div class="chat-meta">
                        <span>You</span>
                        <span>${msg.timestamp}</span>
                    </div>
                </div>
            `;

            msg.replies.forEach(reply => {
                html += `
                    <div class="chat-bubble admin">
                        <p>${reply.content}</p>
                        <div class="chat-meta">
                            <span>${reply.sender}</span>
                            <span>${reply.timestamp}</span>
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    },

    // Admin Actions
    renderAdminInbox() {
        const listContainer = document.getElementById('admin-message-list');
        if (this.state.messages.length === 0) {
            listContainer.innerHTML = '<div class="empty-state"><p>No messages received.</p></div>';
            return;
        }

        let html = '';
        this.state.messages.forEach(msg => {
            const isActive = this.state.selectedMessageId === msg.id ? 'active' : '';
            html += `
                <div class="message-item ${isActive}" onclick="app.selectMessage(${msg.id})">
                    <h4>
                        <span>Resident</span>
                        <small>${msg.status}</small>
                    </h4>
                    <span class="category-tag tag-${msg.category.toLowerCase()}">${msg.category}</span>
                    <p>${msg.content}</p>
                    <small>${msg.timestamp}</small>
                </div>
            `;
        });
        listContainer.innerHTML = html;

        if (this.state.selectedMessageId) {
            this.renderMessageDetail();
        }
    },

    selectMessage(id) {
        this.state.selectedMessageId = id;
        this.renderAdminInbox();
    },

    renderMessageDetail() {
        const detailContainer = document.getElementById('admin-message-detail');
        const msg = this.state.messages.find(m => m.id === this.state.selectedMessageId);
        
        if (!msg) return;

        let repliesHtml = '';
        msg.replies.forEach(r => {
            repliesHtml += `
                <div class="chat-bubble ${r.sender.includes('Admin') ? 'resident' : 'admin'}" style="align-self: ${r.sender.includes('Admin') ? 'flex-end' : 'flex-start'}; background: ${r.sender.includes('Admin') ? 'var(--primary)' : '#f0f2f5'}; color: ${r.sender.includes('Admin') ? 'white' : 'black'}">
                    <p>${r.content}</p>
                    <div class="chat-meta"><span>${r.sender}</span> <span>${r.timestamp}</span></div>
                </div>
            `;
        });

        detailContainer.innerHTML = `
            <div class="detail-header">
                <h3>Conversation with Resident</h3>
                <span class="category-tag tag-${msg.category.toLowerCase()}">${msg.category}</span>
            </div>
            <div class="detail-body" style="display: flex; flex-direction: column; gap: 10px;">
                <div class="chat-bubble admin" style="background: #f0f2f5;">
                    <p>${msg.content}</p>
                    <div class="chat-meta"><span>Resident</span> <span>${msg.timestamp}</span></div>
                </div>
                ${repliesHtml}
            </div>
            <div class="detail-footer">
                <form onsubmit="app.adminReply(event, ${msg.id})">
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="admin-reply-input" placeholder="Type your reply..." required>
                        <button type="submit" class="btn-primary">Reply</button>
                    </div>
                </form>
            </div>
        `;
    },

    adminReply(event, msgId) {
        event.preventDefault();
        const content = document.getElementById('admin-reply-input').value;
        const msgIndex = this.state.messages.findIndex(m => m.id === msgId);

        if (msgIndex !== -1) {
            this.state.messages[msgIndex].replies.push({
                sender: 'Admin',
                content: content,
                timestamp: new Date().toLocaleString()
            });
            this.state.messages[msgIndex].status = 'Replied';
            this.saveData();
            this.addLog('Admin', 'Replied to Message', `To Message ID: ${msgId}`);
            this.renderAdminInbox();
            this.showToast('Reply sent!');
        }
    },

    sendBroadcast(event) {
        event.preventDefault();
        const title = document.getElementById('broadcast-title').value;
        const content = document.getElementById('broadcast-content').value;

        const broadcast = {
            id: Date.now(),
            title: title,
            content: content,
            timestamp: new Date().toLocaleString()
        };

        this.state.broadcasts.unshift(broadcast);
        this.saveData();
        this.addLog('Admin', 'Sent Broadcast', title);
        
        event.target.reset();
        this.renderBroadcasts();
        this.showToast('Broadcast announcement posted!');
    },

    renderBroadcasts() {
        const list = document.getElementById('broadcast-history-list');
        if (this.state.broadcasts.length === 0) {
            list.innerHTML = '<p class="text-muted">No broadcasts yet.</p>';
            return;
        }

        let html = '';
        this.state.broadcasts.forEach(b => {
            html += `
                <div class="card" style="border-left: 4px solid var(--accent); margin-bottom: 15px; padding: 15px;">
                    <h4 style="margin-bottom: 5px;">${b.title}</h4>
                    <p style="margin-bottom: 10px; font-size: 0.9rem;">${b.content}</p>
                    <small class="text-muted">${b.timestamp}</small>
                </div>
            `;
        });
        list.innerHTML = html;
    },

    // Logs & Utilities
    addLog(user, action, details) {
        const log = {
            timestamp: new Date().toLocaleString(),
            user: user,
            action: action,
            details: details
        };
        this.state.logs.unshift(log);
        this.saveData();
        if (this.state.activeTab === 'logs') this.renderLogs();
    },

    renderLogs() {
        const tbody = document.getElementById('logs-table-body');
        if (!tbody) return;

        let html = '';
        this.state.logs.slice(0, 50).forEach(log => {
            html += `
                <tr>
                    <td>${log.timestamp}</td>
                    <td><strong>${log.user}</strong></td>
                    <td>${log.action}</td>
                    <td>${log.details}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html || '<tr><td colspan="4" style="text-align:center">No logs available.</td></tr>';
    },

    clearLogs() {
        if (confirm('Are you sure you want to clear all system logs?')) {
            this.state.logs = [];
            this.saveData();
            this.renderLogs();
            this.showToast('Logs cleared.');
        }
    },

    updateDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString(undefined, options);
        }
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => app.init());