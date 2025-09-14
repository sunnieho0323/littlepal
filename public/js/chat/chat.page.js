// public/js/chat/chat.page.js
class ChatPage {
    constructor() {
        this.socket = null;
        this.currentUserId = 'demo_user'; // TODO: Get from auth
        this.isTyping = false;
        
        this.init();
    }

    init() {
        this.setupSocket();
        this.setupEventListeners();
        this.loadChatHistory();
    }

    setupSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to chat server');
            this.socket.emit('join', { userId: this.currentUserId });
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from chat server');
        });

        // Listen for new messages
        this.socket.on('newMessage', (message) => {
            this.displayMessage(message);
        });

        // Listen for typing indicators
        this.socket.on('typing', (data) => {
            this.showTypingIndicator(data.isTyping);
        });
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');

        // Send message on button click
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message on Enter key
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Typing indicator
        messageInput.addEventListener('input', () => {
            if (!this.isTyping && messageInput.value.trim()) {
                this.isTyping = true;
                this.socket.emit('typing', { isTyping: true });
                
                // Stop typing indicator after 2 seconds of no input
                clearTimeout(this.typingTimeout);
                this.typingTimeout = setTimeout(() => {
                    this.isTyping = false;
                    this.socket.emit('typing', { isTyping: false });
                }, 2000);
            }
        });
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const message = messageInput.value.trim();

        if (!message) return;

        // Disable input while sending
        messageInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        try {
            // Display user message immediately
            const userMessage = {
                id: Date.now(),
                message: message,
                isUser: true,
                timestamp: new Date()
            };
            this.displayMessage(userMessage);

            // Clear input
            messageInput.value = '';
            this.isTyping = false;
            this.socket.emit('typing', { isTyping: false });

            // Show typing indicator for AI
            this.showTypingIndicator(true);

            // Send to backend
            const response = await ChatAPI.sendMessage(message);
            
            if (response.ok) {
                // Display AI response
                const aiMessage = {
                    id: Date.now() + 1,
                    message: response.result.message,
                    isUser: false,
                    timestamp: new Date()
                };
                this.displayMessage(aiMessage);
                
                // Update cat emotion based on detected user emotion
                console.log('Detected emotion:', response.result.userEmotion);
                if (response.result.userEmotion) {
                    this.updateCatEmotion(response.result.userEmotion);
                }
            } else {
                throw new Error(response.error || 'Failed to send message');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Failed to send message. Please try again.');
        } finally {
            // Re-enable input
            messageInput.disabled = false;
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
            this.showTypingIndicator(false);
            messageInput.focus();
        }
    }

    displayMessage(message) {
        const conversationArea = document.getElementById('conversationArea');
        const messageElement = this.createMessageElement(message);
        
        conversationArea.appendChild(messageElement);
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const speechBubble = document.createElement('div');
        speechBubble.className = `speech-bubble ${message.isUser ? 'user' : 'cat'}`;
        
        const speechText = document.createElement('p');
        speechText.className = 'speech-text';
        speechText.textContent = message.message;
        
        speechBubble.appendChild(speechText);
        return speechBubble;
    }

    // Update cat image based on detected emotion
    updateCatEmotion(emotion) {
        console.log('Updating cat emotion to:', emotion);
        const catImage = document.getElementById('catImage');
        if (!catImage) {
            console.log('Cat image element not found');
            return;
        }

        // Map emotions to different cat images
        const emotionImages = {
            'happy': '/img/monster_cat_happy.png',
            'sad': '/img/monster_cat_sad.png',
            'angry': '/img/monster_cat_angry.png',
            'confused': '/img/monster_cat_confused.png',
            'worried': '/img/monster_cat_worried.png',
            'neutral': '/img/monster_cat.png'
        };

        const newImageSrc = emotionImages[emotion] || '/img/monster_cat.png';
        console.log('Changing cat image from', catImage.src, 'to', newImageSrc);
        
        // Add transition effect
        catImage.style.opacity = '0.7';
        catImage.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            catImage.src = newImageSrc;
            catImage.style.opacity = '1';
            catImage.style.transform = 'scale(1)';
            console.log('Cat image updated to:', catImage.src);
        }, 150);
    }

    showTypingIndicator(show) {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = show ? 'block' : 'none';
        
        if (show) {
            this.scrollToBottom();
        }
    }

    async loadChatHistory() {
        try {
            const response = await ChatAPI.getMessages();
            if (response.ok && response.messages && response.messages.length > 0) {
                // Clear welcome message
                const conversationArea = document.getElementById('conversationArea');
                const welcomeBubble = conversationArea.querySelector('.speech-bubble');
                if (welcomeBubble) {
                    welcomeBubble.remove();
                }
                
                // Display chat history
                response.messages.forEach(message => {
                    this.displayMessage(message);
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    showError(message) {
        // Create error message element
        const errorMessage = {
            id: Date.now(),
            message: `❌ ${message}`,
            isUser: false,
            timestamp: new Date()
        };
        this.displayMessage(errorMessage);
    }

    scrollToBottom() {
        const conversationArea = document.getElementById('conversationArea');
        conversationArea.scrollTop = conversationArea.scrollHeight;
    }
}

// Global function for back button
function goBack() {
    window.location.href = '/';
}

// Initialize chat page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatPage();
});
