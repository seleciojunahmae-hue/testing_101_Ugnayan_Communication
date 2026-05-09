// Mock Data
const initialHistory = [
    {
        id: 1,
        date: "2026-05-08 09:00 AM",
        title: "Monthly Community Meeting",
        category: "Event",
        recipients: "All Residents",
        priority: "Normal",
        message: "Please join us for our monthly community meeting this Saturday at 2 PM in the Barangay Hall.",
        readRate: "78%"
    },
    {
        id: 2,
        date: "2026-05-07 02:30 PM",
        title: "Water Service Interruption",
        category: "Alert",
        recipients: "Purok 1, Purok 2",
        priority: "Urgent",
        message: "There will be a temporary water service interruption tomorrow from 8 AM to 12 PM due to pipe maintenance.",
        readRate: "92%"
    },
    {
        id: 3,
        date: "2026-05-05 10:15 AM",
        title: "Free Vaccination Drive",
        category: "Health",
        recipients: "All Residents",
        priority: "High",
        message: "Free flu vaccinations will be available at the health center starting Monday. Please bring your ID.",
        readRate: "65%"
    }
];

// State
let broadcastHistory = JSON.parse(localStorage.getItem('broadcast_history')) || initialHistory;

// DOM Elements
const historyBody = document.getElementById('history-body');
const broadcastForm = document.getElementById('broadcast-form');
const broadcastFormSection = document.getElementById('broadcast-form-section');
const newBroadcastBtn = document.getElementById('new-broadcast-btn');
const closeFormBtn = document.getElementById('close-form');
const previewBtn = document.getElementById('preview-btn');
const previewModal = document.getElementById('preview-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const confirmSendBtn = document.getElementById('confirm-send');
const searchHistory = document.getElementById('search-history');
const totalBroadcastsEl = document.getElementById('total-broadcasts');

// Initialize
function init() {
    renderHistory();
    updateStats();
    setupEventListeners();
}

function renderHistory() {
    const searchTerm = searchHistory.value.toLowerCase();
    const filtered = broadcastHistory.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        item.message.toLowerCase().includes(searchTerm)
    );

    historyBody.innerHTML = '';
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.date}</td>
            <td><strong>${item.title}</strong></td>
            <td><span class="category-tag">${item.category}</span></td>
            <td>${item.recipients}</td>
            <td>${item.readRate}</td>
            <td>
                <button class="btn-icon" onclick="viewBroadcast(${item.id})"><i class="far fa-eye"></i></button>
                <button class="btn-icon" onclick="deleteBroadcast(${item.id})"><i class="far fa-trash-alt"></i></button>
            </td>
        `;
        historyBody.appendChild(tr);
    });
}

function updateStats() {
    totalBroadcastsEl.textContent = broadcastHistory.length;
}

function setupEventListeners() {
    newBroadcastBtn.onclick = () => {
        broadcastFormSection.classList.remove('hidden');
        broadcastFormSection.scrollIntoView({ behavior: 'smooth' });
    };

    closeFormBtn.onclick = () => broadcastFormSection.classList.add('hidden');

    previewBtn.onclick = showPreview;

    closeModalBtns.forEach(btn => {
        btn.onclick = () => previewModal.classList.add('hidden');
    });

    broadcastForm.onsubmit = (e) => {
        e.preventDefault();
        sendBroadcast();
    };

    confirmSendBtn.onclick = sendBroadcast;

    searchHistory.oninput = renderHistory;
}

function showPreview() {
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const message = document.getElementById('message').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;

    if (!title || !message) {
        alert('Please fill in the title and message content.');
        return;
    }

    document.getElementById('preview-title').textContent = title;
    document.getElementById('preview-message').textContent = message;
    document.getElementById('preview-category-tag').textContent = category;
    
    const priorityTag = document.getElementById('preview-priority-tag');
    priorityTag.textContent = priority;
    priorityTag.className = `priority-tag ${priority.toLowerCase()}`;

    previewModal.classList.remove('hidden');
}

function sendBroadcast() {
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const recipients = document.getElementById('recipients').value;
    const message = document.getElementById('message').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;

    if (!title || !message) return;

    const newBroadcast = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        title,
        category,
        recipients,
        priority,
        message,
        readRate: "0%"
    };

    broadcastHistory.unshift(newBroadcast);
    localStorage.setItem('broadcast_history', JSON.stringify(broadcastHistory));
    
    broadcastForm.reset();
    broadcastFormSection.classList.add('hidden');
    previewModal.classList.add('hidden');
    
    renderHistory();
    updateStats();
    alert('Broadcast sent successfully!');
}

window.deleteBroadcast = (id) => {
    if (confirm('Are you sure you want to delete this broadcast record?')) {
        broadcastHistory = broadcastHistory.filter(item => item.id !== id);
        localStorage.setItem('broadcast_history', JSON.stringify(broadcastHistory));
        renderHistory();
        updateStats();
    }
};

window.viewBroadcast = (id) => {
    const item = broadcastHistory.find(i => i.id === id);
    if (item) {
        document.getElementById('preview-title').textContent = item.title;
        document.getElementById('preview-message').textContent = item.message;
        document.getElementById('preview-category-tag').textContent = item.category;
        
        const priorityTag = document.getElementById('preview-priority-tag');
        priorityTag.textContent = item.priority;
        priorityTag.className = `priority-tag ${item.priority.toLowerCase()}`;
        
        document.getElementById('preview-date').textContent = item.date;
        confirmSendBtn.classList.add('hidden');
        previewModal.classList.remove('hidden');
    }
};

init();
