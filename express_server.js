const express = require("express");
//const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
//const { getUserbyEmail } = require('./helpers.js');


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
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);

//to check password
//bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); => returns true
//bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); => returns false

//////////////////////////////////
//SET UP : 
//////////////////////////////////

//Server Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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


//original database
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

function generateRandomString() {
  return Math.random().toString(36).slice(2,8);
};

const checkIfExist = email => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};



const findURLsForUser = id => {
  let URLsForUser = {};
  for (let shortURL in urlDatabase) {
    let userID = urlDatabase[shortURL].userID;
    if (userID === id) {
      URLsForUser[shortURL] = urlDatabase[shortURL];
    }
  }
  return URLsForUser;
};

const getUserbyEmail = (email, database) => {
  //const database = users;
    for (let user in database) {
      if (database[user].email === email) {
       return database[user];
    }
  }
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
  //seems like this longURL isnt working....
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};

  if (!req.session.user_id) {
    res.redirect(`/login`);
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
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.shortURL], user: req.session.user_id};
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL]);
  } else {
    res.send(`The URL does not exist.`)
  }
})

//to update a longURL resource
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // const longURL = req.body.longURL;
  // urlDatabase[shortURL] = longURL;
  // res.redirect(`/urls/${shortURL}`);
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

app.get("urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  if (templateVars.user) {
    res.render("urls_index", templateVars)
  }
  res.render("login", templateVars);
})

//User logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
})

//if the user is logged in, redirect to GET /urls
app.get("/register", (req, res) => {
  // const userID = req.cookies["user_id"];
  //const templateVars = { user: users[req.cookies['user_id']]};
  // res.render("register", templateVars);
  const userID = req.session.user_id;
  if (userID) {
    res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.user_id]};
  res.render("register", templateVars)
});

//if the user is logged in, redirect to GET /urls
app.get("/login", (req, res) => {
  // const templateVars = { user: users[req.cookies['user_id']]};
  // res.render("login", templateVars);
  // const userID = req.signedCookies["user_id"];

  const templateVars = { user: users[req.session.user_id]};

  if (templateVars.user) {
    res.redirect('/urls');
  }
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

    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password)
    };
    //create user cookie
    res.cookie('user_id', users[userID].id);
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
    // const findUser = getUserbyEmail(inputEmail);
    // console.log('findUser : ', findUser);
    // const userID = findUser.id;
    // console.log('userID', userID);
    // if (bcrypt.compareSync(inputPassword, hashedPassword) === false) {
    //   res.status(403).send("Sorry, the password doesn't match our record.");
    // } else {
    //   res.cookie('user_id', userID);
    //   res.redirect('/urls');
    // }
    res.status(403).send("Sorry, the password doesn't match our record.");
  } else {
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

//logout; delete user cookie
app.post('/logout', (req, res) => {
  //res.clearCookie('user_id');
  res.clearCookie('session');
  res.redirect('/urls');
});


