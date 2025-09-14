// public/js/chat/chat.api.js
class ChatAPI {
    static baseURL = '/api/chat';

    static async sendMessage(message) {
        try {
            const response = await fetch(`${this.baseURL}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending message:', error);
            return {
                ok: false,
                error: error.message
            };
        }
    }

    static async getMessages() {
        try {
            const response = await fetch(`${this.baseURL}/messages`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting messages:', error);
            return {
                ok: false,
                error: error.message,
                messages: []
            };
        }
    }

    static async clearChat() {
        try {
            const response = await fetch(`${this.baseURL}/clear`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error clearing chat:', error);
            return {
                ok: false,
                error: error.message
            };
        }
    }
}
