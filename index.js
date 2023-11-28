const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const flash = require("express-flash");
const { PORT, URI } = require("./config/index");

const User = require("./models/User");
const Sales = require("./models/Sale");

const server = express();
const isProduction = process.env.NODE_ENV === "production";

const MongoStore = require("connect-mongo")(session);

server.use(cors());
server.disable("x-powered-by"); //Reduce fingerprinting
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

server.use(
  session({
    secret: "notagoodsecret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: isProduction, // Set to true in production
      domain: "https://calm-ruby-fox-tutu.cyclic.app/",
    },
  })
);

server.set("trust proxy", 1);

server.use(flash());

// Serve static files from the "public" directory
server.use(express.static(path.join(__dirname, "public")));

// Set up Handlebars as the view engine with a custom file extension
server.set("view engine", ".hbs");
server.set("views", path.join(__dirname, "views"));

server.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    partialsDir: "views/partials/",
    defaultLayout: "main",
  })
);

// Register a Handlebars helper
Handlebars.registerHelper("getProperty", function (object, property) {
  return object[property];
});

const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

main().catch((err) => console.log(err));
async function main() {
  try {
    await mongoose.connect(URI);

    console.log("Database connection established");

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

server.get("/register", (req, res) => {
  res.render("register");
});
server.post("/register", async (req, res) => {
  const user = new User({
    ...req.body,
  });

  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});

server.get("/login", (req, res) => {
  res.render("login", { user_id: req.session.user_id });
});

server.get("/logout", (req, res) => {
  res.render("login");
});

server.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const foundUser = await User.findAndValidate(email, password);

  if (foundUser) {
    req.session.user_id = foundUser._id;
    req.session.user = foundUser.first_name;
    res.redirect("/");
    // res.render("index", { user: foundUser.first_name });
  } else {
    // Redirect the user to the login page with a flash message indicating authentication failure
    req.flash("error", "Invalid email or password");
    res.redirect("/login");
  }
});

server.post("/logout", (req, res) => {
  req.session.user_id = null;
  req.session.destroy();
  res.redirect("/");
});

server.get("/", async (req, res) => {
  res.render("index", {
    user_id: req.session.user_id,
    user: req.session.user,
  });
});

// get all invoices
server.get("/allInvoices", async (req, res) => {
  try {
    // Set default values for page and limit
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the skip value based on the page and limit
    const skip = (page - 1) * limit;

    // Fetch invoices using pagination
    const allInvoices = await Sales.find({}).skip(skip).limit(limit);

    // Calculate total pages
    const totalInvoices = await Sales.countDocuments({});
    const totalPages = Math.ceil(totalInvoices / limit);

    // Create an array for pagination controls
    const pagination = [];
    for (let i = 1; i <= totalPages; i++) {
      pagination.push({
        pageNumber: i,
        isCurrent: i === page,
        limit: limit,
      });
    }

    res.render("invoices", {
      invoices: allInvoices,
      currentPage: page,
      totalPages: totalPages,
      pagination: pagination,
      user_id: req.session.user_id,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).send("Error fetching invoices");
  }
});

// Form search for invoices form
server.get("/searchInvoice", async (req, res) => {
  res.render("searchInvoice", { user_id: req.session.user_id });
});

server.get("/invoice/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Sales.findOne({ "Invoice ID": id });

    if (invoice) {
      res.render("singleInvoice", { invoice: invoice });
    } else {
      // Handle the case where no invoice is found
      res.render("invoiceNotFound");
    }
  } catch (error) {
    console.error("Error searching for invoice:", error);
    res.status(500).send("Error searching for invoice");
  }
});
// Search single invoice
server.post("/searchInvoice", async (req, res) => {
  try {
    const { invoiceID } = req.body;
    const invoice = await Sales.findOne({ "Invoice ID": invoiceID });

    if (invoice) {
      res.render("singleInvoice", {
        invoice: invoice,
        user_id: req.session.user_id,
      });
    } else {
      // Handle the case where no invoice is found
      res.render("invoiceNotFound", { user_id: req.session.user_id });
    }
  } catch (error) {
    console.error("Error searching for invoice:", error);
    res.status(500).send("Error searching for invoice");
  }
});

// display form to add new invoice
server.get("/addInvoice", requireLogin, async (req, res) => {
  res.render("addNewInvoice", { user_id: req.session.user_id });
});

// Insert single invoice
server.post("/addInvoice", async (req, res) => {
  try {
    const newSales = new Sales({ ...req.body });
    console.log(newSales);
    await newSales.save();
    return res.render("invoiceAdded", {
      newInvoice: newSales,
      user_id: req.session.user_id,
    });
  } catch (error) {
    console.error("Error creating new, invoice:", error);
    return res.status(500).send("Error creating new invoice");
  }
});

// Display success page after inserting invoice
server.get("/invoiceAdded", (req, res) => {
  res.render("invoiceAdded", { user_id: req.session.user_id });
});

// display delete invoice form
server.get("/deleteInvoice", requireLogin, (req, res) => {
  res.render("deleteInvoice", { user_id: req.session.user_id });
});
// delete invoice by ID or exact name
// Route to handle form submission
server.post("/deleteInvoice", async (req, res) => {
  const invoiceID = req.body["Invoice ID"];
  try {
    // Use the correct field name in the query
    const result = await Sales.deleteOne({ "Invoice ID": invoiceID });

    console.log(result);
    if (result.deletedCount > 0) {
      // Render the deleted template with the deleted document information
      res.render("deletedInvoice", {
        deletedDoc: { "Invoice ID": invoiceID },
        user_id: req.session.user_id,
      });
    } else {
      res.send("product not found.");
    }
  } catch (err) {
    console.log(err);

    // You might want to handle errors differently, e.g., show an error template
    res.status(500).send("Error deleting the document.");
  }
});

// render update invoice form
server.get("/editInvoice", requireLogin, (req, res) => {
  res.render("updateInvoiceForm", { user_id: req.session.user_id });
});

// Update an existing invoice
server.post("/editInvoice", requireLogin, async (req, res) => {
  const { newCustomerType, newUnitPrice } = req.body;

  console.log(req.body);
  try {
    // Find the invoice by ID
    const existingInvoice = await Sales.findOne({
      "Invoice ID": req.body["Invoice ID"],
    });

    if (!existingInvoice) {
      return res.status(404).send("Invoice not found");
    }

    // Calculate tax and total on the server

    const newTax =
      newUnitPrice * existingInvoice["Quantity"] * existingInvoice["Tax 5%"];
    const newTotal =
      newUnitPrice * existingInvoice["Quantity"] * existingInvoice["Tax 5%"];

    // Update the  fields
    existingInvoice["Total"] = newTotal;
    existingInvoice["Tax 5%"] = newTax;
    existingInvoice["Customer type"] = newCustomerType;
    existingInvoice["Unit price"] = newUnitPrice;

    // Save the updated invoice
    const updatedInvoice = await existingInvoice.save();

    // Render a success page or send a JSON response with the updated invoice
    res.render("updateSuccess", {
      updatedInvoice,
      user_id: req.session.user_id,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).send("Error updating invoice");
  }
});

server.get("*", (req, res) => {
  res.status(404).send("not found");
});
