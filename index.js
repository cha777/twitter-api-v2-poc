require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const TwitterApi = require('twitter-api-v2').TwitterApi;
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const appKey = process.env.APP_KEY;
const appSecret = process.env.APP_SECRET;

let client;

const _getTokenData = async () => {
  const tokenDataPath = path.join(__dirname, 'token.dat');

  if (fs.existsSync(tokenDataPath)) {
    const tokenData = JSON.parse(await fs.promises.readFile(tokenDataPath, { encoding: 'utf8' }));
    return tokenData;
  } else {
    console.log('User not logged in');
  }
};

const _saveTokenData = async (tokenData) => {
  const tokenDataPath = path.join(__dirname, 'token.dat');
  await fs.promises.writeFile(tokenDataPath, JSON.stringify(tokenData), { encoding: 'utf8' });
};

app.get('/twitter/verify_credentials', async (_, res) => {
  try {
    const tokenData = await _getTokenData();

    if (tokenData && tokenData.accessToken && tokenData.accessSecret) {
      const verifyClient = new TwitterApi({
        appKey,
        appSecret,
        accessToken: tokenData.accessToken,
        accessSecret: tokenData.accessSecret,
      });

      const user = await verifyClient.currentUser();

      if (user) {
        client = verifyClient;
        res.status(200).json({ success: true, screenName: user.screen_name, name: user.name });
        return;
      }
    }

    res.status(401).json({ error: 'User not authenticated' });
  } catch (err) {
    console.error(`Error while executing verify_credentials: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.get('/twitter/request_token', async (_, res) => {
  try {
    const connectivityClient = new TwitterApi({
      appKey,
      appSecret,
    });

    const authLink = await connectivityClient.generateAuthLink();
    console.log('url', authLink.url);

    res.status(200).json(authLink);
  } catch (err) {
    console.error(`Error while executing request_token: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.get('/twitter/access_token', async (req, res) => {
  try {
    const tokenData = req.body;
    const connectivityClient = new TwitterApi({
      appKey,
      appSecret,
      ...tokenData,
    });

    const result = await connectivityClient.login(tokenData.oauth_verifier);

    _saveTokenData({
      accessToken: result.accessToken,
      accessSecret: result.accessSecret,
    });

    console.log('User logged in');

    client = result.client; // new TwitterApi({ appKey, appSecret, accessToken, accessSecret });

    res.status(200).json({ success: true, userId: result.userId, screenName: result.screenName });
  } catch (err) {
    console.error(`Error while executing access_token: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.get('/twitter/post', async (req, res) => {
  try {
    if (client) {
      const imgPath = path.resolve('/Users/chathuranga/Desktop/Screenshot 2024-02-05 at 2.48.54 PM.png');
      const mediaId = await client.v1.uploadMedia(imgPath);
      const tweet = await client.v2.tweet({
        text: 'My tweet text with image!',
        media: { media_ids: [mediaId] },
      });

      res.status(200).json({ success: true, tweet });
    } else {
      res.status(401).json({ error: 'User not logged in' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(`Error while executing post: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
