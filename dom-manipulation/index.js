const quotes = [
    { text: "The journey of a thousand miles begins with one step.", category: "Inspirational" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the end, we only regret the chances we didn't take.", category: "Motivational" },
  ];
  
  // Function to display a random quote
  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    document.getElementById("quoteDisplay").innerText = `"${randomQuote.text}" - ${randomQuote.category}`;
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
  
      // Optionally show the new quote immediately
      document.getElementById("quoteDisplay").innerText = `"${quoteText}" - ${quoteCategory}`;
    } else {
      alert("Please enter both a quote and a category.");
    }
  }
  