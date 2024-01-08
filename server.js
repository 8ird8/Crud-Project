const express = require("express");
const ejs = require("ejs");
const session = require("express-session");
const flash = require("express-flash");

const multer = require("multer");
const mongoose = require("mongoose");
const { format } = require("date-fns");
const methodOverride = require("method-override");

const app = express();


const user = require("./models/user");
const student = require("./models/student");

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "achraf123",
    resave: false,
    saveUninitialized: true,
    
  })
);
app.use(flash());

mongoose
  .connect(
    "mongodb+srv://achrafbib:achraf123@cluster0.pvap4ps.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to the database");
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  try {
    

    const data = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };

    const checkEmail = await user.findOne({ email: req.body.email });
    if (!checkEmail) {
      const newUser = await user.create(data);
      console.log("User registered successfully:", newUser);
      res.render("login.ejs");
    } else {
      req.flash("error", "Email already in use");
      res.redirect("/register");
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", async (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  try {
    const data = await user.findOne({ email: req.body.email });
    if (data) {
      
        
    
      if ( password === req.body.password) {
        req.session.userId = data._id; // Store user ID in session
        req.flash("success", "Welcome! You have successfully signed in");
        res.redirect("/home"); // Redirect to /home instead of rendering home.ejs directly
      } else {
        req.flash("error", "Invalid password");
        res.redirect("/login");
      }
    } else {
      req.flash("error", "Invalid Email Address");
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/home", async (req, res) => {
  try {
    if (req.session.userId) {
      const User = await user.findById(req.session.userId);

      if (User) {
        const AllStudent = await student.find();
        res.render("home.ejs", { User, AllStudent, title: " Crud|Home " });
      } else {
        res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/logout", (req, res) => {
  // Destroy the user's session to log them out
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    } else {
      // Redirect the user to the login page after clearing the session
      res.redirect("/login");
    }
  });
});

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
let upload = multer({
  storage: storage,
}).single("image");

app.get("/add", async (req, res) => {
  if (req.session.userId) {
    const User = await user.findById(req.session.userId);
    res.render("add.ejs", { User, title: " Crud|Add Student " });
  } else {
    res.redirect("/login");
  }
});

app.post("/add", upload, async (req, res) => {
  try {
    const data = {
      Sname: req.body.name,
      Semail: req.body.email,
      Sphone: req.body.phone,
      image: req.file ? req.file.filename : "/images/icon.jpg",
    };
    0;
    const newStudent = await student.create(data);
    console.log("Student Added successfully:", newStudent);

    // Redirect to the /home page to refresh the student list
    res.redirect("/home");
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/Student/:StudentId", async (req, res) => {
  const StudentId = req.params.StudentId;
  try {
    const deletedStudent = await student.findByIdAndDelete(StudentId);
    res.redirect("/home");
    return;
  } catch (error) {
    console.log("error", id);
  }
});

app.get("/update/:id", async (req, res) => {
  try {
    
    if (req.session.userId) {
      const id = req.params.id;
      const Students = await student.findById(id);
      const User = await user.findById(req.session.userId);
      console.log(Students);
      res.render("update.ejs", { User, Students, title: "Crud | Update" });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/Student/:id", upload, async (req, res) => {
  const id = req.params.id;
  try {
    let updateData = {
      Sname: req.body.name,
      Semail: req.body.email,
      Sphone: req.body.phone,
      
    };

    if (req.file) {
      
      updateData.image = req.file.filename;
    }

    const updatedStudent = await student.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (updatedStudent) {
      console.log("Student updated successfully:", updatedStudent);
      res.redirect("/home");
    } else {
      // Handle case where the student is not found
      res.status(404).send("Student not found");
    }
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).send("Server Error");
  }
});



