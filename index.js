require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

const shortToFullUrlMap = {};
let shortUrlAddress = 1;

app.use(cors({ optionsSuccessStatus: 200 }));
app.use("/public", express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(`${__dirname}/views/index.html`);
});

app.post("/api/shorturl", function (req, res) {
  const url = req.body?.url;
  let shortUrl;

  if (!URL.canParse(url)) {
    return res.status(400).json({ error: "invalid url" });
  } else if (Object.values(shortToFullUrlMap).includes(url)) {
    shortUrl = Object.keys(shortToFullUrlMap).find(
      (k) => shortToFullUrlMap[k] === url
    );
  } else {
    shortUrl = shortUrlAddress.toString();
    shortUrlAddress++;
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

  if (!longUrl) return res.status(404).json({ error: "url not found" });

  res.redirect(longUrl);
});

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log(`Listening on port ${listener.address().port}`);
});
