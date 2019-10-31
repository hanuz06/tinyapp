const express = require("express");
const app = express();
const PORT = 8080; // default port 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
let morgan = require('morgan');
const bcrypt = require('bcrypt');

morgan(':method :url :status :res[content-length] - :response-time ms');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['andrey']
}));

// set the view engine to ejs
app.set('view engine', 'ejs');

//users database
const users = {
  "npaMvY": {
    id: "npaMvY",
    email: "ali@mail.ru",
    password: "123456"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const urlsForUser = (urlDatabase, cookie) => {
  let newObj = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === cookie) {
      newObj[item] = urlDatabase[item];
    }
  }
  return newObj;
};

const longURLVal = (urlDatabase, cookie) => {
  let newLongURL = '';
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === cookie) {
      newLongURL = urlDatabase[shortURL].longURL;
    }
  }
  return newLongURL;
};

let isEmailExists = reqEmail => {
  let res = false;
  for (let user in users) {
    users[user].email === reqEmail ? res = true : res;
  }
  return res;
};

let generateRandomString = () => {
  let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let num = '';
  for (let i = 0; i < 6; i++) {
    num += str[Math.floor(Math.random() * (62 - 1) + 1)];
  }
  return num;
};

app.get("/urls", (req, res) => {
  const cookie = req.cookies["user_id"];

  if (cookie) {
    let newDataBase = urlsForUser(urlDatabase, cookie);

    let templateVars = {
      user: users[cookie],
      urls: newDataBase
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let url = [];
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  const cookie = req.cookies["user_id"];

  if (cookie) {
    if (!longURL.startsWith('http://') && !longURL.startsWith('https://')) {
      longURL = 'https://'.concat(longURL);
    } else {
      longURL;
    }

    for (let i in urlDatabase) {
      if (urlDatabase[i].longURL === longURL && urlDatabase[i].userID === cookie) {
        url.push(urlDatabase[i].longURL);
      } else {
        url;
      }
    }

    if (url.length === 0) {
      urlDatabase[shortURL] = {};
      urlDatabase[shortURL].longURL = longURL;
      urlDatabase[shortURL].userID = cookie;
    } else {
      console.log("The URL already exists");
    }
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect(`/login`);
  }

});

app.get("/urls/:shortURL", (req, res) => {
  const cookie = req.cookies["user_id"];
  let shortURL = req.params.shortURL;
  let templateVars = {
    user: users[cookie],
    longURL: longURLVal(urlDatabase, cookie),
    shortURL: shortURL
  };

  if (cookie) {
    res.render("urls_show", templateVars);
  } else {
    res.redirect('/login');
  }
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  const cookie = req.cookies["user_id"];
  const itemID = req.params.id;

  if (urlDatabase[itemID].userID === cookie) {
    delete urlDatabase[itemID];

    let newDataBase = urlsForUser(urlDatabase, cookie);

    let templateVars = {
      user: users[cookie],
      urls: newDataBase
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("<h2>Deletion no allowed</h2>");
  }

});

//update
app.post("/urls/:shortURL/edit", (req, res) => {
  const cookie = req.cookies["user_id"];

  if (cookie) {
    let longURL = req.body.longURL;
    if (!longURL.startsWith('http://') && !longURL.startsWith('https://')) {
      longURL = 'https://'.concat(longURL);
    } else {
      longURL;
    }
    urlDatabase[req.params.shortURL].longURL = longURL;
    let newDataBase = urlsForUser(urlDatabase, cookie);
    let templateVars = {
      user: users[req.cookies["user_id"]],
      urls: newDataBase
    };

    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});

//redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  }
});

//login GET
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

//login POST
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let userID = '';
  let emailFound = false;

  if (isEmailExists(userEmail)) {
    for (let user in users) {
      if (users[user].email === userEmail) {
        emailFound = true;
        userID = user;
      }
    }
  } else {
    res.status(403).send("<h2>Email doesn't exist</h2>");
  }

  let hashedPassword = users[userID].password;
  if (emailFound) {

    if (bcrypt.compareSync(userPassword, hashedPassword)) {
      console.log('users[userID].password ', users[userID].password);
      res.cookie('user_id', userID);
      res.redirect('/urls');
    } else {
      res.status(403).send("<h2>Password is not correct</h2>");
    }
  }
});

//logout
app.post("/urls/logout", (req, res) => {
  res.clearCookie('user_id', users[req.cookies["user_id"]]);
  res.redirect("/login");
});

//registration
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_registration", templateVars);
});

//registration handler
app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let newUserID = generateRandomString();

  if (!userEmail || !userPassword) {
    res.status(403).send("<h2>Email or password needed</h2>");
  }

  if (isEmailExists(userEmail)) {
    res.status(403).send("<h2>Email exists</h2>");
  }

  users[newUserID] = {};
  users[newUserID].id = newUserID;
  users[newUserID].email = userEmail;
  users[newUserID].password = bcrypt.hashSync(userPassword, 10);
  console.log("users[newUserID].password, ", users[newUserID].password);
  res.cookie('user_id', newUserID);

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});