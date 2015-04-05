document.oncontextmenu =new Function("return false;")
var $container = $('#content');
var $loading = $('.head-nav');
var duplicate = false;
var socket = io.connect("http://192.168.1.5/");
var ytplayer;
var oldsocket;

function escapeHtml(html)
{
    var text = document.createTextNode(html);
    var div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
}

socket.on('connect', function(data){
  console.log('connect!');
  oldsocket = socket.id;
  $("#reconnect").hide();
});

socket.on('create_succeeded', function(data){

  oldsocket = socket.id;
  console.log('create_succeeded');
  $(".header").fadeOut('slow');
  $container.fadeOut('slow');
  $("footer").fadeIn('slow');
  $(".sm2-bar-ui").fadeIn('slow');

  $.get( "session", function( data ) {
    $container.html(data).fadeIn('slow');
    registerclick();

    $.getScript( "js/hostscript.js", function( data, textStatus, jqxhr ) {
  console.log( "Load of host scripts was performed." );
  });


      });
    
});

socket.on('sync_queue', function(data){

  console.log(data.rows);

  data.rows.forEach(function(track) {
    $("#queuelist").append('<li id="' + track.id + 'queue" track-source="sc" track-id="" class="searchli queueitem"><img ondragstart="return false;" class="searchthumbnail" src="' + track.artwork + '"  width="60" height="60"><div class="searchtext"><p class="tracktitle">' + track.title + '</p><p class="trackuser">' + track.artist + '</p></div><div class="searchoption"></div></li>');
  });
     
});

socket.on('sync_history', function(data){

  console.log(data.rows);

  data.rows.forEach(function(track) {
    if(track.source == 'sc'){
    $("#historylist").append('<a href="' + track.permalink + '" target="_blank"><li id="' + track.id + 'queue" track-source="sc" track-id="" class="searchli"><img ondragstart="return false;" class="searchthumbnail" src="' + track.artwork + '"  width="60" height="60"><div class="searchtext"><p class="tracktitle">' + track.title + '</p><p class="trackuser">' + track.artist + '</p></div><div class="searchoption"><img ondragstart="return false;" id="icon" class="soption" height="20" width="20" src="images/arrow.gif"></img></div></li></a>');
  }else{
    $("#historylist").append('<a href="https://www.youtube.com/watch?v=' + track.source_id + '" target="_blank"><li id="' + track.id + 'queue" track-source="sc" track-id="" class="searchli"><img ondragstart="return false;" class="searchthumbnail" src="' + track.artwork + '"  width="60" height="60"><div class="searchtext"><p class="tracktitle">' + track.title + '</p><p class="trackuser">' + track.artist + '</p></div><div class="searchoption"><img ondragstart="return false;" id="icon" class="soption" height="20" width="20" src="images/arrow.gif"></img></div></li></a>');
  }
  });
     
});


socket.on('queue_remove', function(data){

  $( "#" + data.id + "queue" ).slideUp( "slow", function() {
    $( "#" + data.id + "queue" ).remove();
  });
  
  console.log('queue remove' + data.id);
     
});

socket.on('join_succeeded', function(data){

  oldsocket = socket.id;
  console.log('create_succeeded');
  $(".header").fadeOut('slow');
  $container.fadeOut('slow');
  $("footer").fadeIn('slow');
  $(".searchbox").prop('top', '0px');

  $.get( "session", function( data ) {
    $container.html(data).fadeIn('slow');
    $(".searchbox").prop('top', 0);
    registerclick();
    socket.emit('sync_request');
  });
     
});

socket.on('join_failed', function(data){

  $(".error").fadeIn('slow');
    
});

socket.on('create_failed', function(data){

  $(".error").fadeIn('slow');
    
});

socket.on('queue_add', function(data){
    console.log(data);
    $("#queuelist").append('<li id="' + data.track_id + 'queue" track-source="sc" track-id="" class="searchli queueitem"><img ondragstart="return false;" class="searchthumbnail" src="' + data.track_art + '"  width="60" height="60"><div class="searchtext"><p class="tracktitle">' + data.track_name + '</p><p class="trackuser">' + data.track_artist + '</p></div><div class="searchoption"></div></li>').fadeIn();
    $("#" + data.track_id + "queue").swipe( {
        swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
          if(direction == 'left'){

          }

          if(direction == 'right'){


          }
          alert("You swiped " + direction );  
        }
      });
});

socket.on('history_add', function(data){
    console.log(data);
    if(data.track.permalink == null){
      data.track.permalink = 'https://www.youtube.com/watch?v=' + data.track.source_id;
    }
    $("#historylist").append('<a href="' + data.track.permalink + '" target="_blank"><li id="' + data.track.id + 'queue" track-source="sc" track-id="" class="searchli"><img ondragstart="return false;" class="searchthumbnail" src="' + data.track.artwork + '"  width="60" height="60"><div class="searchtext"><p class="tracktitle">' + data.track.title + '</p><p class="trackuser">' + data.track.artist + '</p></div><div class="searchoption"><img ondragstart="return false;" id="icon" class="soption" height="20" width="20" src="images/arrow.gif"></img></div></li></a>').fadeIn();
});

function registerclick(){
$('a.clickable').click(function()
  {

    	$loading.hide();
        $loading.html('<div id="loading"></div>').fadeIn('fast');

        var url = $(this).attr('href');
        var id = $(this).id;

        $.get(url, function (data)
        {
            $("#loading").fadeOut('fast', function()
            {
                $(this).remove();
            });
            $container.fadeOut('slow', function()
            {
                $container.html(data).fadeIn('slow');
                registerclick();
            });
            

        });

        return false;
});

$('#createbtn').click(function()
  {       

        var name = $("#sname").val();
        var pwd = $("#pwd").val();
        var pwdcheck = $("#pwdcheck").prop( "checked" );

        socket.emit('create_session',{sessionname: name, pwdcheck: pwdcheck, pwd: pwd});

      
        return false;

});

$('#joinbtn').click(function()
  {       

        var name = $("#sname").val();

        socket.emit('join_session',{sessionname: name});

        return false;

});


  $('#search').keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });

function searchli(){
$('.searchli').click(function()
{

    if(!$(this).hasClass("clicked")){

    var id = $(this).attr("track-id");
    var source = $(this).attr("track-source");
    var track_name = $(this).attr("track-title");
    var track_artist = $(this).attr("track-artist");
    var artwork_url = $(this).attr("track-art");
    var permalink = null;

    track_name = escapeHtml(track_name);
    track_artist = escapeHtml(track_artist);

    if(source == 'sc'){
      permalink = $(this).attr("permalink");
    }

    $(this).addClass("clicked");
    console.log('add track');
    socket.emit('add_track',{track_source: source, track_id: id, name: track_name, artist: track_artist, art: artwork_url, permalink: permalink});
    $("#" + id + "icon").prop('src', '/images/tick.gif'); // to enable the checkbox\
    
    }

    
});
}



$('#searchbtn').click(function()
{

  console.log(socket.id);

$( "#searchresults" ).empty();
$("#searchresults").append('<img class="searching" src="/images/searching.gif" />');
$(".searching").prop('display', 'block'); // to enable the checkbox
var term = $("#search").val();

SC.get('/tracks', { q: term }, function(tracks) {

$("#searchresults").append('<ul class="resultslist">');
$(".searching").hide();

console.log(tracks);

tracks.forEach(function(track) {


    if(track.artwork_url == null){
        track.artwork_url = track.user.avatar_url;
    }
    if(track.streamable){
    $("#searchresults").append('<li track-source="sc" permalink="' + track.permalink_url + '" track-title="' + track.title + '" track-art="' + track.artwork_url + '" track-artist="' + track.user.username + '" track-id="' + track.id + '" class="searchli"><img ondragstart="return false;" class="searchthumbnail" data-original="' + track.artwork_url + '"  width="60" height="60"><div class="searchtext"><p class="tracktitle">' + track.title + '</p><p class="trackuser">' + track.user.username + '</p></div><div class="searchoption"><img ondragstart="return false;" id="' + track.id + 'icon" class="soption" height="20" width="20" src="images/plus.gif"></img></div></li>');
    }
});

$("#searchresults").append('</ul>');

$("img.searchthumbnail").lazyload({
    effect : "fadeIn"
});

searchli();

});

});

$('#ytsearchbtn').click(function()
{

var term = $("#search").val();

$( "#searchresults" ).empty();
$("#searchresults").append('<img class="searching" src="/images/searching.gif" />');

$.get( "http://gdata.youtube.com/feeds/api/videos?q=" + term + "&format=5&duration=short&category=Music&max-results=10&v=2&alt=jsonc", function( data ) {
      console.log( data.data.items );
      $(".searching").hide();
$("#searchresults").append('<ul class="resultslist">');
  data.data.items.forEach(function(track) {

    $("#searchresults").append('<li track-source="yt" track-title="' + track.title + '" track-art="' + track.thumbnail.sqDefault + '" track-artist="' + track.uploader + '" track-id="' + track.id + '" class="searchli"><img ondragstart="return false;" class="searchthumbnail" data-original="' + track.thumbnail.sqDefault + '"  width="60" height="60"><div class="searchtext"><p class="tracktitle">' + track.title + '</p><p class="trackuser">' + track.uploader + '</p></div><div class="searchoption"><img ondragstart="return false;" id="' + track.id + 'icon" class="soption" height="20" width="20" src="images/plus.gif"></img></div></li>');
    
});

$("#searchresults").append('</ul>');

$("img.searchthumbnail").lazyload({
    effect : "fadeIn"
});

searchli();

});


});


$('#tab3').click(function()
  {

  $(".searchbox").hide();
  $("#searchresults").hide();
  $("#queue").hide();
  $("#history").show();
  $("#tab3").css("background-color","#55bfea");
  $("#tab2").css("background-color","#6E6E6E");
  $("#tab1").css("background-color","#6E6E6E");

  });

$('#tab2').click(function()
  {

  $(".searchbox").hide();
  $("#searchresults").hide();  
  $("#history").hide();
  $("#queue").show();
  $("#tab2").css("background-color","#55bfea");
  $("#tab3").css("background-color","#6E6E6E");
  $("#tab1").css("background-color","#6E6E6E");

  });

$('#tab1').click(function()
  {


  $("#history").hide();
  $("#queue").hide();
  $(".searchbox").show();
  $("#searchresults").show();
  $("#tab1").css("background-color","#55bfea");
  $("#tab2").css("background-color","#6E6E6E");
  $("#tab3").css("background-color","#6E6E6E");

  });


$('.checkbox').click(function()
{
    if(!duplicate){
    $("#passwordfield").slideToggle( "slow" );
    duplicate = true;
} else{
    duplicate = false;
}
});

}

registerclick();


socket.on("disconnect", function(){
        socket = io.connect("http://192.168.1.116/");

        socket.emit('update_id', {'oldid': oldsocket});
        oldsocket = socket.id;

          $("#reconnect").show();
        
        //location.reload();
});


var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);





