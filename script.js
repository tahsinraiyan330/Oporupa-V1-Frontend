document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');

    // --- Configuration ---
    // ⚠️ IMPORTANT: REPLACE THIS PLACEHOLDER WITH YOUR LIVE RENDER BACKEND URL ⚠️
    const BACKEND_URL = 'https://oporupa-backend.onrender.com'; 

    let sessionId = localStorage.getItem('oporupa_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('oporupa_session_id', sessionId);
    }
    
    // --- Message Display Function ---
    // This function is the source of the error. We are simplifying its class handling.
    function addMessage(text, sender, is_loading = false) {
        const messageDiv = document.createElement('div');
        
        // Always add the base message class
        messageDiv.classList.add('chat-message'); 
        
        // Add the sender-specific class
        if (sender === 'user') {
            messageDiv.classList.add('user-message');
        } else if (sender === 'bot') {
            messageDiv.classList.add('bot-message');
        }
        
        // Add the specific loading class if requested
        if (is_loading) {
            // This is the clean, single class name that fixes the InvalidCharacterError
            messageDiv.classList.add('bot-loading-message'); 
        }

        messageDiv.innerHTML = `<p>${text}</p>`;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; 
        return messageDiv;
    }


    // --- Event Listener for Form Submission ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            // 1. Display user message immediately
            addMessage(message, 'user');
            userInput.value = '';
            
            // 2. Display a loading message (using the new is_loading flag)
            const loadingMessage = addMessage('Oporupa is thinking...', 'bot', true); 
            userInput.disabled = true; 
            chatForm.querySelector('button').disabled = true;

            // 3. Get the response from the live backend
            const botResponse = await getBotResponse(message);
            
            // 4. Clean up and display the final response
            loadingMessage.remove();
            addMessage(botResponse, 'bot', false);
            
            userInput.disabled = false; 
            chatForm.querySelector('button').disabled = false;
            userInput.focus();
        }
    });

    // --- API Communication Function ---
    async function getBotResponse(userMessage) {
        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId 
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();
            
            if (response.ok) {
                return data.bot_response; 
            } else {
                console.error("Backend Error:", data.bot_response);
                return data.bot_response || `Server Error (${response.status}). Check server logs.`;
            }

        } catch (error) {
            console.error('Error fetching response:', error);
            return 'দুঃখিত, সংযোগ স্থাপন করা সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন। (Connection error.)';
        }
    }
});
