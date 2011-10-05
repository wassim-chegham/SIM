<?php
require_once('includes/SIM.class.php');
$o = new SIM();

if( $o->is_mobile() ) header('location:m.php');

if( isset($_GET['s']) ) $o->ajax_save();
else if ( isset($_GET['u']) ) $o->ajax_update();
else
?>
<!DOCTYPE html>
<html>
	<head>
		<script src="http://cheghamwassim.com/tools/js/jquery/v1.4.2/jquery.min.js" type="text/javascript"></script>
		<script src="assets/js/sim.js" type="text/javascript"></script>
		<style>
		body { background:#202020; }
		h2 { color:#eee; }
		</style>
	</head>
	<body>
		<h2>Double-click anywhere to open/close the SIM chatbox!</h2>
	</body>
</html>