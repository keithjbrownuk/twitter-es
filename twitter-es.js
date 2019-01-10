var Twitter = require('twitter');
var es = require('elasticsearch');
var config = require('./config');

var client = new Twitter({
    consumer_key: config.keys.consumer_key,
    consumer_secret: config.keys.consumer_secret,
    access_token_key: config.keys.access_token_key,
    access_token_secret: config.keys.access_token_secret
});
var esclient = new es.Client({
    host: config.host
});

var params = {screen_name: config.screenname,count:20};
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {

      for (i in tweets) {
	  let song = tweets[i].text.slice(15).split(" - ",2);
	  let artist = song[0];
	  let title = song[1];
	  let id = tweets[i].id;
	  let time = new Date(Date.parse(tweets[i].created_at));

	  esclient.exists(
	      {
		  index: 'songs',
		  type: 'song',
		  id: id
	      }
	  ).then(function(resp) {
	      if(!resp) {
		  postSong(id, artist, title, time);
	      }
	  });
	  
      }
}
});

async function postSong(id, artist, title, time) {
          console.log(time); 
          try {
              esclient.create({
                  index: 'songs',
                  type: 'song',
                  id: id,
                  body: {
                      title: title,
                      artist: artist,
                      time: time
                  }
              })
              } catch(e) {
                  console.log(e);
              }

}
