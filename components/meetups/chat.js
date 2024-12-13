import { useState } from 'react';

const Chat = () => {
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const handleSend = async () => {
        if (!userInput.trim()) return;
    
        const currentInput = userInput;
        setUserInput('');
        setChatHistory((prev) => [...prev, { role: 'user', content: currentInput }]);
    
        try {
            const response = await fetch('/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: currentInput }),
            });
    
            const data = await response.json();
            const botResponse = data.response || "No response from bot"; // Fallback message
    
            setChatHistory((prev) => [...prev, { role: 'bot', content: botResponse }]);
        } catch (error) {
            console.error(error);
            setChatHistory((prev) => [...prev, { role: 'bot', content: 'Error occurred.' }]);
        }
    };
    


    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Chat with GPT</h1>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                {chatHistory.map((entry, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                        <strong>{entry.role === 'user' ? 'You' : 'Bot'}:</strong> {entry.content}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a message..."
                style={{ width: '100%', padding: '10px' }}
            />
            <button onClick={handleSend} style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
                Send
            </button>
        </div>
    );
};

export default Chat;
