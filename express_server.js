const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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


// REGISTER
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  let userID = generateRandomID();
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);

  if(email === '' || password === '') {
    res.sendStatus(400);
  }

  // EMAIL LOOKUP
  // iterate through the users obj
  for (const user in users) {
    if (users[user].email === email) {
      res.sendStatus(400);
    }
  }
  users[userID] = { id: userID, email: email, password: hashedPassword }
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
      if (bcrypt.compareSync(password, users[user].password)) {
        res.cookie('user_id', users[user].id);
        res.redirect('/urls');
      }
    }
  }
  res.status('403').redirect('/login');
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
  if(!req.cookies.user_id) {
    res.send('403');
  } else {
    const deleteItem = req.params.shortURL;
    delete urlDatabase[deleteItem];
    res.redirect("/urls");
  }
});

// UPDATE
app.post("/urls/:shortURL/update", (req, res) => {
  if(!req.cookies.user_id) {
    res.send('403');
  } else {
    urlDatabase[req.params.shortURL] = req.body.longURL;
    res.redirect("/urls");
  }
});

// SHOW URLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.cookies.user_id), user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
  console.log(urlDatabase)
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  if (!templateVars.user) {
    res.redirect("/login");
  } 
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.redirect('403');
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  }
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
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: req.cookies.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

// return URL == id
const urlsForUser = (id) => {
  let userUrls = {};
  for (key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
}

//generate random ID
const generateRandomID = () => {
  let output = "";
  const char = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
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

// Code from compass

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});