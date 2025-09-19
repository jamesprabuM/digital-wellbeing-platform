// ===== SOCIAL VR THERAPY ROOMS =====
// Virtual reality group therapy with avatars, shared spaces, and peer support

class SocialVRTherapyRooms {
    constructor() {
        this.rooms = [];
        this.currentRoom = null;
        this.userAvatar = null;
        this.peers = [];
        this.isVRActive = false;
        this.xrSession = null;
        this.xrRefSpace = null;
        this.gl = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.avatarModels = {};
        this.roomList = [
            { id: 'forest', name: 'Forest Sanctuary', description: 'Nature-based group therapy in a calming forest', theme: 'forest' },
            { id: 'beach', name: 'Beach Retreat', description: 'Relaxing ocean-side group sessions', theme: 'beach' },
            { id: 'zen', name: 'Zen Garden', description: 'Mindful group meditation in a Japanese garden', theme: 'zen' },
            { id: 'aurora', name: 'Aurora Dome', description: 'Night sky and aurora for deep sharing', theme: 'aurora' }
        ];
        this.initUI();
    }

    initUI() {
        const section = document.querySelector('.wellness-tools') || document.querySelector('.dashboard') || document.body;
        const panel = document.createElement('div');
        panel.className = 'vr-therapy-panel';
        panel.innerHTML = `
            <h3><i class="fas fa-vr-cardboard"></i> Social VR Therapy Rooms</h3>
            <div class="vr-room-list">
                <h4>Available Rooms</h4>
                <div class="rooms-grid">
                    ${this.roomList.map(room => `
                        <div class="room-card" data-room="${room.id}">
                            <div class="room-icon">${this.getRoomIcon(room.theme)}</div>
                            <div class="room-info">
                                <h5>${room.name}</h5>
                                <p>${room.description}</p>
                            </div>
                            <button class="btn btn-primary join-room-btn" data-room="${room.id}">Join Room</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="vr-session-controls" id="vr-session-controls" style="display:none;">
                <h4>VR Session Active</h4>
                <div class="vr-room-info" id="vr-room-info"></div>
                <div class="vr-actions">
                    <button id="leave-vr-room" class="btn btn-danger"><i class="fas fa-sign-out-alt"></i> Leave Room</button>
                </div>
                <div class="vr-chat" id="vr-chat"></div>
            </div>
        `;
        section.appendChild(panel);
        // Event listeners
        panel.querySelectorAll('.join-room-btn').forEach(btn => {
            btn.onclick = (e) => this.joinRoom(e.target.dataset.room);
        });
        document.body.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'leave-vr-room') this.leaveRoom();
        });
    }

    getRoomIcon(theme) {
        const icons = {
            forest: '<i class="fas fa-tree"></i>',
            beach: '<i class="fas fa-umbrella-beach"></i>',
            zen: '<i class="fas fa-spa"></i>',
            aurora: '<i class="fas fa-moon"></i>'
        };
        return icons[theme] || '<i class="fas fa-circle"></i>';
    }

    async joinRoom(roomId) {
        this.currentRoom = this.roomList.find(r => r.id === roomId);
        if (!this.currentRoom) return;
        document.querySelector('.vr-room-list').style.display = 'none';
        document.getElementById('vr-session-controls').style.display = 'block';
        document.getElementById('vr-room-info').innerHTML = `<strong>Room:</strong> ${this.currentRoom.name}<br>${this.currentRoom.description}`;
        this.startVRSession();
        this.initChat();
    }

    leaveRoom() {
        this.currentRoom = null;
        document.querySelector('.vr-room-list').style.display = 'block';
        document.getElementById('vr-session-controls').style.display = 'none';
        this.endVRSession();
    }

    startVRSession() {
        // Placeholder: In production, use WebXR + Three.js for full VR
        this.isVRActive = true;
        // Show notification
        if (window.showNotification) window.showNotification('VR session started!', 'success');
    }

    endVRSession() {
        this.isVRActive = false;
        // Show notification
        if (window.showNotification) window.showNotification('VR session ended.', 'info');
    }

    initChat() {
        const chatDiv = document.getElementById('vr-chat');
        chatDiv.innerHTML = `
            <div class="vr-chat-messages" id="vr-chat-messages"></div>
            <div class="vr-chat-input">
                <input type="text" id="vr-chat-input-field" placeholder="Type a message..." />
                <button id="vr-chat-send" class="btn btn-primary"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;
        document.getElementById('vr-chat-send').onclick = () => this.sendChatMessage();
        document.getElementById('vr-chat-input-field').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
    }

    sendChatMessage() {
        const input = document.getElementById('vr-chat-input-field');
        const message = input.value.trim();
        if (!message) return;
        this.addChatMessage('You', message);
        input.value = '';
        // In production, broadcast to peers via WebRTC or WebSocket
    }

    addChatMessage(sender, message) {
        const messagesDiv = document.getElementById('vr-chat-messages');
        const msgElem = document.createElement('div');
        msgElem.className = 'vr-chat-message';
        msgElem.innerHTML = `<strong>${sender}:</strong> ${message}`;
        messagesDiv.appendChild(msgElem);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.socialVRTherapy = new SocialVRTherapyRooms();
    console.log('🕶️ Social VR Therapy Rooms loaded');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SocialVRTherapyRooms };
}
