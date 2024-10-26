// Load quotes from Local Storage or use default quotes if not found
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "The journey of a thousand miles begins with one step.", category: "Inspirational" },
  { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { id: 3, text: "In the end, we only regret the chances we didn't take.", category: "Motivational" },
];

// Mock API URL for fetching quotes
const serverUrl = "https://jsonplaceholder.typicode.com/posts";

// Notification area for sync messages
const notificationArea = document.createElement("div");
notificationArea.id = "notificationArea";
notificationArea.style.cssText = "display: none; background-color: #e2e3e5; padding: 10px; margin-bottom: 10px;";
document.body.insertBefore(notificationArea, document.body.firstChild);

function displayNotification(message) {
  notificationArea.innerText = message;
  notificationArea.style.display = "block";
  setTimeout(() => {
    notificationArea.style.display = "none";
  }, 5000); // Hide after 5 seconds
}

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `<p>"${randomQuote.text}"</p><span>- ${randomQuote.category}</span>`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// Save quotes to Local Storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to add a new quote
async function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value;
  const quoteCategory = document.getElementById("newQuoteCategory").value;

  if (quoteText && quoteCategory) {
    const newQuote = { id: Date.now(), text: quoteText, category: quoteCategory };
    quotes.push(newQuote);
    saveQuotes();
    updateCategoryDropdown(quoteCategory);
    document.getElementById("newQuoteText").value = '';
    document.getElementById("newQuoteCategory").value = '';
    showRandomQuote();

    // Send new quote to the server
    await sendQuoteToServer(newQuote);
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Function to send the new quote to the server
async function sendQuoteToServer(quote) {
  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quote),
    });

    if (!response.ok) {
      throw new Error("Failed to send quote to server.");
    }

    const data = await response.json();
    console.log("Quote successfully sent to server:", data);
    displayNotification("Quote successfully synced to server.");
  } catch (error) {
    console.error("Error sending quote:", error);
    displayNotification("Failed to sync quote to server.");
  }
}

// Update the category dropdown
function updateCategoryDropdown(newCategory) {
  const categoryFilter = document.getElementById("categoryFilter");
  const existingCategories = Array.from(categoryFilter.options).map(option => option.value);
  
  if (!existingCategories.includes(newCategory)) {
    const option = document.createElement("option");
    option.value = newCategory;
    option.textContent = newCategory.charAt(0).toUpperCase() + newCategory.slice(1);
    categoryFilter.appendChild(option);
  }
}

// Function to create the Add Quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
    <button id="exportBtn">Export Quotes</button>
    <input type="file" id="importFile" accept=".json" />
  `;
  document.body.appendChild(formContainer);

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(quote => quote.category === selectedCategory);
  displayQuotes(filteredQuotes);
  localStorage.setItem("lastSelectedCategory", selectedCategory);
}

// Display quotes in the DOM
function displayQuotes(filteredQuotes) {
  const quotesContainer = document.getElementById("quotesContainer");
  quotesContainer.innerHTML = "";
  
  filteredQuotes.forEach(quote => {
    const quoteElement = document.createElement("div");
    quoteElement.innerHTML = `<p>"${quote.text}"</p><span>- ${quote.category}</span>`;
    quotesContainer.appendChild(quoteElement);
  });
}

// Function to populate categories dynamically
function populateCategories() {
  const categorySet = new Set(quotes.map(quote => quote.category));
  const categoryFilter = document.getElementById("categoryFilter");

  categorySet.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    categoryFilter.appendChild(option);
  });

  const lastCategory = localStorage.getItem("lastSelectedCategory") || "all";
  categoryFilter.value = lastCategory;
}

// Initialize and show last viewed quote if available
function initialize() {
  createAddQuoteForm();
  populateCategories();
  const lastViewedQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));
  if (lastViewedQuote) {
    document.getElementById("quoteDisplay").innerHTML = `<p>"${lastViewedQuote.text}"</p><span>- ${lastViewedQuote.category}</span>`;
  }

  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  filterQuotes();
}

// Function to export quotes to a JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
      populateCategories();
      filterQuotes();
    } catch (error) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to fetch quotes from the server periodically
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverUrl);
    if (!response.ok) throw new Error("Failed to fetch server data.");
    
    const data = await response.json();
    updateLocalQuotes(data);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    displayNotification("Failed to fetch data from server.");
  }
}

// Conflict resolution: User chooses to keep local or server data
function resolveConflict(localQuote, serverQuote) {
  const userChoice = confirm(
    `Conflict detected:\n\nLocal quote: "${localQuote.text}"\nServer quote: "${serverQuote.title}"\n\nClick "OK" to keep the server quote or "Cancel" to keep your local quote.`
  );

  if (userChoice) {
    localQuote.text = serverQuote.title;
    localQuote.category = "General";
    displayNotification("Server quote has been saved.");
  } else {
    displayNotification("Local quote has been retained.");
  }
}

// Sync local quotes with server quotes
function updateLocalQuotes(serverQuotes) {
  const localQuotesMap = new Map(quotes.map(quote => [quote.id, quote]));

  serverQuotes.forEach(serverQuote => {
    const localQuote = localQuotesMap.get(serverQuote.id);
    if (!localQuote) {
      quotes.push({ id: serverQuote.id, text: serverQuote.title, category: "General" });
    } else if (localQuote.text !== serverQuote.title) {
      resolveConflict(localQuote, serverQuote);
    }
  });

  saveQuotes();
  displayQuotes(quotes);
}

// Call fetch function every 60 seconds
setInterval(fetchQuotesFromServer, 60000);

// Call initialize function on page load
initialize();
