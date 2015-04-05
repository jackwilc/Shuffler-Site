document.oncontextmenu =new Function("return false;")
var $container = $('#content');
var $loading = $('.head-nav');
var duplicate = false;
var socket = io.connect("http://192.168.0.16/");
function registerclick(){
$('a').click(function()
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
        $("footer").fadeIn('slow');
        $(".header").fadeOut('slow');
        $loading.hide();
        $loading.html('<div id="loading"></div>').fadeIn('fast');

        var url = 'create';
        var id = $(this).id;
        var name = $("#sname").val();
        var pwd = $("#pwd").val();
        var pwdcheck = $("#pwdcheck").prop( "checked" );

        console.log(pwdcheck);

        if(pwdcheck == 'on'){
            alert('dfsfds');
        }

        $.post(url,{sessionname:name, pwdcheck: pwdcheck, pwd: pwd},function (data)
        {
            $("#loading").fadeOut('fast', function()
            {
                $(this).remove();
            });
            $container.fadeOut('slow', function()
            {
                $container.html(data).fadeIn('slow');
                $('#search').focus();
                registerclick();
            });
            

        });

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
    var id = $(this).attr("track-id");;
    console.log(id);
    $("#" + id + "icon").prop('src', '/images/tick.gif'); // to enable the checkbox
    socket.emit('loop',{track_id: id});
});
}



$('#searchbtn').click(function()
{

var term = $("#search").val();

$( "#searchresults" ).empty();
$("#searchresults").append('<ul class="resultslist">');


SC.get('/tracks', { q: term }, function(tracks) {

tracks.forEach(function(track) {

    if(track.artwork_url == null){
        track.artwork_url = track.user.avatar_url;
    }

    $("#searchresults").append('<li track-source="sc" track-id="' + track.id + '" class="searchli"><img class="searchthumbnail" data-original="' + track.artwork_url + '"  width="60" height="60"><div class="searchtext"><p class="tracktitle">' + track.title + '</p><p class="trackuser">' + track.user.username + '</p></div><div class="searchoption"><img id="' + track.id + 'icon" class="soption" height="20" width="20" src="images/arrow.gif"></img></div></li>');
    console.log("url" + track.artwork_url);
});

$("#searchresults").append('</ul>');

$("img.searchthumbnail").lazyload({
});

searchli();

});

});

$('#ytsearchbtn').click(function()
{

var term = $("#search").val();

$( "#searchresults" ).empty();

$.get( "http://gdata.youtube.com/feeds/api/videos?q=" + term + "&format=5&duration=short&category=Music&max-results=10&v=2&alt=jsonc", function( data ) {
      console.log( data.data.items );
$("#searchresults").append('<ul class="resultslist">');
  data.data.items.forEach(function(track) {

    $("#searchresults").append('<li track-source="yt" track-id="' + track.id + '" class="searchli"><img class="searchthumbnail" data-original="' + track.thumbnail.sqDefault + '"  width="60" height="60"><div class="searchtext"><p class="tracktitle">' + track.title + '</p><p class="trackuser">' + track.uploader + '</p></div><div class="searchoption"><img id="' + track.id + 'icon" class="soption" height="20" width="20" src="images/arrow.gif"></img></div></li>');

});

$("#searchresults").append('</ul>');

$("img.searchthumbnail").lazyload({
});


});


});


$('#tab3').click(function()
{

$(".searchbox").fadeOut( "fast" );
$("#searchresults").fadeOut( "fast" );
$("#history").fadeIn( "fast" );
$("#tab3").css("background-color","#55bfea");
$("#tab2").css("background-color","#6E6E6E");
$("#tab1").css("background-color","#6E6E6E");

});

$('#tab2').click(function()
{

$(".searchbox").fadeOut( "fast" );
$("#searchresults").fadeOut( "fast" );
$("#history").fadeOut( "fast" );
$("#tab2").css("background-color","#55bfea");
$("#tab3").css("background-color","#6E6E6E");
$("#tab1").css("background-color","#6E6E6E");

});

$('#tab1').click(function()
{

$(".searchbox").fadeIn( "fast" );
$("#searchresults").fadeIn( "fast" );
$("#history").fadeOut( "fast" );
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
