const express = require("express");
const app = express();
const PORT = 8080; // default port 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const moment = require('moment');
const {
  getUserByEmail,
  urlsForUser,
  longURLVal,
  generateRandomString
} = require('./helpers');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: 'session',
  keys: ['andrey']
}));

app.set('view engine', 'ejs');

//users database; below entry is left to show how each user entry will look like
const users = {};

//below entry is left to show how url entry will look like
const urlDatabase = {};

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

//add a new url
app.post("/urls", (req, res) => {
  let url = [];
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  const cookie = req.session.user_id;
  const time = moment().subtract(6, 'hours').format("D MMM YYYY, H:m");

  if (cookie) {
    if (!longURL) {
      res.status(400).send("<h2>Please enter URL</h2>");
    }

    if (longURL !== '' && !longURL.startsWith('http://') && !longURL.startsWith('https://')) {
      longURL = 'https://'.concat(longURL);
    } else {
      longURL;
    }

    for (let i in urlDatabase) {
      if (longURL === '', urlDatabase[i].longURL === longURL && urlDatabase[i].userID === cookie) {
        url.push(urlDatabase[i].longURL);
      } else {
        url;
      }
    }

    if (longURL !== '' && url.length === 0) {
      urlDatabase[shortURL] = {
        longURL: longURL,
        userID: cookie,
        time: time
      };
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
  let shortURLExists = false;

  if (cookie) {
    //returns true if the short URL exists in general database
    for (let url in urlDatabase) {
      if (url === shortURL) {
        shortURLExists = true;
      }
    }

    if (!shortURLExists) {
      res.status(404).send("<h2>Requested link does not exist</h2>");
    }

    //returns true if the short URL exists in database of links for logged in user
    for (let url in newDataBase) {
      if (url === shortURL) {
        isShortURLValid = true;
      }
    }

    let templateVars = {
      user: users[cookie],
      longURL: longURLVal(urlDatabase, cookie),
      shortURL: shortURL,
      time: newDataBase[shortURL].time
    };

    if (isShortURLValid) {
      res.render("urls_show", templateVars);
    } else {
      res.status(404).send("<h2>You do not own this URL</h2>");
    }
  } else {
    res.status(404).send("<h2>You need to login first</h2>");
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
    res.status(404).send("<h2>You need to login first</h2>");
  }
});

//update
app.post("/urls/:shortURL/edit", (req, res) => {
  const cookie = req.session.user_id;

  if (cookie) {
    let longURL = req.body.longURL;

    if (!longURL) {
      res.status(400).send("<h2>Please enter URL</h2>");
    }

    if (longURL !== '') {
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
    }
  } else {
    res.status(404).send("<h2>Please login first</h2>");
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
    res.status(404).send("<h2>URL doesn't exist</h2>");
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
    res.status(404).send("<h2>Email doesn't exist</h2>");
  }

  let hashedPassword = users[userID].password;
  if (emailFound) {
    if (bcrypt.compareSync(userPassword, hashedPassword)) {
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
      res.status(403).send("<h2>Email or password missing</h2>");
    }

    let userID = getUserByEmail(userEmail, users);

    if (userID) {
      res.status(403).send("<h2>Email exists</h2>");
    }

    users[newUserID] = {
      id: newUserID,
      email: userEmail,
      password: bcrypt.hashSync(userPassword, 10)
    };

    req.session["user_id"] = newUserID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});