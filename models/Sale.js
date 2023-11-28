const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaleSchema = new Schema({
  "Invoice ID": {
    type: String,
    required: true,
  },
  Branch: {
    type: String,
    required: true,
  },
  City: {
    type: String,
    required: true,
  },
  "Customer type": {
    type: String,
    enum: ["Member", "Normal"], // Example: Validate against a predefined set of values
    required: true,
  },
  "Product line": {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  "Unit price": {
    type: Number,
    required: true,
    min: 0, // Example: Minimum value
  },
  Quantity: {
    type: Number,
    required: true,
    min: 1, // Example: Minimum value
  },
  "Tax 5%": {
    type: Number,
    required: true,
    min: 0, // Example: Minimum value
  },
  Total: {
    type: Number,
    required: true,
    min: 0, // Example: Minimum value
  },
  Date: {
    type: Date,
    required: true,
  },
  Time: {
    type: String,
  },

  Rating: {
    type: Number,
    min: 1, // Example: Minimum value
    max: 10, // Example: Maximum value
  },
});

module.exports = mongoose.model("Sale", SaleSchema);
