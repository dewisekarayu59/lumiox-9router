const { YoutubeTranscript } = require('youtube-transcript'); 
YoutubeTranscript.fetchTranscript('https://youtu.be/iIhyNCQ7aXE?si=_MacaAxnXPBjPyyi').then(r => console.log(r.length)).catch(console.error);
