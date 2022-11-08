function generateRandomString() {
  return Math.random().toString(36).slice(2,8);
};



const findURLsForUser = (urlDatabase, id) => {

  let URLsForUser = {};
  for (let shortURL in urlDatabase) {
    const url = urlDatabase[shortURL]
    if (url.userID === id) {
      URLsForUser[shortURL] = url;
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
  
  

module.exports = { generateRandomString, findURLsForUser, getUserbyEmail }