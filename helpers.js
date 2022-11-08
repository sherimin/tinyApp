function generateRandomString() {
  return Math.random().toString(36).slice(2,8);
};



const findURLsForUser = (urlDatabase, id) => {
  console.log('\n*** userID = ', id)
  console.log(urlDatabase);
  let URLsForUser = {};
  for (let shortURL in urlDatabase) {
    const url = urlDatabase[shortURL]
    console.log('url = ', url)
    if (url.userID === id) {
      console.log('add new url', url);
      URLsForUser[shortURL] = url;
    }
  }
  console.log('find = ', URLsForUser, '\n***\n')
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