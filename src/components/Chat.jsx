import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';

const Chat = ({ roomId, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null); // Added to reference the messages container
  const pollInterval = useRef(null);
  const isUserAtBottom = useRef(true);
  const justSentMessage = useRef(false); // Track if the user just sent a message

  const fetchMessages = useCallback(async () => {
    try {
      const response = await api.get(`/rooms/${roomId}/messages`);
      if (Array.isArray(response.data)) {
        setMessages(response.data);
      } else {
        console.warn('Unexpected response data for messages:', response.data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [roomId]);

  useEffect(() => {
    // Initial fetch of messages
    fetchMessages();

    // Set up polling every 2 seconds
    pollInterval.current = setInterval(fetchMessages, 2000);

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [fetchMessages]);

  // Track scroll position to determine if user is near bottom
  const onScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Consider user at bottom if within 50px of bottom
      isUserAtBottom.current = scrollHeight - scrollTop - clientHeight < 50;
    }
  };

  // Scroll to bottom when new messages arrive or user sends a message
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // If user is near bottom or just sent a message, scroll to bottom
    if (isUserAtBottom.current || justSentMessage.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      justSentMessage.current = false; // Reset after scrolling
    }
  }, [messages]);

  // Allow user to scroll up and see all chats without auto-scrolling down
  // Only auto-scroll if user is near bottom or just sent a message
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleUserScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Update isUserAtBottom ref based on scroll position
      isUserAtBottom.current = scrollHeight - scrollTop - clientHeight < 50;
    };

    container.addEventListener('scroll', handleUserScroll);

    // Cleanup listener on unmount
    return () => {
      container.removeEventListener('scroll', handleUserScroll);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(`/rooms/${roomId}/messages`, {
        content: newMessage,
        userId: user._id
      });

      // Set flag to ensure scroll to bottom after sending
      justSentMessage.current = true;
      // Fetch messages immediately after posting
      await fetchMessages();
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat">
      <style>
        {`
          /* Chat Internal CSS */
          
          /* Root variables for theming */
          :root {
            --primary-color: #0066cc; /* Bright blue for primary actions */
            --primary-hover: #004d99;
            --background-color: #f7f9fa; /* Light gray background */
            --card-background: #ffffff; /* White for cards */
            --text-primary: #212121; /* Dark gray for main text */
            --text-secondary: #424242; /* Medium gray for secondary text */
            --text-muted: #616161; /* Lighter gray for muted text */
            --border-color: #bdbdbd; /* Neutral border */
            --shadow-light: 0 3px 6px rgba(0, 0, 0, 0.1);
            --shadow-medium: 0 5px 10px rgba(0, 0, 0, 0.15);
            --shadow-hover: 0 8px 16px rgba(0, 0, 0, 0.2);
            --border-radius: 10px;
            --border-radius-sm: 6px;
            --spacing-xs: 6px;
            --spacing-sm: 12px;
            --spacing-md: 20px;
            --spacing-lg: 32px;
            --spacing-xl: 48px;
            --font-size-xs: 12px;
            --font-size-sm: 14px;
            --font-size-base: 16px;
            --font-size-lg: 20px;
            --font-size-xl: 28px;
            --transition-fast: 0.2s ease;
            --transition-medium: 0.3s ease;
            --transition-slow: 0.5s ease;
          }

          /* Base styles for chat container */
          .chat {
            background: var(--card-background);
            padding: var(--spacing-md);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-light);
            max-width: 600px;
            margin: var(--spacing-lg) auto;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
            transition: box-shadow var(--transition-medium);
          }

          .chat:hover {
            box-shadow: var(--shadow-medium);
          }

          /* Messages container */
          .messages {
            max-height: 400px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm);
            background: #fafafa;
            border-radius: var(--border-radius-sm);
            border: 1px solid var(--border-color);
          }

          /* Custom scrollbar for messages */
          .messages::-webkit-scrollbar {
            width: 8px;
          }

          .messages::-webkit-scrollbar-track {
            background: #eceff1;
          }

          .messages::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: var(--border-radius-sm);
          }

          .messages::-webkit-scrollbar-thumb:hover {
            background: var(--primary-hover);
          }

          /* Message styles */
          .message {
            display: flex;
            flex-direction: column;
            padding: var(--spacing-sm);
            border-radius: var(--border-radius-sm);
            background: #f5f5f5;
            max-width: 80%;
            animation: fadeIn var(--transition-medium) ease-in;
          }

          .message.own {
            background: #e3f2fd;
            align-self: flex-end;
            border: 1px solid #bbdefb;
          }

          .message p {
            margin: 0;
            color: var(--text-primary);
            font-size: var(--font-size-base);
            line-height: 1.5;
          }

          .username {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            font-weight: 600;
            margin-bottom: var(--spacing-xs);
          }

          .timestamp {
            font-size: var(--font-size-xs);
            color: var(--text-muted);
            align-self: flex-end;
            margin-top: var(--spacing-xs);
          }

          /* Form styles */
          .chat form {
            display: flex;
            gap: var(--spacing-sm);
            align-items: center;
          }

          .chat input {
            flex: 1;
            padding: var(--spacing-sm);
            border: 2px solid var(--border-color);
            border-radius: var(--border-radius-sm);
            font-size: var(--font-size-base);
            background: #fafafa;
            color: var(--text-primary);
            transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          }

          .chat input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.15);
          }

          .chat input::placeholder {
            color: var(--text-muted);
            opacity: 0.9;
          }

          /* Button styles */
          .chat button {
            padding: var(--spacing-sm) var(--spacing-md);
            border: none;
            border-radius: var(--border-radius-sm);
            background-color: var(--primary-color);
            color: #ffffff;
            font-size: var(--font-size-base);
            font-weight: 600;
            cursor: pointer;
            transition: background-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
            background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.05));
          }

          .chat button:hover {
            background-color: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: var(--shadow-light);
          }

          .chat button:focus {
            outline: 3px solid var(--primary-color);
            outline-offset: 2px;
          }

          .chat button:active {
            transform: translateY(0);
            box-shadow: none;
          }

          .chat button:disabled {
            background-color: #b0bec5;
            background-image: none;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          /* Animations */
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          /* Accessibility */
          :focus-visible {
            outline: 3px solid var(--primary-color);
            outline-offset: 2px;
          }

          /* High Contrast Mode */
          @media (prefers-contrast: high) {
            :root {
              --primary-color: #002966;
              --background-color: #ffffff;
              --card-background: #ffffff;
              --text-primary: #000000;
              --yta: #ffffff;
              --card-background: #ffffff;
              --text-primary: #000000;
              --text-secondary: #333333;
              --text-muted: #555555;
              --border-color: #333333;
            }

            .chat,
            .messages,
            .message,
            .message.own {
              border: 2px solid var(--border-color);
              box-shadow: none;
              background: #ffffff;
            }

            .chat input {
              background: #ffffff;
              border-color: var(--border-color);
            }
          }

          /* Reduced Motion */
          @media (prefers-reduced-motion: reduce) {
            .chat,
            .message,
            .chat button {
              transition: none;
              animation: none;
            }

            .messages {
              scroll-behavior: auto;
            }
          }

          /* Responsive Design */
          @media (max-width: 576px) {
            .chat {
              padding: var(--spacing-sm);
              margin: var(--spacing-md);
              max-width: 100%;
            }

            .messages {
              max-height: 300px;
            }

            .message {
              max-width: 90%;
            }

            .chat input,
            .chat button {
              font-size: var(--font-size-sm);
              padding: var(--spacing-xs);
            }

            .chat form {
              flex-direction: column;
              gap: var(--spacing-xs);
            }

            .chat button {
              width: 100%;
            }
          }

          @media (min-width: 577px) and (max-width: 768px) {
            .chat {
              max-width: 500px;
            }

            .messages {
              max-height: 350px;
            }
          }

          @media (min-width: 769px) {
            .chat {
              padding: var(--spacing-lg);
            }

            .messages {
              max-height: 450px;
            }
          }

          /* Print Styles */
          @media print {
            .chat {
              box-shadow: none;
              border: 1px solid var(--border-color);
            }

            .chat form {
              display: none;
            }

            .messages {
              max-height: none;
              overflow: visible;
            }
          }

          /* Additional Utility Styles */
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
          }

          /* Input Validation */
          .chat input:invalid {
            border-color: #d32f2f;
          }

          .chat input:invalid:focus {
            box-shadow: 0 0 0 4px rgba(211, 47, 47, 0.15);
          }

          /* Hover Effects */
          .chat input:hover {
            border-color: var(--primary-color);
          }

          .chat button:hover {
            animation: pulse var(--transition-medium) ease-in-out;
          }

          /* Message Hover */
          .message:hover {
            background: #eeeeee;
          }

          .message.own:hover {
            background: #bbdefb;
          }
        `}
      </style>

      <div className="messages" onScroll={onScroll} ref={messagesContainerRef} role="log" aria-live="polite">
        {Array.isArray(messages) ? messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`message ${message.user._id === user._id ? 'own' : ''}`}
          >
            <span className="username">{message.user.username}</span>
            <p>{message.content}</p>
            <span className="timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )) : null}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          aria-label="Type a message"
        />
        <button type="submit" disabled={!newMessage.trim()}>Send</button>
      </form>
    </div>
  );
};

export default Chat;
