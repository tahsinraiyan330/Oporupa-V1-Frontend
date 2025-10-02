document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');

    // --- Configuration ---
    // ⚠️ IMPORTANT: REPLACE THIS PLACEHOLDER WITH YOUR LIVE RENDER BACKEND URL ⚠️
    const BACKEND_URL = 'https://oporupa-backend.onrender.com/'; 

    // Initialize a unique session ID for persistent conversation history
    let sessionId = localStorage.getItem('oporupa_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('oporupa_session_id', sessionId);
    }
    
    // --- Event Listener for Form Submission ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            // 1. Display user message immediately
            addMessage(message, 'user');
            userInput.value = '';
            
            // 2. Display a loading message
            // FIX: The class name is now 'bot-loading' to prevent the InvalidCharacterError
            const loadingMessage = addMessage('Oporupa is thinking...', 'bot-loading'); 
            userInput.disabled = true; 
            chatForm.querySelector('button').disabled = true;

            // 3. Get the response from the live backend
            const botResponse = await getBotResponse(message);
            
            // 4. Clean up and display the final response
            loadingMessage.remove();
            addMessage(botResponse, 'bot');
            
            userInput.disabled = false; 
            chatForm.querySelector('button').disabled = false;
            userInput.focus();
        }
    });

    // --- Message Display Function ---
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        
        // This line constructs the class string based on the sender argument.
        // It must ensure that 'sender' does not contain spaces when used here.
        messageDiv.classList.add('chat-message', `${sender}-message`);
        
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; 
        return messageDiv;
    }

    // --- API Communication Function (Connects to Render) ---
    async function getBotResponse(userMessage) {
        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Pass the session ID for conversation history management
                    'X-Session-ID': sessionId 
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();
            
            if (response.ok) {
                return data.bot_response; 
            } else {
                // Handle errors returned by your Flask server (e.g., 400, 500)
                console.error("Backend Error:", data.bot_response);
                return data.bot_response || `Server Error (${response.status}). Check server logs.`;
            }

        } catch (error) {
            // Handle network/CORS errors
            console.error('Error fetching response:', error);
            return 'দুঃখিত, সংযোগ স্থাপন করা সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন। (Connection error.)';
        }
    }
});
