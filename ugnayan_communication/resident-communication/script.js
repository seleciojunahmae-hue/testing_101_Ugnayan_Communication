document.addEventListener('DOMContentLoaded', () => {
    // Sample Data
    let announcements = [
        { id: 1, title: 'Typhoon Warning Signal #2', category: 'Alert', content: 'Typhoon Carina approaching. Please stay indoors and prepare emergency kits.', date: 'May 10, 2024' },
        { id: 2, title: 'Free Medical Mission', category: 'Health', content: 'Free check-ups and medicines available at the Barangay Health Center this Friday.', date: 'May 08, 2024' },
        { id: 3, title: 'Purok 1 & 2 Assembly', category: 'Event', content: 'Monthly community meeting to discuss security and waste management.', date: 'May 05, 2024' }
    ];

    let messages = [
        { id: 1, sender: 'Barangay Admin', lastMsg: 'Your document request has been approved.', time: '10:30 AM', history: [{sender: 'Admin', text: 'Your document request has been approved. You can pick it up tomorrow.', time: '10:30 AM'}] },
        { id: 2, sender: 'BHW - Maria', lastMsg: 'Don\'t forget the vaccination schedule.', time: 'Yesterday', history: [{sender: 'BHW', text: 'Don\'t forget the vaccination schedule for your child tomorrow.', time: 'Yesterday 09:00 AM'}] }
    ];

    let feedbacks = [
        { id: 1, category: 'Infrastructure', content: 'Broken street light near the main gate.', status: 'Pending', date: '2024-05-01' },
        { id: 2, category: 'Service', content: 'Excellent assistance during the permit application.', status: 'Resolved', date: '2024-04-25' }
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

    // Render Announcements
    const renderAnnouncements = () => {
        const list = document.getElementById('announcement-list');
        list.innerHTML = '';
        announcements.forEach(ann => {
            const card = document.createElement('div');
            card.className = 'announcement-card';
            card.innerHTML = `
                <div class="announcement-banner">
                    <span class="announcement-tag">${ann.category}</span>
                    <span class="announcement-date">${ann.date}</span>
                </div>
                <div class="announcement-body">
                    <h3>${ann.title}</h3>
                    <p>${ann.content}</p>
                </div>
            `;
            list.appendChild(card);
        });
    };

    // Render Message List
    const renderMessages = () => {
        const list = document.getElementById('resident-message-list');
        list.innerHTML = '';
        messages.forEach(msg => {
            const item = document.createElement('div');
            item.className = 'message-item';
            item.innerHTML = `
                <div class="msg-header">
                    <span class="msg-sender">${msg.sender}</span>
                    <span class="msg-time">${msg.time}</span>
                </div>
                <div class="msg-preview">${msg.lastMsg}</div>
            `;
            item.onclick = () => showMessageDetail(msg);
            list.appendChild(item);
        });
    };

    // Show Message Detail
    const showMessageDetail = (msg) => {
        const detailView = document.getElementById('message-detail-view');
        detailView.innerHTML = `
            <div class="detail-header">
                <div class="msg-sender">${msg.sender}</div>
                <div class="msg-time">Official Communication</div>
            </div>
            <div class="chat-history">
                ${msg.history.map(chat => `
                    <div class="chat-bubble ${chat.sender === 'Resident' ? 'bubble-sent' : 'bubble-received'}">
                        ${chat.text}
                        <span class="bubble-time">${chat.time}</span>
                    </div>
                `).join('')}
            </div>
            <div class="chat-input-area">
                <textarea id="reply-input" placeholder="Type a message..." rows="1"></textarea>
                <button class="btn-send" id="send-reply-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        const sendBtn = document.getElementById('send-reply-btn');
        const replyInput = document.getElementById('reply-input');

        sendBtn.onclick = () => {
            const text = replyInput.value.trim();
            if (text) {
                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                msg.history.push({ sender: 'Resident', text: text, time: now });
                msg.lastMsg = text;
                showMessageDetail(msg);
                renderMessages();
            }
        };
    };

    // Star Rating
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach(star => {
        star.onclick = () => {
            const rating = star.getAttribute('data-rating');
            document.getElementById('rating-value').value = rating;
            stars.forEach(s => {
                s.classList.toggle('active', s.getAttribute('data-rating') <= rating);
            });
        };
    });

    // Render Feedback History
    const renderFeedback = () => {
        const list = document.getElementById('fb-history-list');
        list.innerHTML = '';
        feedbacks.forEach(fb => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-meta">
                    <span class="status-badge status-${fb.status.toLowerCase()}">${fb.status}</span>
                    <span>${fb.date}</span>
                </div>
                <div class="history-title">${fb.category}</div>
                <div class="msg-preview">${fb.content}</div>
            `;
            list.appendChild(item);
        });
    };

    // Feedback Form Submission
    document.getElementById('feedback-form').onsubmit = (e) => {
        e.preventDefault();
        const newFb = {
            id: feedbacks.length + 1,
            category: document.getElementById('fb-category').value,
            content: document.getElementById('fb-content').value,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0]
        };
        feedbacks.unshift(newFb);
        renderFeedback();
        document.getElementById('feedback-form').reset();
        stars.forEach(s => s.classList.remove('active'));
        alert('Feedback submitted successfully!');
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
        const subject = document.getElementById('msg-subject').value;
        const body = document.getElementById('new-msg-body').value;
        
        const newMsg = {
            id: messages.length + 1,
            sender: 'Barangay Admin',
            lastMsg: body,
            time: 'Just now',
            history: [{sender: 'Resident', text: `Subject: ${subject}\n\n${body}`, time: 'Just now'}]
        };
        
        messages.unshift(newMsg);
        renderMessages();
        modal.style.display = 'none';
        document.getElementById('new-msg-form').reset();
        alert('Message sent to Admin!');
    };

    // Initial Render
    renderAnnouncements();
    renderMessages();
    renderFeedback();
});
