const getUserByEmail = function(email, users) {
  let user = '';

  for (let i in users) {
    if (users[i].email === email) {
      user = users[i].id;
    }
  }
  return user;
};

//returns URL list of logged in user
const urlsForUser = (urlDatabase, cookie) => {
  let newObj = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === cookie) {
      newObj[item] = urlDatabase[item];
    }
  }
  return newObj;
};

//finds long URL based on cookie
const longURLVal = (urlDatabase, cookie) => {
  let newLongURL = '';
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === cookie) {
      newLongURL = urlDatabase[shortURL].longURL;
    }
  }
  return newLongURL;
};

const generateRandomString = () => {
  let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let num = '';
  for (let i = 0; i < 6; i++) {
    num += str[Math.floor(Math.random() * (62 - 1) + 1)];
  }
  return num;
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  longURLVal,
  generateRandomString
};