<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Captcha
{

	public function main($config = array()) {
		
		$this->load->helper('url');

		// Check for GD library
		if( !function_exists('gd_info') ) {
			throw new Exception('Required GD library is missing');
		}
		
		// Default values
		$captcha_config = array(
			'code' => '',
			'min_length' => 5,
			'max_length' => 5,
			'png_backgrounds' => array(base_url('/images/shared/captcha/captcha_bg.png')),
			'fonts' => array(FCPATH.'/images/shared/captcha/times_new_yorker.ttf'),
			'characters' => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
			'min_font_size' => 24,
			'max_font_size' => 30,
			'color' => '#000',
			'angle_min' => 0,
			'angle_max' => 15,
			'shadow' => true,
			'shadow_color' => '#CCC',
			'shadow_offset_x' => -2,
			'shadow_offset_y' => 2
		);
		
		// Overwrite defaults with custom config values
		if( is_array($config) ) {
			foreach( $config as $key => $value ) $captcha_config[$key] = $value;
		}
		
		// Restrict certain values
		if( $captcha_config['min_length'] < 1 ) $captcha_config['min_length'] = 1;
		if( $captcha_config['angle_min'] < 0 ) $captcha_config['angle_min'] = 0;
		if( $captcha_config['angle_max'] > 10 ) $captcha_config['angle_max'] = 10;
		if( $captcha_config['angle_max'] < $captcha_config['angle_min'] ) $captcha_config['angle_max'] = $captcha_config['angle_min'];
		if( $captcha_config['min_font_size'] < 10 ) $captcha_config['min_font_size'] = 10;
		if( $captcha_config['max_font_size'] < $captcha_config['min_font_size'] ) $captcha_config['max_font_size'] = $captcha_config['min_font_size'];
		
		// Use milliseconds instead of seconds
		srand(microtime() * 100);
		
		// Generate CAPTCHA code if not set by user
		if( empty($captcha_config['code']) ) {
			$captcha_config['code'] = '';
			$length = rand($captcha_config['min_length'], $captcha_config['max_length']);
			while( strlen($captcha_config['code']) < $length ) {
				$captcha_config['code'] .= substr($captcha_config['characters'], rand() % (strlen($captcha_config['characters'])), 1);
			}
		}
		
		// Generate image src
		$image_src = '/viewcaptcha?t=' . urlencode(microtime());
		//$image_src = '/' . ltrim(preg_replace('/\\\\/', '/', $image_src), '/');

		$captcha_array = array(
			'captcha_config' => serialize($captcha_config)
			);
		
		$this->session->set_userdata($captcha_array); 
		
		return array(
			'code' => $captcha_config['code'],
			'image_src' => $image_src
		);
		
	}

	public function hex2rgb($hex_str, $return_string = false, $separator = ',') {
		$hex_str = preg_replace("/[^0-9A-Fa-f]/", '', $hex_str); // Gets a proper hex string
		$rgb_array = array();
		if( strlen($hex_str) == 6 ) {
			$color_val = hexdec($hex_str);
			$rgb_array['r'] = 0xFF & ($color_val >> 0x10);
			$rgb_array['g'] = 0xFF & ($color_val >> 0x8);
			$rgb_array['b'] = 0xFF & $color_val;
		} elseif( strlen($hex_str) == 3 ) {
			$rgb_array['r'] = hexdec(str_repeat(substr($hex_str, 0, 1), 2));
			$rgb_array['g'] = hexdec(str_repeat(substr($hex_str, 1, 1), 2));
			$rgb_array['b'] = hexdec(str_repeat(substr($hex_str, 2, 1), 2));
		} else {
			return false;
		}
		return $return_string ? implode($separator, $rgb_array) : $rgb_array;
	}

	public function __get($var)
	{
		return get_instance()->$var;
	}
	
}