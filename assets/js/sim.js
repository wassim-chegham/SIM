/**
 * wasSIM (Simple Instant Messenger) Script
 * 
 * @author CHEGHAM wassim
 * @license GPL
 * @version 1.0
 */
var X=0;
var COMMANDS=['/c', '/clear', '/w', '/wizz'];
var SERVER_SCRIPT_UPDATE="index.php?u";
var SERVER_SCRIPT_SAVE="index.php?s";
var MSG1="Welcome To wasSIM v0.1Beta";
var MSG2="Type your message here";
var RESPONSE_CONTAINER='';
var CSS_LINK="<link type='text/css' rel='stylesheet' href='assets/css/sim.css' />";
var CONTAINER="<div id='im-container'>\
				<div id='im-new-post-tooltip' style='display:none;' ></div>\
				<div id='im-toggle-full' class='im-contract deactivated' title='Expand/Contract (when opened)'></div>\
				<div id='im-toggle' class='im-open' title='Open/Close' ></div>\
				<div id='im-list'>\
					<div id='im-list-title' title='Click to refresh!'>"+MSG1+"</div>\
					<div id='im-list-messages'></div>\
				</div>\
				<input type='text' id='im-input' value='"+MSG2+"' class='hint'/>\
				<div id='im-loader'></div>\
				</div>\
			</div>";
			
function scroll_down() {
	document.getElementById('im-list-messages').scrollTop = 10000;
}
function in_array(needle, stack)
{
	var ln=stack.length;
	for(var i=0; i<ln; i++) if( needle == stack[i] ) return true; 
	return false;
}
function execute(c) {
	switch ( c )
	{
		case "/clear":
		case "/c":
			$('.im-list-messages-item').addClass('cleared').fadeOut('slow', function(){
				$(this).hide();
			});
		break;
		case "/w":
		case "/wizz":
  		quake();
		break;
	}
	$('#im-input').val('');
}
// window shake
var qDuration=600; 
var qCounter=0; 
function quake() 
{ 
  // the horizontal displacement 
  var deltaX=1; 
  // make sure the browser support the moveBy method 
  if (window.moveBy) 
  { 
    for (qCounter=0; qCounter<qDuration; qCounter++) 
    { 
      // shake left 
      if ((qCounter%4)==0) 
      { 
        window.moveBy(deltaX, 0); 
      } 
      // shake right 
      else if ((qCounter%4)==2) 
      { 
        window.moveBy(-deltaX, 0); 
      } 
      // speed up or slow down every X cycles 
      if ((qCounter%30)==0) 
      { 
        // speed up halfway 
        if (qCounter<qDuration/2) 
        { 
          deltaX++; 
        } 
        // slow down after halfway of the duration 
        else 
        { 
          deltaX--; 
        } 
      } 
    } 
	} 
}
function ajax_update() {
	$.ajax({
		type:'GET',
		cache: false,
		url:SERVER_SCRIPT_UPDATE,
		dataType:'json',
		beforeSend: function(){
			$('#im-list-title').addClass('loader');
		},
		success: function(d)
		{
			//console.log(d);
			if ( d.status == 200 )
			{
				var res_ln = d.response.length;
				var lst_ln = $('.im-list-messages-item').length;
				var ln = res_ln-lst_ln; // new posts ??
				
				if ( ln > 0 )
				{
					var css_class = "";
					// dont show new posts the first time !
					if ( X!=0 )
					{
						$('#im-list-title').html( MSG1+'&nbsp;<blink>('+ln+' new)</blink>');
						$('title').html( MSG1+'&nbsp;<blink>('+ln+' new)</blink>');
						css_class = "new-post";
						
						if ( $('#im-toggle').is('.im-open') )
						{
							$('#im-new-post-tooltip').text(ln).fadeIn('slow');
						}
						
					}
					X++;
				
					var HTML = "";
					// append only new posts
					for(var i=ln-1; i>=0; i--)
					{
						var time = d.response[i].time;
						var name = d.response[i].name;
						var message = d.response[i].message;
						HTML += "<div class='im-list-messages-item "+css_class+"'>\
										<span class='im-time'>["+time+"]</span>\
										<span class='im-name'>"+name+"</span>\
										<span class='im-message'>"+message+"</span>\
									</div>";
					}
					
					$('#im-list-messages').append( HTML );
					
				}
				else {
					$('.new-post').removeClass('new-post');
					
					if ( $('#im-toggle').is('.im-open') )
					{
						$('#im-new-post-tooltip').fadeOut('slow', function(){
							$(this).text('');
						});
					}
					
					if ( $('#im-list-title').text() != MSG1 ) 
						$('#im-list-title').html( MSG1 );
				}
				
				
			}

		},
		complete: function(){
			$('#im-list-title').removeClass('loader');
			scroll_down();
		}
		
	});

}
function ajax_update_auto()
{
        setInterval("ajax_update()", 10000); // 10 sec
}

// document ready
$(function(){
	
	////////////////////////////////////////////////////////
	// Init
	ajax_update();
	ajax_update_auto();
	$( '<title>'+MSG1+'<title>' ).prependTo('head');
	$( CSS_LINK ).appendTo('head');
	$( CONTAINER ).appendTo('body');
	
	////////////////////////////////////////////////////////
	// Event handlers
	$('html').keypress(function(e){
		var code = e.which;
		switch( code )
		{
			case 178: // ²
				$('#im-toggle').trigger('click');
			break;
		}
	}).dblclick(function(){
		$('#im-toggle').trigger('click');
	});
	// manual refresh
	$('#im-list-title').click(function(){
	        ajax_update();
	});
	// expand/contract full screen mode
	$('#im-toggle-full:not(.deactivated)').live('click', function(){
			var btn = $(this);
			// expand
			if ( btn.is('.im-contract') )
			{
				$('#im-input').animate({width:'95%'});
				$('#im-container').animate({width:'100%'}, 'fast', '', function(){
					$(this).toggleClass('rounded-corners');
					$('#im-list').animate({width:'95%'});
					btn.removeClass('im-contract').addClass('im-expand');
					$('#im-toggle').addClass('deactivated');
					scroll_down();
				});
			}
			// contract
			else {
				$('#im-input').animate({width:'432px'});
				$('#im-container').animate({width:'500px'}, 'fast', '', function(){
					$(this).toggleClass('rounded-corners');
					$('#im-list').animate({width:'430px'});
					btn.removeClass('im-expand').addClass('im-contract');
					$('#im-toggle').removeClass('deactivated');
					scroll_down();
				});
			}

	});
	// open/close chat box
	$('#im-new-post-tooltip').click(function(){
		$('#im-toggle:not(.deactivated)').trigger('click');
		$('#im-new-post-tooltip').fadeOut('slow', function(){
			$(this).text('');
		});
	});
	$('#im-toggle:not(.deactivated)').live('click', function(){
		var btn = $(this);
		if ( btn.is('.im-open') )
		{
			$('#im-container').animate({'right':'-1px'}, 'fast', '', function(){
				$('#im-list').slideDown('fast', function(){
					btn.removeClass('im-open').addClass('im-close');
					$('#im-toggle-full').removeClass('deactivated');
					scroll_down();
				});
			})
			$('#im-input').focus();
		}
		else{
			$('#im-list').slideUp('fast', function(){
				$('#im-container').animate({'right':'-470px'}, 'fast', '', function(){
					btn.removeClass('im-close').addClass('im-open');
					$('#im-toggle-full').addClass('deactivated');
				});
			});
		}
	});
	// input events handlers
	$('#im-input').focus(function(){
		$(this).removeClass('hint').val('');
	}).blur(function(){
		$(this).addClass('hint').val( MSG2 );
	}).keypress(function(e){
		if ( e.which == 13 ) // Enter Key
		{
			var input = $(this);
			var message = $(this).val();
			
			if ( message.length > 0 )
			{
				if ( in_array(message, COMMANDS) )
				{
					execute(message);
				}
				else {
					
					$.ajax({
						type:'POST',
						url:SERVER_SCRIPT_SAVE,
						dataType:'json',
						data:'m='+message,
						beforeSend: function(){
							$('#im-loader').removeAttr('class').addClass('loader');
							input.attr('disabled', !input.is(':disabled'));
						},
						success: function(d)
						{
							var current = 0;
							//console.log(d);
							input.attr('disabled', !input.is(':disabled'));
							$('#im-loader').removeClass('loader');
	
							if ( d.status == 200 )
							{
								var time = d.response[current].time;
								var name = d.response[current].name;
								message = d.response[current].message;
	
								var HTML = "<div class='im-list-messages-item'>\
												<span class='im-time'>["+time+"]</span>\
												<span class='im-name'>"+name+"</span>\
												<span class='im-message'>"+message+"</span>\
											</div>";
	
								$('#im-list-messages').append( HTML );
								input.val('').focus();
								scroll_down();
							}
							else if ( d.status == 500 ) 
							{
								var HTML = "<div class='im-list-messages-item'>\
												<span class='im-message'>"+d.response[current].message+"</span>\
											</div>";
	
								$('#im-list-messages').append( HTML );
								scroll_down();
								$('.im-list-messages-item').addClass('error');//.append('<br/>('+d.response.message+')');
							}
	
	
						}
					});
				}
			}
		}
	});
	
});
