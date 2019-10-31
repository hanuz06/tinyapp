const getUserByEmail = function(email, users) {
  let user = '';

  for (let i in users) {
    if (users[i].email === email) {
      user = users[i].id;
    }
  }
  return user;
};

module.exports = {
  getUserByEmail
};