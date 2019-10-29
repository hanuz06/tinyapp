const express = require("express");
const app = express();
const PORT = 8080; // default port 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
  extended: true
}));

// set the view engine to ejs
app.set('view engine', 'ejs');

function generateRandomString() {
  let num = '';
  for (let i = 0; i < 6; i++) {
    num += String.fromCharCode(Math.floor(Math.random() * (122 - 48) + 48));
  }
  return num;
}
generateRandomString();

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
console.log('urlDatabase ', urlDatabase);

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
    longURL: urlDatabase[shortURL],
    shortURL: shortURL
  };
  res.render("urls_show", templateVars);
});

//Delete 
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL]
  let templateVars = {
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  console.log(longURL);
  if (longURL) {
    res.redirect(longURL);
  }
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