// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const themeToggle = document.getElementById('theme-toggle');
    const currentTicker = document.getElementById('current-ticker');
    const currentExpiry = document.getElementById('current-expiry');
    
    // Initial state
    let darkMode = localStorage.getItem('darkMode') === 'true';
    let conversationContext = {
        ticker: 'AAPL',
        expiry: '2025-05-16',
        strikeRange: '5%'
    };
    
    // Apply initial theme
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Theme toggle functionality
    themeToggle.addEventListener('click', function() {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', darkMode);
    });
    
    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Send message on Enter (without Shift)
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message function
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessage('user', message);
            
            // Clear input
            userInput.value = '';
            userInput.style.height = 'auto';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Process message and get response
            setTimeout(() => {
                processMessage(message);
            }, 1000);
        }
    }
    
    // Add message to chat
    function addMessage(sender, content, options = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        let avatarSrc = '';
        let senderName = '';
        
        if (sender === 'assistant') {
            avatarSrc = 'images/fntx_logo.png';
            senderName = 'FNTX Assistant';
        } else {
            avatarSrc = 'images/user_avatar.png';
            senderName = 'You';
        }
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let messageHTML = `
            <div class="message-bubble">
                <div class="message-header">
                    <img src="${avatarSrc}" alt="${senderName}" class="message-avatar">
                    <span class="message-sender">${senderName}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-content">${content}</div>
            </div>
        `;
        
        messageDiv.innerHTML = messageHTML;
        
        // Add any additional components (charts, tables, etc.)
        if (options.chart) {
            addChartToMessage(messageDiv, options.chart);
        }
        
        if (options.options) {
            addOptionsTableToMessage(messageDiv, options.options);
        }
        
        if (options.selectable) {
            addSelectableOptionsToMessage(messageDiv, options.selectable);
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Add chart to message
    function addChartToMessage(messageDiv, chartData) {
        const chartContainer = document.createElement('div');
        chartContainer.classList.add('chart-container');
        
        chartContainer.innerHTML = `
            <div class="chart-header">
                <div class="chart-title">${chartData.ticker} Price Chart</div>
                <div class="chart-controls">
                    <button class="chart-button active">1D</button>
                    <button class="chart-button">1W</button>
                    <button class="chart-button">1M</button>
                    <button class="chart-button">3M</button>
                </div>
            </div>
            <div class="chart-placeholder">
                [Chart visualization for ${chartData.ticker}]
            </div>
        `;
        
        messageDiv.querySelector('.message-content').appendChild(chartContainer);
        
        // Add event listeners to chart buttons
        const chartButtons = chartContainer.querySelectorAll('.chart-button');
        chartButtons.forEach(button => {
            button.addEventListener('click', function() {
                chartButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Add options table to message
    function addOptionsTableToMessage(messageDiv, optionsData) {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-display');
        
        let tableHTML = `
            <div class="options-header">${optionsData.type} Options - Expiry: ${optionsData.expiry}</div>
            <table class="options-table">
                <thead>
                    <tr>
                        <th>Strike</th>
                        <th>Last</th>
                        <th>Change</th>
                        <th>Volume</th>
                        <th>Open Int</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        optionsData.data.forEach(option => {
            tableHTML += `
                <tr>
                    <td>${option.strike}</td>
                    <td>${option.last}</td>
                    <td>${option.change}</td>
                    <td>${option.volume}</td>
                    <td>${option.openInt}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        optionsContainer.innerHTML = tableHTML;
        messageDiv.querySelector('.message-content').appendChild(optionsContainer);
    }
    
    // Add selectable options to message
    function addSelectableOptionsToMessage(messageDiv, options) {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('selectable-options');
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.textContent = option;
            button.addEventListener('click', function() {
                addMessage('user', option);
                showTypingIndicator();
                setTimeout(() => {
                    processMessage(option);
                }, 1000);
            });
            optionsContainer.appendChild(button);
        });
        
        messageDiv.querySelector('.message-content').appendChild(optionsContainer);
    }
    
    // Process user message and generate response
    function processMessage(message) {
        hideTypingIndicator();
        
        // Update context based on message
        if (message.includes('AAPL') || message.includes('Apple')) {
            conversationContext.ticker = 'AAPL';
            currentTicker.textContent = 'AAPL';
        } else if (message.includes('MSFT') || message.includes('Microsoft')) {
            conversationContext.ticker = 'MSFT';
            currentTicker.textContent = 'MSFT';
        } else if (message.includes('GOOGL') || message.includes('Google')) {
            conversationContext.ticker = 'GOOGL';
            currentTicker.textContent = 'GOOGL';
        }
        
        if (message.includes('expiry') || message.includes('expiration')) {
            if (message.includes('next week')) {
                conversationContext.expiry = '2025-05-02';
                currentExpiry.textContent = '2025-05-02';
            } else if (message.includes('next month')) {
                conversationContext.expiry = '2025-05-16';
                currentExpiry.textContent = '2025-05-16';
            }
        }
        
        // Generate response based on message
        if (message.toLowerCase().includes('select a ticker') || message.toLowerCase().includes('choose ticker')) {
            addMessage('assistant', 'Which ticker would you like to analyze?', {
                selectable: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']
            });
        }
        else if (message.toLowerCase().includes('show chart') || message.toLowerCase().includes('price chart')) {
            addMessage('assistant', `Here's the current price chart for ${conversationContext.ticker}:`, {
                chart: {
                    ticker: conversationContext.ticker
                }
            });
        }
        else if (message.toLowerCase().includes('call options') || message.toLowerCase().includes('calls')) {
            const callOptions = generateMockOptions('call');
            addMessage('assistant', `Here are the call options for ${conversationContext.ticker} expiring on ${conversationContext.expiry}:`, {
                options: {
                    type: 'Call',
                    expiry: conversationContext.expiry,
                    data: callOptions
                }
            });
        }
        else if (message.toLowerCase().includes('put options') || message.toLowerCase().includes('puts')) {
            const putOptions = generateMockOptions('put');
            addMessage('assistant', `Here are the put options for ${conversationContext.ticker} expiring on ${conversationContext.expiry}:`, {
                options: {
                    type: 'Put',
                    expiry: conversationContext.expiry,
                    data: putOptions
                }
            });
        }
        else if (message.toLowerCase().includes('delta') && message.toLowerCase().includes('0.3')) {
            const optionsType = message.toLowerCase().includes('put') ? 'put' : 'call';
            const deltaOptions = generateMockDeltaOptions(optionsType, 0.3);
            addMessage('assistant', `Here are the ${optionsType} options with approximately 0.3 delta for ${conversationContext.ticker} expiring on ${conversationContext.expiry}:`, {
                options: {
                    type: optionsType.charAt(0).toUpperCase() + optionsType.slice(1),
                    expiry: conversationContext.expiry,
                    data: deltaOptions
                }
            });
        }
        else if (message.toLowerCase() === 'aapl' || message.toLowerCase() === 'msft' || message.toLowerCase() === 'googl' || message.toLowerCase() === 'amzn' || message.toLowerCase() === 'meta') {
            conversationContext.ticker = message.toUpperCase();
            currentTicker.textContent = message.toUpperCase();
            addMessage('assistant', `I've set the ticker to ${message.toUpperCase()}. What would you like to do next?`, {
                selectable: ['Show price chart', 'Show call options', 'Show put options', 'Show 0.3 delta options']
            });
        }
        else {
            addMessage('assistant', 'Welcome to FNTX.ai! I can help you with systematic options selling. What would you like to do?', {
                selectable: ['Select a ticker', 'Show price chart', 'Show call options', 'Show put options']
            });
        }
    }
    
    // Generate mock options data
    function generateMockOptions(type) {
        const basePrice = type === 'call' ? 100 : 100;
        const options = [];
        
        for (let i = 0; i < 5; i++) {
            const strike = basePrice + (type === 'call' ? i * 5 : -i * 5);
            const last = type === 'call' 
                ? (Math.random() * 5 + 1).toFixed(2) 
                : (Math.random() * 5 + 1).toFixed(2);
            const change = ((Math.random() * 2) - 1).toFixed(2);
            const volume = Math.floor(Math.random() * 1000) + 100;
            const openInt = Math.floor(Math.random() * 5000) + 1000;
            
            options.push({
                strike: strike.toFixed(2),
                last: last,
                change: change,
                volume: volume,
                openInt: openInt
            });
        }
        
        return options;
    }
    
    // Generate mock delta-specific options
    function generateMockDeltaOptions(type, targetDelta) {
        const options = [];
        const basePrice = 100;
        
        for (let i = 0; i < 3; i++) {
            const delta = (targetDelta + (Math.random() * 0.05 - 0.025)).toFixed(2);
            const strike = type === 'call' 
                ? (basePrice * (1 + (0.3 - parseFloat(delta)) * 0.5)).toFixed(2)
                : (basePrice * (1 - (0.3 - parseFloat(delta)) * 0.5)).toFixed(2);
            const last = (Math.random() * 3 + 1).toFixed(2);
            const change = ((Math.random() * 2) - 1).toFixed(2);
            const volume = Math.floor(Math.random() * 1000) + 100;
            const openInt = Math.floor(Math.random() * 5000) + 1000;
            
            options.push({
                strike: strike,
                last: last,
                change: change,
                volume: volume,
                openInt: openInt
            });
        }
        
        return options;
    }
    
    // Initialize with welcome message
    setTimeout(() => {
        addMessage('assistant', 'Welcome to FNTX.ai! I can help you with systematic options selling. What would you like to do?', {
            selectable: ['Select a ticker', 'Show price chart', 'Show call options', 'Show put options']
        });
    }, 500);
});
