(function ($) {
    $(document).ready(function(){
    $( '#cd-dropdown' ).dropdown( {
      gutter : 5,
      stack : false,
      delay : 100,
      slidingIn : 100
    } );
      
      //If Item of Menu have <sub-menu> turn off link
    $('nav li > a').click(function(e){
      if($(this).siblings('ul').length > 0 && $('body').innerWidth() < 975){
        e.preventDefault();
      }
    });
  });    
}(jQuery));


$(window).resize(function() {
  if($('body').innerWidth() >= 975) { 
     $('nav > .container > ul').css('display', 'block'); 
  };

  if($('body').innerWidth() < 975) { 
     $('nav > .container > ul').css('display', 'none'); 
  };

});

function toogleMenu() {
  $('nav > .container > ul').toggle();
  $('#mobile-menu').toggleClass('mobile-active');
}