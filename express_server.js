const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { generateRandomString, checkIfExist, findURLsForUser, getUserbyEmail } = require("./helpers");


app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['39c71980-31c5-4340-b73e-24fad3357a71']
  })
);

//POST request
app.use(express.urlencoded({ extended: true }));

// set the view engine to ejs
app.set('view engine', 'ejs');

//Add bcrypt
const bcrypt = require("bcryptjs");


//////////////////////////////////
//SET UP : 
//////////////////////////////////


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

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

//turn responses to JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//updated database with URLs belonging to users
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userExampleID"
  },

  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userExampleID",
  },
}


//////////////////////////////////
//Routing
//////////////////////////////////

//pass the URL data to template
app.get("/urls", (req, res) => {
  const templateVars = { urls: findURLsForUser(req.session.user_id), user: req.session.user_id };
  res.render("urls_index", templateVars);
});

//Generate short URLs and redirect
//only logged-in users can shorten URLs
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};

  if (!req.session.user_id) {
    res.send('Only logged in users are allowed to shorten URLs.')
  }
  res.redirect(`/urls/${shortURL}`);
});

//Create new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user : req.session.user_id,
    urls : urlDatabase
  };

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;

  if (userID) {
    findURLsForUser(userID, urlDatabase);
  } else {
    res.send("Please log in to see URLs.")
  }

  if (!urlDatabase[shortURL]) {
    res.send('The URL does not exist.')
  }
    
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: req.session.user_id};

  if (userID === urlDatabase[templateVars.shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.send(`Only the creator has access to this URL.`)
  }
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(`https://${longURL}`);
  } else {
    res.send(`The URL does not exist.`)
  }
})


//to update a longURL resource
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send("Sorry, only the creator can edit their URLs.")
  }
});


//to remove a URL resource and redirect to index page
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Sorry, only the creator can delete their URLs.")
  }
});


//if the user is logged in, redirect to GET /urls
app.get("/register", (req, res) => {

  const userID = req.session.user_id;
  if (userID) {
    res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.user_id]};
  res.render("register", templateVars)
});

//if the user is logged in, redirect to GET /urls
app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
})

//Registration handler
app.post("/register", (req, res) => {

  //if email/password is empty, or the email already exists, return "400"
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please check if you entered both email and password.");
  } else if (checkIfExist(req.body.email)) {
    res.status(400).send("This email has been registered. Please login.");
  } else {
    const userID = generateRandomString();
    
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: hashedPassword
    };

    //console.log(users[userID]);
    req.session.user_id = users[userID].id;
    res.redirect(`/urls`);
  };
});


//Update the login handler
app.post("/login", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const user = getUserbyEmail(inputEmail, users)

  //return status code 403 if the email cannot be found, or the password doesn't match.
  if(!user) {
    res.status(403).send("This email cannot be found.")
  } else if (!bcrypt.compareSync(inputPassword, user.password)) {
    console.log(inputPassword, user.password)
    console.log(bcrypt.compareSync(inputPassword, user.password))

    res.status(403).send("Sorry, the password doesn't match our record.");
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

//logout; delete user cookie
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//Server Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


