var playing = false;
var loading = false;
var scplayer1;
var requested = false;
var lastrequested;
var ended = 0;
var requestedfromsc = false;
var requestedtime = 0;
var player;
var soundcloud = true;
      
function onPlayerReady(event) {
        event.target.playVideo();
}

function onPlayerError(event) {
        socket.emit('request_next');
}

function onStateChange(event) {
        if(player.getPlayerState() == 0){
          socket.emit('request_next');
        }
}

function resetYoutubePlayer() {
  $("#player").remove();
  $("body").append("<div id='player'></div>")
}

$(".searchbox").css('top','42px');

function addZ(n) {
    return (n<10? '0':'') + n;
}

$('#playbtn').click(function()
  {

  if(soundcloud){  
  if(scplayer1.getState() == 'playing'){
    scplayer1.pause();
    $(".sm2-bar-ui").removeClass( "playing" );
  }
  else
  {
    scplayer1.play();
    $(".sm2-bar-ui").addClass( "playing" );
  }
}
else
{

if(player.getPlayerState() == 1){
    player.pauseVideo()
    $(".sm2-bar-ui").removeClass( "playing" );
  }
  else
  {
    player.playVideo()
    $(".sm2-bar-ui").addClass( "playing" );
  }

}

});

$('.next').click(function()
  {

  socket.emit('request_next');

});

SC.stream("/tracks/152366920", function(sound){
    scplayer1 = sound;
    scplayer2 = sound;
});

function checkstatus(){


  if(!soundcloud){
    if(player.getPlayerState() == 1){
      var ytposition = player.getCurrentTime();
      var ytduration = player.getDuration();
      var ytloaded = player.getVideoLoadedFraction()
      var ytpercentposition = (ytposition/ytduration) * 100;

      ytloaded = ytloaded * 100;

      $(".sm2-progress-ball").css('left', ytpercentposition + '%');
      $(".sm2-bar-ui").removeClass( "buffering" );
      $(".sm2-bar-ui").addClass( "playing" );
      $(".sm2-inline-time").text(addZ(Math.floor(ytposition / 60)) + ':' + addZ(Math.round(ytposition % 60)));
      $(".sm2-inline-duration").text(addZ(Math.floor(ytduration / 60)) + ':' + addZ(Math.round(ytduration % 60)));
      $(".sm2-progress-bar").css('width', ytloaded + '%');



    }
    if(player.getPlayerState() == 0){
          ended = ended + 1;

    if(ended > 20){
      socket.emit('request_next');
      ended = 0;
    }
      }
  }

  if(scplayer1.getState() == 'playing'){

      ended = 0;
      var position = scplayer1.getCurrentPosition();
      var duration = scplayer1.getDuration();
      var loaded = scplayer1.getLoadedPosition();
      var percentposition = (position/duration) * 100;
      var percentloaded = (loaded/duration) * 100;


      position = Math.round(position/1000);
      duration = Math.round(duration/1000);
      
      $(".sm2-progress-ball").css('left', percentposition + '%');
      $(".sm2-progress-bar").css('width', percentloaded + '%');
      $(".sm2-bar-ui").removeClass( "buffering" );
      $(".sm2-bar-ui").addClass( "playing" );
      $(".sm2-inline-time").text(addZ(Math.floor(position / 60)) + ':' + addZ(Math.round(position % 60)));
      $(".sm2-inline-duration").text(addZ(Math.floor(duration / 60)) + ':' + addZ(Math.round(duration % 60)));

      if(percentposition > 50){
        
      }
      requested = false;
 
      }
      else
      {


      }

      if(scplayer1.getState() == 'idle'){
        if(soundcloud){
      //socket.emit('request_next');
    }
      }

  if(scplayer1.getState() == 'paused' && requestedfromsc){
    requestedtime = requestedtime + 1;

    if(requestedtime > 30){
    socket.emit('request_next');
    requestedfromsc = false;
    requestedtime = 0;
    }
  }

  if(!requestedfromsc){
    requestedtime = 0;
  }

  if(scplayer1.getState() == 'ended'){
    ended = ended + 1;

    if(ended > 20){
      socket.emit('request_next');
      ended = 0;
    }

    $(".sm2-progress-ball").css('left','0%');
    $(".sm2-bar-ui").addClass( "buffering" );
    if(!requested){
    socket.emit('request_next');
    requested = true;
    }
  }

  if(scplayer1.getState() == 'error'){
    requested = false;
  }

  if(scplayer1.getState() == 'loading'){
    $(".sm2-bar-ui").addClass( "buffering" );
    ended = 0;
  }
  
}

socket.on('try_again', function(data){

    setTimeout(function(){ socket.emit('request_next'); }, 3000);
   
});


setInterval(checkstatus, 500);

socket.on('next_track', function(data){

  console.log(data.track);

  $(".sm2-progress-bar").css('width', '0%');
  $(".sm2-playlist-target").text(data.track.title);
  $(".sm2-progress-ball").css('left','0%');
  $(".sm2-bar-ui").addClass( "buffering" );
  $(".sm2-inline-time").text('00:00');
  $(".sm2-inline-duration").text('--:--');
  scplayer1.stop();
  resetYoutubePlayer();
  if(data.track.source == 'sc'){

    soundcloud = true;
    
  requestedfromsc = true;
  SC.stream("/tracks/" + data.track.source_id, function(sound){

    requestedfromsc = false;
  	scplayer1 = sound;
    scplayer1.play();

   });
}
else
{
        ended = 0;
        player = new YT.Player('player', {
          height: '5',
          width: '5',
          videoId: data.track.source_id,
          events: {
            'onReady': onPlayerReady,
            'onError': onPlayerError,
            'onStateChange': onStateChange,
          }
        });
        soundcloud = false;

}


});

socket.emit('request_next');