const express = require("express");
const app = express();
const PORT = 8080; // default port 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// index page 
// index page 
app.get('/', function (req, res) {
  var drinks = [{
      name: 'Bloody Mary',
      drunkness: 3
    },
    {
      name: 'Martini',
      drunkness: 5
    },
    {
      name: 'Scotch',
      drunkness: 10
    }
  ];
  var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";

  res.render('pages/index', {
    drinks: drinks,
    tagline: tagline
  });
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// about page 
app.get('/about', function (req, res) {
  res.render('pages/about');
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