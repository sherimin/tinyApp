

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
};
  
  

module.exports = { generateRandomString, checkIfExist, findURLsForUser, getUserbyEmail }