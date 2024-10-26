// Load quotes from Local Storage or use default quotes if not found
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "The journey of a thousand miles begins with one step.", category: "Inspirational" },
  { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { id: 3, text: "In the end, we only regret the chances we didn't take.", category: "Motivational" },
];

const serverUrl = "https://jsonplaceholder.typicode.com/posts"; // Mock API URL

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `<p>"${randomQuote.text}"</p><span>- ${randomQuote.category}</span>`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote)); // Store last viewed quote in Session Storage
}

// Save quotes to Local Storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to add a new quote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value;
  const quoteCategory = document.getElementById("newQuoteCategory").value;

  if (quoteText && quoteCategory) {
    const newQuote = { id: Date.now(), text: quoteText, category: quoteCategory }; // Unique ID for the quote
    quotes.push(newQuote);
    saveQuotes(); // Update Local Storage
    updateCategoryDropdown(quoteCategory); // Update category dropdown

    // Clear input fields
    document.getElementById("newQuoteText").value = '';
    document.getElementById("newQuoteCategory").value = '';

    // Show the newly added quote immediately
    document.getElementById("quoteDisplay").innerHTML = `<p>"${quoteText}"</p><span>- ${quoteCategory}</span>`;
  } else {
    alert("Please enter both a quote and a category.");
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

  // Add event listeners
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(quote => quote.category === selectedCategory);
  displayQuotes(filteredQuotes);
  
  // Save the last selected category in local storage
  localStorage.setItem("lastSelectedCategory", selectedCategory);
}

// Display quotes in the DOM
function displayQuotes(filteredQuotes) {
  const quotesContainer = document.getElementById("quotesContainer");
  quotesContainer.innerHTML = ""; // Clear previous quotes

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

  // Load last selected category from local storage
  const lastCategory = localStorage.getItem("lastSelectedCategory") || "all";
  categoryFilter.value = lastCategory;
}

// Initialize and show last viewed quote if available
function initialize() {
  createAddQuoteForm();
  populateCategories(); // Populate the category filter
  const lastViewedQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));
  if (lastViewedQuote) {
    document.getElementById("quoteDisplay").innerHTML = `<p>"${lastViewedQuote.text}"</p><span>- ${lastViewedQuote.category}</span>`;
  }

  // Add event listener for category filter
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  
  // Show quotes based on the last selected category
  filterQuotes();
}

// Function to export quotes to a JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2); // Format quotes as JSON
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
      // Re-populate categories after import
      populateCategories();
      filterQuotes();
    } catch (error) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to fetch quotes from the server periodically
function fetchQuotesFromServer() {
  fetch(serverUrl)
    .then(response => response.json())
    .then(data => {
      updateLocalQuotes(data);
    })
    .catch(error => console.error("Error fetching quotes:", error));
}

// Sync local quotes with server quotes
function updateLocalQuotes(serverQuotes) {
  const updatedCount = serverQuotes.length; // Count of server quotes
  const localIds = new Set(quotes.map(q => q.id));

  serverQuotes.forEach(serverQuote => {
    if (!localIds.has(serverQuote.id)) {
      // New quote from server, add to local storage
      quotes.push({ id: serverQuote.id, text: serverQuote.title, category: "General" }); // Default category
    } else {
      // Handle conflict resolution if the quote exists
      const localQuoteIndex = quotes.findIndex(q => q.id === serverQuote.id);
      if (JSON.stringify(quotes[localQuoteIndex]) !== JSON.stringify(serverQuote)) {
        resolveConflict(quotes[localQuoteIndex], serverQuote);
      }
    }
  });

  saveQuotes(); // Save updated quotes
  displayQuotes(quotes); // Refresh displayed quotes
}

// Resolve conflicts
function resolveConflict(localQuote, serverQuote) {
  alert(`Conflict detected for quote: "${localQuote.text}". The server data will take precedence.`);
  const index = quotes.findIndex(q => q.id === localQuote.id);
  if (index !== -1) {
    quotes[index] = { ...serverQuote, category: localQuote.category }; // Retain local category
  }
}

// Call fetch function every 60 seconds
setInterval(fetchQuotesFromServer, 60000); // 60 seconds

// Call initialize function on page load
initialize();
