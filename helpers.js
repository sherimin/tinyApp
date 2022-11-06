
const getUserbyEmail = (email, database) => {
  //const database = users;
    for (let user in database) {
      if (database[user].email === email) {
        return database[user];
    }
  }
};
  
  

module.exports = { getUserbyEmail }