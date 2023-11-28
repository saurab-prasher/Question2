const form = document.querySelector(".form");
form.addEventListener("submit", function (event) {
  if (!validateInvoiceId() || !validateBranch() || !validateRating()) {
    event.preventDefault(); // Prevent form submission if validation fails
  }
});

// Function to validate Invoice ID
function validateInvoiceId() {
  const invoiceIdInput = document.getElementById("invoiceId");
  const invoiceIdPattern = /^\d{3}-\d{2}-\d{4}$/;

  // Check if the entered Invoice ID matches the specified pattern
  if (!invoiceIdPattern.test(invoiceIdInput.value)) {
    alert("Invalid Invoice ID. Please use the format XXX-XX-XXXX.");
    return false; // Return false to indicate validation failure
  }

  return true; // Return true to indicate validation success
}

// Function to automatically format Invoice ID with dashes
function formatInvoiceId() {
  const invoiceIdInput = document.getElementById("invoiceId");
  let inputValue = invoiceIdInput.value.replace(/[^\d]/g, ""); // Remove non-numeric characters

  // Ensure the length doesn't exceed 9 digits
  inputValue = inputValue.slice(0, 9);

  // Add dashes at appropriate positions
  if (inputValue.length > 5) {
    inputValue =
      inputValue.slice(0, 3) +
      "-" +
      inputValue.slice(3, 5) +
      "-" +
      inputValue.slice(5);
  } else if (inputValue.length > 3) {
    inputValue = inputValue.slice(0, 3) + "-" + inputValue.slice(3);
  }

  // Update the value in the input field
  invoiceIdInput.value = inputValue;
}

// Attach the formatInvoiceId function to the input event
document.getElementById("invoiceId").addEventListener("input", formatInvoiceId);

// Function to validate Branch
function validateBranch() {
  const branchInput = document.getElementById("branch");
  const validBranches = ["A", "B", "C"];

  // Check if the selected branch is one of the valid branches
  if (!validBranches.includes(branchInput.value)) {
    alert("Invalid Branch. Please select a valid branch.");
    return false; // Return false to indicate validation failure
  }

  return true; // Return true to indicate validation success
}

// Function to validate Rating
function validateRating() {
  const ratingInput = document.getElementById("rating");

  // Check if the entered rating is a number between 1 and 10
  if (
    isNaN(ratingInput.value) ||
    ratingInput.value < 1 ||
    ratingInput.value > 10
  ) {
    alert("Invalid Rating. Please enter a number between 1 and 10.");
    return false; // Return false to indicate validation failure
  }

  return true; // Return true to indicate validation success
}

// Function to calculate total based on unit price and quantity
function calculateTotal() {
  // Get user inputs
  const unitPrice =
    parseFloat(document.getElementById("unitPrice").value) || 0.0;
  const quantity = parseInt(document.getElementById("quantity").value) || 0;

  // Calculate tax, discount, and total
  const taxRate = 0.05; // 5%
  const tax = unitPrice * quantity * taxRate;

  const subtotal = unitPrice * quantity;
  const total = subtotal + tax;

  // Update the calculated values in the form
  document.getElementById("tax").value = tax.toFixed(2);
  document.getElementById("total").value = total.toFixed(2);
}
