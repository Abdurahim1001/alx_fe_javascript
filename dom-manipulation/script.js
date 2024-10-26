// Load quotes from Local Storage or use default quotes if not found
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "The journey of a thousand miles begins with one step.", category: "Inspirational" },
  { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { id: 3, text: "In the end, we only regret the chances we didn't take.", category: "Motivational" },
];

// Mock API URL for fetching quotes
const serverUrl = "https://jsonplaceholder.typicode.com/posts";

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

    const data = await response.json(); // Handle server response if necessary
    console.log("Quote successfully sent to server:", data);
  } catch (error) {
    console.error("Error sending quote:", error);
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
async function initialize() {
  createAddQuoteForm();
  populateCategories();
  const lastViewedQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));
  if (lastViewedQuote) {
    document.getElementById("quoteDisplay").innerHTML = `<p>"${lastViewedQuote.text}"</p><span>- ${lastViewedQuote.category}</span>`;
  }

  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  filterQuotes();

  // Sync quotes with server at the start
  await syncQuotes();
}

// Function to sync local quotes with server quotes
async function syncQuotes() {
  try {
    const response = await fetch(serverUrl);
    const serverQuotes = await response.json();
    updateLocalQuotes(serverQuotes);
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

// Sync local quotes with server quotes
function updateLocalQuotes(serverQuotes) {
  const localIds = new Set(quotes.map(q => q.id));

  serverQuotes.forEach(serverQuote => {
    if (!localIds.has(serverQuote.id)) {
      quotes.push({ id: serverQuote.id, text: serverQuote.title, category: "General" });
    }
  });

  saveQuotes();
  displayQuotes(quotes);
}

// Call fetch function every 60 seconds
setInterval(syncQuotes, 60000);

// Call initialize function on page load
initialize();
