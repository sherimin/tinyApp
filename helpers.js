const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userExampleID"
  },

  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userExampleID",
  },
};

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
    for (let user in database) {
      if (database[user].email === email) {
        return database[user];
    }
  }
};
  
  

module.exports = { generateRandomString, checkIfExist, findURLsForUser, getUserbyEmail }