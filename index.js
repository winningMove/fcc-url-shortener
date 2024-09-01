require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("node:dns");

const shortToFullUrlMap = {};
let shortUrlAddress = 1;

app.use(function setAccessHeader(req, res, next) {
  res.setHeader("Access-Control-Allow-Private-Network", true);
  next();
});
app.use(cors({ optionsSuccessStatus: 200 }));
app.use("/public", express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(`${__dirname}/views/index.html`);
});

app.post("/api/shorturl", function (req, res) {
  const url = req.body.url;
  if (!URL.canParse(url)) {
    return res.json({ error: "invalid url" });
  } else {
    const urlObj = new URL(url);
    if (!/^https?:$/.test(urlObj.protocol)) {
      return res.json({ error: "invalid url" });
    }
  }
  let shortUrl;
  if (Object.values(shortToFullUrlMap).includes(url)) {
    shortUrl = Object.keys(shortToFullUrlMap).find(
      (k) => shortToFullUrlMap[k] === url
    );
  } else {
    shortUrl = `${shortUrlAddress++}`;
    shortToFullUrlMap[shortUrl] = url;
  }

  res.json({
    original_url: url,
    short_url: shortUrl,
  });
});

app.get("/api/shorturl/:shorturl", function (req, res) {
  const reqUrl = req.params.shorturl;
  const longUrl = shortToFullUrlMap[reqUrl];

  if (!longUrl) return res.json({ error: "url not found" });

  res.redirect(longUrl);
});

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log(`Listening on port ${listener.address().port}`);
});
