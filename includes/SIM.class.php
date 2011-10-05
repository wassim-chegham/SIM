<?php

/**
 * SIM (Simple Instant Messenger) Script
 * 
 * @author CHEGHAM wassim
 * @license GPL
 * @version 1.0
 */
 session_start();
define('JSON_MIME', 'text/javascript; charset=utf8');
define('DATE', date('Y-m-d G:i:s', time()));

class SIM
{

	public function __construct(){
		$this->_username = "Guest_".substr(md5($_SERVER['REMOTE_ADDR']), 0, 4);
		$this->_jsonfilename = "includes/wasSIM.json";
		$this->_emoticones_path = 'assets/icons/';
		$this->_patterns = array(';p'=>'wink', 
								';)'=>'wink',
								'^^'=>'waii',
								':('=>'unhappy', 
								':/'=>'unhappy',
								':)'=>'smile', 
								':D'=>'happy', 
								':p'=>'tongue', 
								':o'=>'surprised',
								'/me'=>$this->_username,
								'/date'=>"Server time is : ".date('Y-m-d G:i:s'),
								'/ip'=>"My IP is : ".$_SERVER['REMOTE_ADDR']
							);
	}
	public function __destructor(){
		unset($this->_username);
		unset($this->_jsonfilename);
		session_destroy();
	}


	public function ajax_save()
	{
		$message = isset($_POST['m']) ? $_POST['m'] : '';

		if ( $message == '' )
			exit(":("); 

		$message = $this->_find_replace(htmlspecialchars(stripslashes($message)));
		
		$time = DATE;
		$name = $this->_username;

		$tmp['time'] = $time;
		$tmp['name'] = $name;
		$tmp['message'] = $message;
		$data[] = $tmp;

		if ( $this->_can_clear_system() ) 
		{
			$this->_clear_system();
		}

		$oldcontent = $this->_read_file();

		if ( $oldcontent != "" )
		{
			$data = array_merge($data, json_decode($oldcontent, true));
		}

		$data = json_encode($data);
		if ( $this->_write_file($data) == 200 )
		{
			$this->ajax_update();
		}
		else {
			header('Content-Type: '.JSON_MIME);
			$data['status'] = 500;
			$data['response']['time'] = $time;
			$data['response']['name'] = $name;
			$data['response']['message'] = "Server Error Ocurred!";
			echo json_encode($data);
			exit();
		}

	}


	public function ajax_update()
	{
		
		$content = json_decode($this->_read_file(), true);
		if ( $content == NULL ) $data['status'] = 500;
		else $data['status'] = 200;
		$data['response'] = $content;

		header('Content-Type: '.JSON_MIME);	
		echo json_encode( $data );
		exit();
	}
	
	public function is_mobile()
	{
		
		$is_mobile = false;
	
		if(isset($_SERVER["HTTP_X_WAP_PROFILE"])) $is_mobile = true;
	
		if(preg_match("/wap\.|\.wap/i",$_SERVER["HTTP_ACCEPT"])) $is_mobile = true;

		if(isset($_SERVER["HTTP_USER_AGENT"]))
		{
	
			// Quick Array to kill out matches in the user agent
			// that might cause false positives
	
			$badmatches = array("OfficeLiveConnector","MSIE\ 8\.0","OptimizedIE8","MSN\ Optimized","Creative\ AutoUpdate","Swapper");
	
			foreach($badmatches as $badstring)
			{
				if(preg_match("/".$badstring."/i",$_SERVER["HTTP_USER_AGENT"])) $is_mobile = false;
			}
	
			// Now we'll go for positive matches
	
			$uamatches = array("midp", "j2me", "avantg", "docomo", "novarra", "palmos", "palmsource", "240x320", "opwv", "chtml", "pda", "windows\ ce", "mmp\/", "blackberry", "mib\/", "symbian", "wireless", "nokia", "hand", "mobi", "phone", "cdm", "up\.b", "audio", "SIE\-", "SEC\-", "samsung", "HTC", "mot\-", "mitsu", "sagem", "sony", "alcatel", "lg", "erics", "vx", "NEC", "philips", "mmm", "xx", "panasonic", "sharp", "wap", "sch", "rover", "pocket", "benq", "java", "pt", "pg", "vox", "amoi", "bird", "compal", "kg", "voda", "sany", "kdd", "dbt", "sendo", "sgh", "gradi", "jb", "\d\d\di", "moto","webos");
	
			foreach($uamatches as $uastring)
			{
				if(preg_match("/".$uastring."/i",$_SERVER["HTTP_USER_AGENT"])) $is_mobile = true;
			}
			
		} 
		
		return $is_mobile;
	}

	public function _can_clear_system()
	{
		$now = intval(date('d', strtotime("now")));
		$filetime = intval(date('d', filectime($this->_jsonfilename)));
		return $now-$filetime == 1; // 1 day
	}

	private function _clear_system()
	{
		$sys = array();
		$sys[] = array('time'=>DATE, 'name'=>'SYSTEM', 'message'=>'** System cleared on '.DATE.' **');
		$this->_write_file(json_encode($sys));
	}

	private function _find_replace($str)
	{
		$find = array_keys($this->_patterns);
		$replace = array_map( array($this, '_format_emoticons'), array_values($this->_patterns) );
		return str_replace($find, $replace, $str);
	}

	private function _write_file($data)
	{

		$fp = fopen( $this->_jsonfilename, "w+");

		if (flock($fp, LOCK_EX)) 
		{
			fwrite($fp, $data);
			flock($fp, LOCK_UN);
		}
		else
		{
			return 500;
		}
		fclose($fp);

		return 200;
	}


	private function _read_file()
	{
		return file_get_contents($this->_jsonfilename);
	}

	private function _format_emoticons($str)
	{
		return '<img src="'.$this->_emoticones_path.'/emoticon_'.$str.'.png" alt="'.$str.'" />';
	}
}

?>
