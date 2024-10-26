const quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Inspirational" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the end, we only regret the chances we didn't take.", category: "Motivational" },
];

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `<p>"${randomQuote.text}"</p><span>- ${randomQuote.category}</span>`;
}

// Call showRandomQuote() when 'Show New Quote' button is clicked
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Function to add a new quote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value;
  const quoteCategory = document.getElementById("newQuoteCategory").value;

  if (quoteText && quoteCategory) {
    // Add new quote to the quotes array
    quotes.push({ text: quoteText, category: quoteCategory });

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
  `;

  document.body.appendChild(formContainer);
}

// Call createAddQuoteForm() to add the form on page load
createAddQuoteForm();
