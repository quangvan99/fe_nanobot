let sessions = JSON.parse(localStorage.getItem('nanobot_sessions') || '[]');
const messagesDiv = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const statusEl = document.getElementById('status');
const sessionsListDiv = document.getElementById('sessionsList');

// Session Management
function createNewSession() {
    const sessionName = prompt('Enter session name:', `Session ${sessions.length + 1}`);
    if (!sessionName) return;

    const newSession = {
        id: Date.now().toString(),
        name: sessionName,
        messages: [],
        createdAt: new Date().toISOString()
    };

    sessions.push(newSession);
    localStorage.setItem('nanobot_sessions', JSON.stringify(sessions));

    renderSessions();
    switchToSession(newSession.id);
}

function deleteSession(sessionIdToDelete, event) {
    event.stopPropagation();

    const session = sessions.find(s => s.id === sessionIdToDelete);
    if (!session) return;

    if (!confirm(`Delete "${session.name}"?`)) return;

    sessions = sessions.filter(s => s.id !== sessionIdToDelete);
    localStorage.setItem('nanobot_sessions', JSON.stringify(sessions));

    // If deleting current session, switch to first available or create new
    if (getCurrentSessionId() === sessionIdToDelete) {
        if (sessions.length > 0) {
            switchToSession(sessions[0].id);
        } else {
            localStorage.removeItem('nanobot_current_session');
            messagesDiv.innerHTML = '<div class="message assistant">Hi! I\'m your NanoBot assistant. How can I help you today?</div>';
        }
    }

    renderSessions();
}

function switchToSession(sessionIdToSwitch) {
    const session = sessions.find(s => s.id === sessionIdToSwitch);
    if (!session) return;

    // Save current session ID
    setCurrentSessionId(sessionIdToSwitch);

    // Clear messages and load session messages
    messagesDiv.innerHTML = '';
    if (session.messages.length === 0) {
        messagesDiv.innerHTML = '<div class="message assistant">Hi! I\'m your NanoBot assistant. How can I help you today?</div>';
    } else {
        session.messages.forEach(msg => {
            addMessage(msg.type, msg.content, false);
        });
    }

    renderSessions();
}

function getCurrentSessionId() {
    return localStorage.getItem('nanobot_current_session');
}

function setCurrentSessionId(id) {
    localStorage.setItem('nanobot_current_session', id);
}

function getCurrentSession() {
    const currentId = getCurrentSessionId();
    return sessions.find(s => s.id === currentId);
}

function saveMessageToSession(type, content) {
    const currentSession = getCurrentSession();
    if (currentSession) {
        currentSession.messages.push({ type, content });
        localStorage.setItem('nanobot_sessions', JSON.stringify(sessions));
    }
}

function renderSessions() {
    const currentId = getCurrentSessionId();
    sessionsListDiv.innerHTML = sessions.map(session => `
        <div class="session-item ${session.id === currentId ? 'active' : ''}" onclick="switchToSession('${session.id}')">
            <div class="session-name">${session.name}</div>
            <button class="delete-session-btn" onclick="deleteSession('${session.id}', event)">×</button>
        </div>
    `).join('');
}

async function sendMessage() {
    const message = inputEl.value.trim();
    if (!message) return;

    const currentSession = getCurrentSession();
    if (!currentSession) {
        addMessage('error', 'No active session');
        return;
    }

    // Add user message to UI
    addMessage('user', message);
    inputEl.value = '';
    inputEl.disabled = true;
    sendBtn.disabled = true;
    showStatus('Thinking...');

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.message}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                sessionId: currentSession.id // Use session ID directly
            })
        });

        const data = await response.json();

        if (response.ok) {
            addMessage('assistant', data.reply);
        } else {
            addMessage('error', `Error: ${data.error || 'Unknown error'}`);
        }
    } catch (err) {
        addMessage('error', `Network error: ${err.message}`);
    } finally {
        inputEl.disabled = false;
        sendBtn.disabled = false;
        hideStatus();
        inputEl.focus();
    }
}

function addMessage(type, content, saveToSession = true) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = content;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    if (saveToSession) {
        saveMessageToSession(type, content);
    }
}

function showStatus(text) {
    statusEl.innerHTML = `<span class="loading"></span> ${text}`;
    statusEl.style.display = 'block';
}

function hideStatus() {
    statusEl.style.display = 'none';
}

// Check API health
async function checkHealth() {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`);
        if (!response.ok) {
            addMessage('error', 'API server is not responding');
        }
    } catch (err) {
        addMessage('error', 'Cannot connect to API server');
    }
}

// Initialize
checkHealth();
renderSessions();

// If no sessions exist, create a default one
if (sessions.length === 0) {
    createNewSession();
}

inputEl.focus();
