<?php
require_once('includes/SIM.class.php');
$o = new SIM();

if( !$o->is_mobile() ) header('location:index.php');

if( isset($_GET['s']) ) $o->ajax_save();
else if ( isset($_GET['u']) ) $o->ajax_update();
else if ( isset($_GET['d']) ) $o->empty_file();
else
?>
<!DOCTYPE html>
<html>
	<head>
		<script src="http://cheghamwassim.com/tools/js/jquery/1.4.2/jquery.min.js" type="text/javascript"></script>
		<script src="assets/js/sim_m.js" type="text/javascript"></script>
		<link type='text/css' rel='stylesheet' href='assets/css/sim_m.css'/>
	</head>
	<body>
	</body>
</html>