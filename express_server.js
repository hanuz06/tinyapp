const express = require("express");
const app = express();
const PORT = 8080; // default port 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
let morgan = require('morgan');
const bcrypt = require('bcrypt');
const {
  getUserByEmail
} = require('./helpers');

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


let generateRandomString = () => {
  let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let num = '';
  for (let i = 0; i < 6; i++) {
    num += str[Math.floor(Math.random() * (62 - 1) + 1)];
  }
  return num;
};

//renders the front page
app.get("/", (req, res) => {
  const cookie = req.session.user_id;

  if (cookie) {
    res.redirect("/urls");
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const cookie = req.session.user_id;

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
    user: users[req.session.user_id]
  };
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let url = [];
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  const cookie = req.session.user_id;

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
      res.status(403).send("<h2>The URL already exists</h2>");
    }
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect(`/login`);
  }
});

//show info for a single URL
app.get("/urls/:shortURL", (req, res) => {
  const cookie = req.session.user_id;
  let shortURL = req.params.shortURL;
  let newDataBase = urlsForUser(urlDatabase, cookie);
  let isShortURLValid = false;

  let templateVars = {
    user: users[cookie],
    longURL: longURLVal(urlDatabase, cookie),
    shortURL: shortURL
  };

  for (let url in newDataBase) {
    if (url === shortURL) {
      isShortURLValid = true;
    }
  }

  if (cookie) {
    if (isShortURLValid) {
      res.render("urls_show", templateVars);
    } else {
      res.status(403).send("<h2>You do not have this URL</h2>");
    }
  } else {
    res.status(403).send("<h2>You need to login first</h2>");
  }

});

//delete
app.post("/urls/:id/delete", (req, res) => {
  const cookie = req.session.user_id;
  const itemID = req.params.id;

  if (cookie) {
    if (urlDatabase[itemID].userID === cookie) {
      delete urlDatabase[itemID];

      res.redirect("/urls");
    } else {
      res.status(403).send("<h2>Deletion no allowed</h2>");
    }
  } else {
    res.status(403).send("<h2>You need to login first</h2>");
  }
});

//update
app.post("/urls/:shortURL/edit", (req, res) => {
  const cookie = req.session.user_id;

  if (cookie) {
    let longURL = req.body.longURL;
    if (!longURL.startsWith('http://') && !longURL.startsWith('https://')) {
      longURL = 'https://'.concat(longURL);
    } else {
      longURL;
    }
    urlDatabase[req.params.shortURL].longURL = longURL;
    let newDataBase = urlsForUser(urlDatabase, cookie);
    let isURLValid = false;

    for (let sURL in newDataBase) {
      if (sURL === req.params.shortURL) {
        isURLValid = true;
      }
    }
    isURLValid ? res.redirect("/urls") : res.status(403).send("<h2>You doesn't own this URL</h2>");
  } else {
    res.status(403).send("<h2>Please login first</h2>");
  }
});

//redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  let longURL = '';

  for (let url in urlDatabase) {
    if (url === req.params.shortURL) {
      longURL = urlDatabase[url].longURL;
    }
  }

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(403).send("<h2>URL doesn't exist</h2>");
  }
});

//login GET
app.get("/login", (req, res) => {
  const cookie = req.session.user_id;
  let templateVars = {
    user: users[cookie]
  };

  if (cookie) {
    res.redirect('/urls');
  } else {
    res.render("urls_login", templateVars);
  }
});

//login POST
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let emailFound = false;
  const userID = getUserByEmail(userEmail, users);


  if (userID) {
    emailFound = true;
  } else {
    res.status(403).send("<h2>Email doesn't exist</h2>");
  }

  let hashedPassword = users[userID].password;
  if (emailFound) {

    if (bcrypt.compareSync(userPassword, hashedPassword)) {
      console.log('users[userID].password ', users[userID].password);
      req.session["user_id"] = userID;
      res.redirect('/urls');
    } else {
      res.status(403).send("<h2>Password is not correct</h2>");
    }
  }
});

//logout
app.post("/urls/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//registration
app.get("/register", (req, res) => {
  const cookie = req.session.user_id;
  let templateVars = {
    user: users[req.session.user_id]
  };

  if (cookie) {
    res.redirect('/urls');
  } else {
    res.render("urls_registration", templateVars);
  }
});

//registration handler
app.post("/register", (req, res) => {
  const cookie = req.session.user_id;
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let newUserID = generateRandomString();

  if (cookie) {
    res.redirect('/urls');
  } else {
    if (!userEmail || !userPassword) {
      res.status(403).send("<h2>Email or password needed</h2>");
    }

    let userID = getUserByEmail(userEmail, users);

    if (userID) {
      res.status(403).send("<h2>Email exists</h2>");
    }

    users[newUserID] = {};
    users[newUserID].id = newUserID;
    users[newUserID].email = userEmail;
    users[newUserID].password = bcrypt.hashSync(userPassword, 10);
    req.session["user_id"] = newUserID;

    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});