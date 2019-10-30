const express = require("express");
const app = express();
const PORT = 8080; // default port 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');

let generateRandomString = () => {
  let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let num = '';
  for (let i = 0; i < 6; i++) {
    num += str[Math.floor(Math.random() * (62 - 1) + 1)];
  }
  return num;
};

//users database
const users = {
  // "userRandomID": {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur"
  // },
  // "user2RandomID": {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk"
  // }

}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
console.log('urlDatabase ', urlDatabase);

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
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
    username: req.cookies["username"],
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
    username: req.cookies["username"],
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
    username: req.cookies["username"],
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

//login
app.post("/urls/login", (req, res) => {

  res.cookie('username', req.body.username);

  res.redirect("/urls");
});

//logout
app.post("/urls/logout", (req, res) => {

  res.clearCookie('username', req.body.username);

  res.redirect("/urls");
});

//registration
app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_registration", templateVars);
});

//registration handler
app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  console.log("Email ", userEmail)
  let userPassword = req.body.password;
  console.log("Password ", userPassword)
  let newUserID = generateRandomString();

  users[newUserID]={};
  users[newUserID].id = newUserID;
  users[newUserID].email = userEmail;
  users[newUserID].password = userPassword;  
  res.cookie('username', newUserID);
  console.log("users ",users)
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