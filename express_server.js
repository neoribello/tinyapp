const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// REGISTER
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  let userID = generateRandomID();
  let email = req.body.email;
  let password = req.body.password;

  if(email === '' || password === '') {
    res.redirect('400');
  }

  // EMAIL LOOKUP
  // iterate through the users obj
  for (const user in users) {
    if (users[user].email === email) {
      res.redirect('400');
    }
  }

  users[userID] = { id: userID, email: email, password: password }

  console.log(users);
  res.cookie('user_id', userID);
  res.redirect('/urls');
})

// LOGIN
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  // iterate through users obj just like register
  for (const user in users) {
    if (users[user].email === email) {
      if (users[user].password === password) {
        res.cookie('user_id', users[user].id);
        res.redirect('/urls');
      }
    }
  }
  res.redirect('403');
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("login", templateVars)
})


// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const deleteItem = req.params.shortURL;
  delete urlDatabase[deleteItem];
  res.redirect("/urls");
});

// UPDATE
app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// show url
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  shortURL = req.params.shortURL
  longURL = urlDatabase[req.params.shortURL]
  res.render("urls_show", templateVars);
});

// Log the POST request body to the console
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});


//generate random ID
const generateRandomID = () => {
  let output = "";
  const char = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 10; i++) {
    let newChar = char[Math.floor((Math.random() * char.length))];
    output += newChar;
  }
  return output;
}

//create random URL
const generateRandomString = () => {
  let output = "";
  const char = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    let newChar = char[Math.floor((Math.random() * char.length))];
    output += newChar;
  }
  return output;
};