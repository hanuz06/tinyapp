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
  let url =[]
  for (let i in urlDatabase) {
    if (urlDatabase[i] !== req.body.longURL) {
      url;
    } else {
      url.push(urlDatabase[i]);
    }    
  }
  url.length === 0?  urlDatabase[generateRandomString()] = req.body.longURL: console.log("The URL already exists");
  console.log(urlDatabase);
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = {
    longURL: urlDatabase[shortURL],
    shortURL: shortURL
  }
  res.render("urls_show", templateVars);
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