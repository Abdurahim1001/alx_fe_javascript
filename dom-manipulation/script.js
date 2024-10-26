// script.js

// Load quotes from Local Storage or use default quotes if not found
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The journey of a thousand miles begins with one step.", category: "Inspirational" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the end, we only regret the chances we didn't take.", category: "Motivational" },
];

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
    // Add new quote to the quotes array
    quotes.push({ text: quoteText, category: quoteCategory });
    saveQuotes(); // Update Local Storage

    // Clear input fields
    document.getElementById("newQuoteText").value = '';
    document.getElementById("newQuoteCategory").value = '';

    // Show the newly added quote immediately
    document.getElementById("quoteDisplay").innerHTML = `<p>"${quoteText}"</p><span>- ${quoteCategory}</span>`;
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Function to create the Add Quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
    <button onclick="exportToJsonFile()">Export Quotes</button>
    <input type="file" id="importFile" accept=".json" onchange="importFromJsonFile(event)" />
  `;
  document.body.appendChild(formContainer);
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
    } catch (error) {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize and show last viewed quote if available
function initialize() {
  createAddQuoteForm();
  const lastViewedQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));
  if (lastViewedQuote) {
    document.getElementById("quoteDisplay").innerHTML = `<p>"${lastViewedQuote.text}"</p><span>- ${lastViewedQuote.category}</span>`;
  }
}

// Call initialize function on page load
initialize();
