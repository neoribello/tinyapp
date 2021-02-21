const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080;

const { getUserByEmail, generateRandomString } = require("./helpers");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

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

// If the user is already logged in it redirects to the URLs page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);

  // if the inputs are empty throw error
  if (email === '' || password === '') {
    res.status(403).send("empty inputs");
  }

  //if the email === an email in the database throws error
  if (getUserByEmail(email, users)) {
    res.status(403).send("user already taken");
  }
  users[userID] = { id: userID, email: email, password: hashedPassword };
  req.session.user_id = userID;
  res.redirect('/urls');
});

// LOGIN

// If the user is already logged in it redirects to the URLs page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let currentLogin = getUserByEmail(email, users);

  // if the inputs are empty throw error
  if (email === '' || password === '') {
    res.status(403).send("empty inputs");
  }

  // if the user inputs wrong credentials throws error
  if (!currentLogin) {
    res.status(403).send("wrong credentials");
  }

  // if the user inputs wrong password throws error
  if (!bcrypt.compareSync(password, users[currentLogin].password)) {
    res.status(403).send("wrong password");
  }
  req.session.user_id = currentLogin;
  res.redirect("/urls");
});

// LOGOUT deletes cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// DELETE

// if the user is not logged in then cannot access /urls/:id
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const deleteItem = req.params.shortURL;
    delete urlDatabase[deleteItem];
    res.redirect("/urls");
    return;
  }
  res.status(401).send("unauthorized");
});

// UPDATE

// if the user is not logged in then cannot access /urls/:id
app.post("/urls/:shortURL/update", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
    return;
  }
  res.status(401).send("unauthorized");
});

// SHOW URLS

// GET to /urls while not logged in navigates to /urls. This should provide an html error message instead.
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id] };
  if (templateVars.user) {
    res.render("urls_index", templateVars);
    return;
  }
  res.status(401).send("unauthorized");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.redirect(403).send("URL doesn't exist");
    return;
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// GET to /urls/:id when not logged in, or logged in as a user who does not own the link still shows the urls_show.ejs for that shortURL. Should provide html error messages instead.
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (templateVars.user) {
    shortURL = req.params.shortURL;
    longURL = urlDatabase[req.params.shortURL].longURL;
    res.render("urls_show", templateVars);
  }
  res.status(401).send("unauthorized");
});

// Log the POST request body to the console
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});


const urlsForUser = (id) => {
  let userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

// Code from compass

app.get("/", (req, res) => {
  res.redirect("/login")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});