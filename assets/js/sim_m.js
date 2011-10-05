/**
 * wasSIM (Simple Instant Messenger) Script
 * 
 * @author CHEGHAM wassim
 * @license GPL
 * @version 1.0
 */
var X=0;
var COMMANDS=['/c', '/clear'];
var SERVER_SCRIPT_UPDATE="m.php?u";
var SERVER_SCRIPT_SAVE="m.php?s";
var MSG1="Welcome To wasSIM v0.1Beta";
var MSG2="Type your message here";
var RESPONSE_CONTAINER='';
var CONTAINER="<div id='im-container'>\
				<div id='im-list-title' title='Click to refresh!'>"+MSG1+"</div>\
				<textarea id='im-input' value='"+MSG2+"' class='hint'></textarea>\
				<div id='im-loader'></div>\
				<div id='im-list'>\
					<div id='im-list-messages'></div>\
				</div>\
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
	}
	$('#im-input').val('');
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

					}
					X++;

					var HTML = "";
					// append only new posts
					for(var i=0; i<ln; i++)
					{
						var time = d.response[i].time;
						var name = d.response[i].name;
						var message = d.response[i].message;
						HTML += "<div class='im-list-messages-item "+css_class+"'>\
										<span class='im-time'>["+time+"]</span>\
										<span class='im-name'>"+name+"</span><br/>\
										<span class='im-message'>"+message+"</span>\
									</div>";
					}

					$('#im-list-messages').prepend( HTML );

				}
				else {
					$('.new-post').removeClass('new-post');

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
	$( CONTAINER ).appendTo('body');

	////////////////////////////////////////////////////////
	// manual refresh
	$('#im-list-title').click(function(){
			ajax_update();
	});
	// input events handlers
	$('#im-input').keypress(function(e){
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
												<span class='im-name'>"+name+"</span><br/>\
												<span class='im-message'>"+message+"</span>\
											</div>";

								$('#im-list-messages').prepend( HTML );
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
