# Twitter API v2 Testing

This is a POC app to tweet messages with media using Twitter API V1 and V2 using node-twitter-api-v2 package

## Getting Started

1. Register a Twitter application using developer.twitter.com
2. Duplicate .env-sample file as .env
3. Assign values to APP_KEY with consumer key and APP_SECRET with consumer secret of the application you created with twitter developer account
4. Update PORT value if needed. Defaults to 3000
5. Install dependencies (node v16+)
6. Run application using `npm start`

## API Testing

Refer postman collection for API testing

### /twitter/verify_credentials

This endpoint will retrieve stored access token data and validate whether access token is active. If successful, it will return logged in user data

### /twitter/request_token

This endpoint will generate an authorization url that will generate a oauth_verifier token once authorized.
Calling this endpoint will provide access token and access token secret that needs to be send for authorization with oauth verifier. Postman collection will store those values in the collection variables

### /twitter/access_token

This endpoint will fetch an access token for the given oauth_verifier. In Postman, update oauth_verifier variable value with the token retried from request_token endpoint URL. If authentication successful, API will provide logged in user details

### /twitter/post

Post a tweet with image. In Postman, update image file and tweet variables. If successful, API will respond with tweet details.
