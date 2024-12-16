const chatIcon = document.getElementById("chatIcon");
const chatbot = document.getElementById("chatbot");
const closeChat = document.getElementById("closeChat");
const messageForm = document.getElementById("messageForm");
const userInput = document.getElementById("userInput");
const chatbotMessages = document.getElementById("chatbotMessages");
const loadingBarContainer = document.getElementById("loadingBarContainer");
const loadingBar = document.getElementById("loadingBar");
const suggestionsContainer = document.getElementById("suggestionsContainer");
const suggestionButtons = document.getElementById("suggestionButtons");
const followUpContainer = document.getElementById("followUpContainer");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const clearChatButton = document.getElementById("clearChat");

let typingIndicator;
let currentSuggestions = [];

// Helper function to format the response based on content type
function formatResponse(content) {
  // Check if content contains sections (indicated by \n)
  if (content.includes('\n')) {
    const sections = content.split('\n').filter(section => section.trim());
    return sections.map(section => {
      // Check if section is a heading (contains ':')
      if (section.includes(':')) {
        const [heading, items] = section.split(':');
        return `
          <div class="mb-3">
            <h3 class="font-bold text-[#008080] mb-2">${heading.trim()}:</h3>
            <ul class="list-disc pl-5 space-y-1">
              ${items.split(',').map(item => `<li>${item.trim()}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      return `<p class="mb-2">${section.trim()}</p>`;
    }).join('');
  }

  // Check if content is a list (contains bullets or numbers)
  if (content.includes('•') || /^\d+\./.test(content)) {
    const items = content.split(/[•.]/).filter(item => item.trim());
    return `
      <ul class="list-disc pl-5 space-y-1">
        ${items.map(item => `<li>${item.trim()}</li>`).join('')}
      </ul>
    `;
  }

  // Default paragraph formatting
  return `<p class="mb-2">${content}</p>`;
}

// Open the chatbot when the icon is clicked
chatIcon.addEventListener("click", () => {
  chatbot.style.display = "flex";
  chatIcon.style.display = "none";
});

// Close the chatbot
closeChat.addEventListener("click", () => {
  chatbot.style.display = "none";
  chatIcon.style.display = "block";
});

// Function to add a message to the chat window
function addMessage(message, isUser = false) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    "p-3",
    "rounded-lg",
    "max-w-xs",
    "w-full",
    "break-words",
    "text-sm"
  );

  if (isUser) {
    messageElement.classList.add(
      "bg-[#1E90FF]",
      "text-white",
      "self-end",
      "ml-auto"
    );
    messageElement.textContent = message;
  } else {
    messageElement.classList.add(
      "bg-[#F8F8F8]", 
      "text-[#008080]", 
      "self-start", 
      "flex", 
      "items-start", 
      "space-x-2",
      "max-w-sm"  
    );
    
    const iconElement = document.createElement("img");
    iconElement.src = "https://i.ibb.co/fSNP7Rz/icons8-chatgpt-512.png";
    iconElement.alt = "Iksha AI";
    iconElement.classList.add("w-6", "h-6", "rounded-full", "mt-1", "flex-shrink-0");
    
    const contentElement = document.createElement("div");
    contentElement.classList.add("flex-grow");
    
    // Format the message content
    if (typeof message === 'string') {
      contentElement.innerHTML = formatResponse(message);
    } else {
      contentElement.innerHTML = message;
    }
    
    messageElement.appendChild(iconElement);
    messageElement.appendChild(contentElement);
  }

  chatbotMessages.appendChild(messageElement);
  scrollToBottom();
}

// Function to show typing indicator
function showTypingIndicator() {
  typingIndicator = document.createElement("div");
  typingIndicator.classList.add(
    "p-3",
    "bg-[#F8F8F8]",
    "rounded-lg",
    "max-w-xs",
    "w-full",
    "text-center",
    "text-[#008080]"
  );
  typingIndicator.textContent = "...";
  chatbotMessages.appendChild(typingIndicator);
  scrollToBottom();
}

// Function to remove typing indicator
function removeTypingIndicator() {
  if (typingIndicator) {
    chatbotMessages.removeChild(typingIndicator);
    typingIndicator = null;
  }
}

// Function to scroll to bottom of chat messages
function scrollToBottom() {
  chatbotMessages.scrollTo({
    top: chatbotMessages.scrollHeight,
    behavior: 'smooth'
  });
}

// Simulate gathering sources with a loading bar
function showLoadingBar() {
  loadingBarContainer.style.display = "block";
  let width = 0;
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      loadingBarContainer.style.display = "none";
    } else {
      width++;
      loadingBar.style.width = width + "%";
    }
  }, 10);
}

// Send user message to server and get the response
async function sendMessageToServer(userMessage) {
  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userMessage }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      answer: "I'm sorry, something went wrong. Please try again later.",
      suggestions: [],
    };
  }
}

// Function to display suggestion buttons
function displaySuggestions(suggestions) {
  suggestionButtons.innerHTML = "";
  if (suggestions && suggestions.length > 0) {
    suggestions.forEach((suggestion) => {
      const button = document.createElement("button");
      button.textContent = suggestion;
      button.classList.add(
        "bg-[#F8F8F8]",
        "text-[#008080]",
        "px-1",
        "rounded-lg",
        "text-sm",
        "hover:bg-[#008080]",
        "hover:text-white",
        "transition-colors",
        "text-left",
        "w-full"
      );
      button.addEventListener("click", () => {
        userInput.value = suggestion;
        messageForm.dispatchEvent(new Event("submit"));
      });
      suggestionButtons.appendChild(button);
    });

    // Add "Book a Meeting" button
    const meetingButton = document.createElement("button");
    meetingButton.textContent = "Book a Meeting";
    meetingButton.classList.add(
      "bg-[#008080]",
      "text-white",
      "px-1",
      "rounded-lg",
      "text-sm",
      "hover:bg-[#1E90FF]",
      "transition-colors",
      "text-left",
      "font-semibold",
      "w-full"
    );
    meetingButton.addEventListener("click", () => {
      window.open("https://calendly.com/whitespaces-ai", "_blank");
    });
    suggestionButtons.appendChild(meetingButton);

    suggestionsContainer.style.display = "block";
  } else {
    suggestionsContainer.style.display = "none";
  }
}

// Function to show follow-up question
function showFollowUpQuestion() {
  followUpContainer.style.display = "block";
}

// Function to hide follow-up question
function hideFollowUpQuestion() {
  followUpContainer.style.display = "none";
}

// Handle form submission for sending messages
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message) {
    addMessage(message, true);
    userInput.value = "";

    showLoadingBar();
    showTypingIndicator();

    const serverResponse = await sendMessageToServer(message);
    removeTypingIndicator();
    
    // Add the formatted response
    addMessage(serverResponse.answer + '<br><br>' + createHyperlink("Know more", "https://whitespaces.ai/"));
    currentSuggestions = serverResponse.suggestions;
    showFollowUpQuestion();
  }
});

// Handle "Yes" button click
yesButton.addEventListener("click", () => {
  hideFollowUpQuestion();
  displaySuggestions(currentSuggestions);
});

// Handle "No" button click
noButton.addEventListener("click", () => {
  hideFollowUpQuestion();
  addMessage("Thank you for using our chatbot. Is there anything else I can help you with?");
});

// Clear chat
clearChatButton.addEventListener("click", () => {
  chatbotMessages.innerHTML = "";
  hideFollowUpQuestion();
  suggestionsContainer.style.display = "none";
});

// Helper function to create hyperlinks
function createHyperlink(text, url) {
  return `<a href="${url}" target="_blank" class="text-[#1E90FF] hover:underline">${text}</a>`;
}

