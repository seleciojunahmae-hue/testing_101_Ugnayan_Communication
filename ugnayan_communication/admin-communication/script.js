document.addEventListener('DOMContentLoaded', () => {
    // Sample Data
    let messages = [
        { id: 1, sender: 'Maria Santos', avatar: 'https://ui-avatars.com/api/?name=Maria+Santos', lastMsg: 'I would like to inquire about the document requirements.', time: '10:30 AM', status: 'unread', history: [{sender: 'Maria Santos', text: 'I would like to inquire about the document requirements.', time: '10:30 AM'}] },
        { id: 2, sender: 'Carlos Mendoza', avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza', lastMsg: 'Thank you for the quick response!', time: 'Yesterday', status: 'replied', history: [{sender: 'Carlos Mendoza', text: 'Is the barangay hall open tomorrow?', time: 'Yesterday 09:00 AM'}, {sender: 'Admin', text: 'Yes, we are open from 8 AM to 5 PM.', time: 'Yesterday 10:15 AM'}, {sender: 'Carlos Mendoza', text: 'Thank you for the quick response!', time: 'Yesterday 10:20 AM'}] },
        { id: 3, sender: 'Lucia Bautista', avatar: 'https://ui-avatars.com/api/?name=Lucia+Bautista', lastMsg: 'The street light in Purok 2 is broken.', time: '2 days ago', status: 'replied', history: [{sender: 'Lucia Bautista', text: 'The street light in Purok 2 is broken.', time: '2 days ago'}] }
    ];

    let broadcasts = [
        { id: 1, title: 'Typhoon Warning Signal #2', category: 'Alert', priority: 'Urgent', content: 'Typhoon Carina approaching. Please stay indoors.', time: '2024-01-25', readRate: '85%' },
        { id: 2, title: 'Barangay Fiesta Celebration', category: 'Event', priority: 'Normal', content: 'Join us this coming Saturday for the annual fiesta.', time: '2024-01-20', readRate: '62%' }
    ];

    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Render Message List
    const renderMessages = (filter = 'all') => {
        const list = document.getElementById('admin-message-list');
        list.innerHTML = '';
        
        const filtered = messages.filter(m => filter === 'all' || m.status === filter);
        
        filtered.forEach(msg => {
            const item = document.createElement('div');
            item.className = `message-item ${msg.status === 'unread' ? 'unread' : ''}`;
            item.innerHTML = `
                <div class="msg-header">
                    <span class="msg-sender">${msg.sender}</span>
                    <span class="msg-time">${msg.time}</span>
                </div>
                <div class="msg-preview">${msg.lastMsg}</div>
                <span class="status-badge status-${msg.status}">${msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}</span>
            `;
            item.onclick = () => showMessageDetail(msg);
            list.appendChild(item);
        });
    };

    // Show Message Detail
    const showMessageDetail = (msg) => {
        const detailView = document.getElementById('message-detail-view');
        
        // Update active state in list
        document.querySelectorAll('.message-item').forEach(item => item.classList.remove('active'));
        event.currentTarget.classList.add('active');

        detailView.innerHTML = `
            <div class="detail-header">
                <div class="detail-user-info">
                    <img src="${msg.avatar}" alt="User">
                    <div>
                        <div class="msg-sender">${msg.sender}</div>
                        <div class="msg-time">Online</div>
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn-secondary" onclick="deleteMessage(${msg.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="chat-history" id="chat-history">
                ${msg.history.map(chat => `
                    <div class="chat-bubble ${chat.sender === 'Admin' ? 'bubble-sent' : 'bubble-received'}">
                        ${chat.text}
                        <span class="bubble-time">${chat.time}</span>
                    </div>
                `).join('')}
            </div>
            <div class="chat-input-area">
                <textarea id="reply-input" placeholder="Type a reply..." rows="1"></textarea>
                <button class="btn-send" id="send-reply-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        // Reply Functionality
        const sendBtn = document.getElementById('send-reply-btn');
        const replyInput = document.getElementById('reply-input');

        sendBtn.onclick = () => {
            const text = replyInput.value.trim();
            if (text) {
                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                msg.history.push({ sender: 'Admin', text: text, time: now });
                msg.status = 'replied';
                msg.lastMsg = text;
                showMessageDetail(msg);
                renderMessages();
            }
        };
    };

    // Render Broadcast History
    const renderBroadcasts = () => {
        const list = document.getElementById('bc-history-list');
        list.innerHTML = '';
        
        broadcasts.forEach(bc => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-meta">
                    <span class="bc-tag tag-${bc.category.toLowerCase()}">${bc.category}</span>
                    <span class="msg-time">${bc.time}</span>
                </div>
                <div class="history-title">${bc.title}</div>
                <div class="msg-preview">${bc.content}</div>
                <div class="history-stats">
                    <span><i class="fas fa-eye"></i> ${bc.readRate} Read Rate</span>
                    <span><i class="fas fa-signal"></i> ${bc.priority} Priority</span>
                </div>
            `;
            list.appendChild(item);
        });
    };

    // Broadcast Form Submission
    const bcForm = document.getElementById('broadcast-form');
    bcForm.onsubmit = (e) => {
        e.preventDefault();
        const newBc = {
            id: broadcasts.length + 1,
            title: document.getElementById('bc-title').value,
            category: document.getElementById('bc-category').value,
            priority: document.getElementById('bc-priority').value,
            content: document.getElementById('bc-content').value,
            time: new Date().toISOString().split('T')[0],
            readRate: '0%'
        };
        broadcasts.unshift(newBc);
        renderBroadcasts();
        bcForm.reset();
        alert('Broadcast sent successfully!');
    };

    // Modal Logic
    const modal = document.getElementById('new-msg-modal');
    const newMsgBtn = document.getElementById('new-msg-btn');
    const closeBtn = document.querySelector('.close');

    newMsgBtn.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    document.getElementById('new-msg-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('recipient-name').value;
        const body = document.getElementById('new-msg-body').value;
        
        const newMsg = {
            id: messages.length + 1,
            sender: name,
            avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}`,
            lastMsg: body,
            time: 'Just now',
            status: 'unread',
            history: [{sender: name, text: body, time: 'Just now'}]
        };
        
        messages.unshift(newMsg);
        renderMessages();
        modal.style.display = 'none';
        document.getElementById('new-msg-form').reset();
    };

    // Filter Logic
    document.getElementById('msg-filter').onchange = (e) => {
        renderMessages(e.target.value);
    };

    // Initial Render
    renderMessages();
    renderBroadcasts();
});

function deleteMessage(id) {
    if(confirm('Are you sure you want to delete this conversation?')) {
        // In a real app, you'd filter the messages array and re-render
        alert('Message deleted');
        location.reload();
    }
}
