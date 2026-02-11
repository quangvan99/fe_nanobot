let sessions = [];

// Clean up invalid sessions - No longer needed as we load fresh from backend
// sessions = sessions.filter(s => s.id && s.id !== 'undefined' && s.id !== 'null');
// localStorage.setItem('nanobot_sessions', JSON.stringify(sessions));

const messagesDiv = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const statusEl = document.getElementById('status');
const sessionsListDiv = document.getElementById('sessionsList');

// Session Management
async function createNewSession() {
    const sessionName = prompt('Enter session name (alphanumeric + hyphens only):', `session-${Date.now()}`);
    if (!sessionName) return;

    // Sanitize session name
    const sanitizedName = sessionName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    try {
        // Register session with backend
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sessions}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: sanitizedName,
                name: sessionName
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Session registered:', data);
        } else if (response.status === 409) {
            // Session already exists, that's ok
            console.log('Session already exists in backend');
        } else {
            console.error('Failed to register session:', await response.text());
        }
    } catch (err) {
        console.error('Failed to register session with backend:', err);
        // Continue anyway, will auto-register on first message
    }

    const newSession = {
        id: sanitizedName,
        name: sessionName,
        messages: [],
        createdAt: new Date().toISOString()
    };

    sessions.push(newSession);
    // REMOVED: localStorage.setItem('nanobot_sessions', JSON.stringify(sessions));

    renderSessions();
    switchToSession(newSession.id);
}

function deleteSession(sessionIdToDelete, event) {
    // This function is deprecated, use deleteSessionById instead
    if (event) event.stopPropagation();
    deleteSessionById(sessionIdToDelete);
}

function switchToSession(sessionIdToSwitch) {
    const session = sessions.find(s => s.id === sessionIdToSwitch);
    if (!session) return;

    // Save current session ID
    setCurrentSessionId(sessionIdToSwitch);

    // Load chat history from backend
    loadChatHistory(sessionIdToSwitch);

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
        // REMOVED: localStorage.setItem('nanobot_sessions', JSON.stringify(sessions));
    }
}

function renderSessions() {
    const currentId = getCurrentSessionId();
    sessionsListDiv.innerHTML = sessions.map(session => {
        const sessionName = session.name || session.id || 'Unnamed';
        const sessionId = session.id || '';
        const isActive = session.id === currentId;

        return `
            <div class="session-item ${isActive ? 'active' : ''}" onclick="switchToSession('${sessionId}')">
                <div class="session-name">${sessionName}</div>
                <button class="delete-session-btn" onclick="event.stopPropagation(); deleteSessionById('${sessionId}')">×</button>
            </div>
        `;
    }).join('');
}

// Helper function for deleting session (called from HTML onclick)
async function deleteSessionById(sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    if (!confirm(`Delete "${session.name || sessionId}"?`)) return;

    // Delete from backend first
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sessions}/${encodeURIComponent(sessionId)}`, {
            method: 'DELETE'
        });

        if (!response.ok && response.status !== 404) {
            console.error('Failed to delete session from backend:', await response.text());
            alert('Failed to delete session from backend. Please try again.');
            return;
        }

        console.log('Session deleted from backend:', sessionId);
    } catch (err) {
        console.error('Failed to delete session from backend:', err);
        alert('Network error. Failed to delete session from backend.');
        return;
    }

    // Remove from local memory only (not persistent storage)
    sessions = sessions.filter(s => s.id !== sessionId);
    // REMOVED: localStorage.setItem('nanobot_sessions', JSON.stringify(sessions));

    // If deleting current session, switch to first available or create new
    if (getCurrentSessionId() === sessionId) {
        if (sessions.length > 0) {
            switchToSession(sessions[0].id);
        } else {
            localStorage.removeItem('nanobot_current_session');
            messagesDiv.innerHTML = '<div class="message assistant">Hi! I\'m your NanoBot assistant. How can I help you today?</div>';
        }
    }

    renderSessions();
}

async function sendMessage() {
    const message = inputEl.value.trim();
    if (!message) return;

    let currentSession = getCurrentSession();

    // If no active session, create one automatically
    if (!currentSession) {
        const sessionId = `session-${Date.now()}`;
        const newSession = {
            id: sessionId,
            name: sessionId,
            messages: [],
            createdAt: new Date().toISOString()
        };
        sessions.push(newSession);
        // REMOVED: localStorage.setItem('nanobot_sessions', JSON.stringify(sessions));
        setCurrentSessionId(sessionId);
        renderSessions();
        currentSession = newSession;
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
                sessionId: currentSession.id
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Log performance metrics
            if (data._debug && data._debug.timings) {
                console.log(`⚡ Request completed in ${data._debug.timings.total}ms`, data._debug.timings);
            }
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
            console.error('API server is not responding');
            return;
        }
    } catch (err) {
        console.error('Cannot connect to API server:', err);
    }
}

// Load registered sessions from backend (Deprecated/Removed duplicate function)
// was: async function loadRegisteredSessions() ...

// Load chat history from backend
async function loadChatHistory(sessionId) {
    if (!sessionId) {
        messagesDiv.innerHTML = '<div class="message assistant">Hi! I\'m your NanoBot assistant. How can I help you today?</div>';
        return;
    }

    try {
        // Add timestamp to prevent browser caching
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.history}?sessionId=${encodeURIComponent(sessionId)}&_t=${Date.now()}`);
        if (!response.ok) {
            messagesDiv.innerHTML = '<div class="message assistant">Hi! I\'m your NanoBot assistant. How can I help you today?</div>';
            return;
        }

        const data = await response.json();
        const session = sessions.find(s => s.id === sessionId);

        if (session) {
            if (data.messages && data.messages.length > 0) {
                // Load from backend
                session.messages = data.messages.map(msg => ({
                    type: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                    timestamp: msg.timestamp
                }));
                // REMOVED: localStorage.setItem('nanobot_sessions', JSON.stringify(sessions));

                // Refresh messages display
                messagesDiv.innerHTML = '';
                session.messages.forEach(msg => {
                    addMessage(msg.type, msg.content, false); // false = don't save to session again
                });
            } else {
                // No messages in backend, show welcome message
                messagesDiv.innerHTML = '<div class="message assistant">Hi! I\'m your NanoBot assistant. How can I help you today?</div>';
                session.messages = [];
                // REMOVED: localStorage.setItem('nanobot_sessions', JSON.stringify(sessions));
            }
        }
    } catch (err) {
        console.error('Failed to load chat history:', err);
        messagesDiv.innerHTML = '<div class="message assistant">Hi! I\'m your NanoBot assistant. How can I help you today?</div>';
    }
}

// Initialize
async function initialize() {
    // CLEANUP: Force remove old local storage data to ensure no caching
    localStorage.removeItem('nanobot_sessions');

    // Load sessions from backend
    await checkHealth();
    await loadSessionsFromBackend();

    renderSessions();

    // Clean up any undefined current session
    const currentId = getCurrentSessionId();
    if (!currentId || currentId === 'undefined' || currentId === 'null') {
        localStorage.removeItem('nanobot_current_session');
    }

    // Determine which session to switch to
    if (sessions.length === 0) {
        // Show welcome message, don't force user to create session
        messagesDiv.innerHTML = '<div class="message assistant">Hi! I\'m your NanoBot assistant. How can I help you today?</div>';
    } else {
        // Load the current session or switch to most recent one
        const validCurrentId = getCurrentSessionId();
        const sessionExists = sessions.find(s => s.id === validCurrentId);

        if (validCurrentId && validCurrentId !== 'undefined' && validCurrentId !== 'null' && sessionExists) {
            loadChatHistory(validCurrentId);
        } else {
            // Switch to the most recent session (last in array)
            const mostRecentSession = sessions[sessions.length - 1];
            switchToSession(mostRecentSession.id);
        }
    }

    inputEl.focus();
}

// Load sessions from backend API
async function loadSessionsFromBackend() {
    try {
        // Add timestamp to prevent browser caching
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sessions}?_t=${Date.now()}`);
        if (!response.ok) {
            console.error('Failed to load sessions from backend');
            return;
        }

        const data = await response.json();
        if (data.sessions && Array.isArray(data.sessions)) {
            // Map backend sessions directly
            sessions = data.sessions.map(s => ({
                id: s.id || s.folder, // Handle both new (id) and old (folder) API formats
                name: s.name,
                messages: [], // We'll load messages when switching to the session
                createdAt: s.createdAt || new Date().toISOString()
            }));

            // No longer merging with local storage or saving to it
            console.log('Loaded sessions from backend:', sessions.length);
        }
    } catch (err) {
        console.error('Failed to load sessions from backend:', err);
    }
}

initialize();
