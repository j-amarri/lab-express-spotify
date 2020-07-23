require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error =>
    console.log('Something went wrong when retrieving an access token', error)
  );

// Our routes go here:
app.get('/', (request, response) => {
  response.render('home');
});

app.get('/artist-search', (request, response) => {
  const term = request.query.term;
  spotifyApi
    .searchArtists(term)
    .then(data => {
      const dataArtists = data.body.artists.items;
      response.render('artist-search-results', { results: dataArtists });
    })
    .catch(err =>
      console.log('The error while searching artists occurred: ', err)
    );
});

app.get('/albums/:artistId', (request, response, next) => {
  const artistId = request.params.artistId;
  spotifyApi
    .getArtistAlbums(artistId)
    .then(data => {
      const albums = data.body.items;
      response.render('albums', { results: albums });
    })
    .catch(err =>
      console.log('The error while searching albums occured: ', err)
    );
});

app.get('/tracks/:albumId', (request, response, next) => {
  const albumId = request.params.albumId;
  spotifyApi
    .getAlbumTracks(albumId, { limit: 5, offset: 1 })
    .then(data => {
      const tracks = data.body.items;
      console.log(tracks);
      response.render('tracks', { results: tracks });
    })
    .catch(err => console.log('The error while loading tracks occured: ', err));
});

app.listen(3000, () =>
  console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊')
);
