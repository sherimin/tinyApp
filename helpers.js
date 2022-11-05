
const getUserbyEmail = (email, database) => {
  //const database = users;
    for (let user in database) {
      if (databse[user].email === email) {
       return database[user];
    }
  }
}

module.exports = { getUserbyEmail }