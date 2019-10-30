const express = require("express");
const app = express();
const PORT = 8080; // default port 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
let cookieSession = require('cookie-session');
let morgan = require('morgan');

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

console.log(users);

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let isEmailExists = reqEmail => {
  let res = false;
  for (let user in users) {
    console.log("Email is ", users[user].email);
    console.log("reqEmail is ", reqEmail);
    console.log((users[user].email === reqEmail) ? true : false);
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
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {

  //console.log(req.body); // Log the POST request body to the console
  let url = [];
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;

  if (!longURL.startsWith('http://') && !longURL.startsWith('https://')) {
    longURL = 'https://'.concat(longURL);
  } else {
    longURL;
  }

  for (let i in urlDatabase) {
    if (urlDatabase[i] !== longURL) {
      url;
    } else {
      url.push(urlDatabase[i]);
    }
  }
  url.length === 0 ? urlDatabase[shortURL] = longURL : console.log("The URL already exists");
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = {
    user: users[req.cookies["user_id"]],
    longURL: urlDatabase[shortURL],
    shortURL: shortURL
  };
  res.render("urls_show", templateVars);
});

//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

//update
app.post("/urls/:shortURL/edit", (req, res) => {
  let longURL = req.body.longURL;
  if (!longURL.startsWith('http://') && !longURL.startsWith('https://')) {
    longURL = 'https://'.concat(longURL);
  } else {
    longURL;
  }

  urlDatabase[req.params.shortURL] = longURL;
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

//redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  console.log(longURL);
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

  if (isEmailExists(userEmail)) {
    for (let user in users) {
      if (users[user].email === userEmail) {
        userID = user;
        console.log('userID ', userID);
        if (users[userID].password === userPassword) {
          res.cookie('user_id', userID);
          res.redirect('/urls');
        } else {
          res.status(403).send("<h2>Password is not correct</h2>");
        }
      }
    }
  } else {
    res.status(403).send("<h2>Email doesn't exist</h2>");
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
  users[newUserID].password = userPassword;
  //res.cookie('user_id', newUserID);

  res.redirect("/urls");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello<b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});