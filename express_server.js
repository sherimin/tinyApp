const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());

//POST request
app.use(express.urlencoded({ extended: true }));

// set the view engine to ejs
app.set('view engine', 'ejs');

//////Routing

//pass the URL data to template
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

//Generate short URLs and redirect
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Create new urls
app.get("/urls/new", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: `urlDatabase`, username: users[req.cookies['user_id']]};
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL]);
  } else {
    res.send(`The URL does not exist.`)
  }
})

//to update a longURL resource
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});


//to remove a URL resource and redirect to index page
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect(`/urls`);
});


//User login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect(`/urls`);
})

app.get("urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
})

//User logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls`);
})

//user registration
app.get("/register", (req, res) => {
  const templateVars = { username: users[req.cookies['user_id']]};
  res.render("register", templateVars);
  res.redirect('/urls/register');
});

app.get("/login", (req, res) => {
  const templateVars = { username: users[req.cookies['user_id']]};
  res.render("login", templateVars);
  res.redirect('/urls/login')
})

//Registration handler
app.post("/register", (req, res) => {
  const userID = generateRandomString();

  if (!req.body.email || !req.body.password) {
    res.status(400);
    return;
  }

  if ((users[req.body.email]) > -1) {
    res.status(400);
    return;
  }

  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  }


  //console.log for testing
  //console.log(users);

  //create user cookie
  res.cookie('user_id', userID);
  res.redirect(`/urls`);

  //delete user cookie
  app.post('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/urls');
  })
})




//original database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).slice(2,8);
};

//create database for user info
const users = {
  userExample: {
    id: "userExampleID",
    email: "user@example.com",
    password: "example",
  },

  userTwoExample: {
    id: "userTwoExample",
    email: "user2@example.com",
    password: "Example",
  },

};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//Server Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


