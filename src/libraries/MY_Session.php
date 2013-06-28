<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * CodeIgniter MongoDB Session Library
 *
 * The library extends (and so replaces) CodeIgniter's native session
 * library to use MongoDB as database backend. It's uses V2 branch
 * of "CodeIgniter MongoDB Active Record Library" by Alex Bilbie as
 * MongoDB interface: https://github.com/alexbilbie/codeigniter-mongodb-library
 *
 * Installation:
 * - Place MY_Session.php file in "application/libraries" directory.
 *
 * - Place mongodb_session.php file in "application/config" directory.
 *
 * - Make sure that you have installed MongoDB Active Record library and your MongoDB
 *   connection parameters are correctly setup in "application/config/mongodb.php".
 *
 * - Make sure that "sess_use_database" directive is set to TRUE in
 *   "application/config/config.php" file.
 *
 * - Make sure "sess_use_mongodb" is set to TRUE. Also set "sess_collection_name" with
 *   MongoDB session collection name. Both config directives reside in
 *   "application/config/mongodb_session.php" file.
 *
 *
 * @package		CodeIgniter
 * @author		Sepehr Lajevardi <me@sepehr.ws>
 * @copyright	Copyright (c) 2012 Sepehr Lajevardi.
 * @license		http://codeigniter.com/user_guide/license.html
 * @link		https://github.com/sepehr/ci-mongodb-session
 * @version 	Version 1.0
 * @filesource
 */

// ------------------------------------------------------------------------

/**
 * MongoDB Session Class
 *
 * The class extends CodeIgniter's native Session class and overwrites
 * those methods that contain any sort of database interactions:
 * - sess_read()
 * - sess_write()
 * - sess_create()
 * - sess_update()
 * - sess_destroy()
 * - _sess_gc()
 *
 * @package 	CodeIgniter
 * @subpackage	Libraries
 * @category	Sessions
 * @author		Sepehr Lajevardi <me@sepehr.ws>
 * @link		http://codeigniter.com/user_guide/libraries/sessions.html
 */
class MY_Session extends CI_Session {

	/**
	 * Config directives array.
	 *
	 * @var array
	 * @access private
	 */
	private $_config = array();

	/**
	 * Config filename.
	 *
	 * @var string
	 * @access private
	 */
	private $_config_file = 'mongodb_session';

	/**
	 * Indicates whether to use mongodb as session database backend.
	 *
	 * @var boolean
	 * @access private
	 */
	private $_use_mongodb;

	// --------------------------------------------------------------------

	/**
	 * Session Constructor
	 *
	 * The constructor runs the session routines automatically
	 * whenever the class is instantiated.
	 *
	 * For MongoDB, this loads custom config and MongoDB active record lib
	 */
	public function __construct($params = array())
	{
		log_message('debug', "Session Class Initialized");

		// Set the super object to a local variable for use throughout the class
		$this->CI =& get_instance();

		// Load config directives
		$this->CI->config->load($this->_config_file);
		$this->_config = $this->CI->config->item('default');

		// Set the flag if we should use mongodb as session database backend
		$this->_use_mongodb = $this->_config['sess_use_mongodb'] === TRUE AND $this->_config['sess_collection_name'] != '';

		// Set all the session preferences, which can either be set
		// manually via the $params array above or via the config file
		foreach (array('sess_encrypt_cookie', 'sess_use_database', 'sess_table_name', 'sess_expiration', 'sess_expire_on_close', 'sess_match_ip', 'sess_match_useragent', 'sess_cookie_name', 'cookie_path', 'cookie_domain', 'cookie_secure', 'sess_time_to_update', 'time_reference', 'cookie_prefix', 'encryption_key') as $key)
		{
			$this->$key = (isset($params[$key])) ? $params[$key] : $this->CI->config->item($key);
		}

		if ($this->encryption_key == '')
		{
			show_error('In order to use the Session class you are required to set an encryption key in your config file.');
		}

		// Load the string helper so we can use the strip_slashes() function
		$this->CI->load->helper('string');

		// Do we need encryption? If so, load the encryption class
		if ($this->sess_encrypt_cookie == TRUE)
		{
			$this->CI->load->library('encrypt');
		}

		// Are we using a database?  If so, load it
		if ($this->sess_use_database === TRUE)
		{
			// Check if we should use mongodb
			if ($this->_use_mongodb)
			{
				$this->CI->load->library('mongo_db');
			}
			// Fallback to CodeIgniter database driver otherwise
			elseif ($this->sess_table_name != '')
			{
				$this->CI->load->database();
			}
		}

		// Set the "now" time.  Can either be GMT or server time, based on the
		// config prefs.  We use this to set the "last activity" time
		$this->now = $this->_get_time();

		// Set the session length. If the session expiration is
		// set to zero we'll set the expiration two years from now.
		if ($this->sess_expiration == 0)
		{
			$this->sess_expiration = (60*60*24*365*2);
		}

		// Set the cookie name
		$this->sess_cookie_name = $this->cookie_prefix.$this->sess_cookie_name;

		// Run the Session routine. If a session doesn't exist we'll
		// create a new one.  If it does, we'll update it.
		if ( ! $this->sess_read())
		{
			$this->sess_create();
		}
		else
		{
			$this->sess_update();
		}

		// Delete 'old' flashdata (from last request)
		$this->_flashdata_sweep();

		// Mark all new flashdata as old (data will be deleted before next request)
		$this->_flashdata_mark();

		// Delete expired sessions if necessary
		$this->_sess_gc();

		log_message('debug', "Session routines successfully run");
	}

	// --------------------------------------------------------------------

	/**
	 * Fetches the current session data if it exists
	 *
	 * @access	public
	 * @return	bool
	 */
	public function sess_read()
	{
		// Fetch the cookie
		$session = $this->CI->input->cookie($this->sess_cookie_name);

		// No cookie?  Goodbye cruel world!...
		if ($session === FALSE)
		{
			log_message('debug', 'A session cookie was not found.');
			return FALSE;
		}

		// Decrypt the cookie data
		if ($this->sess_encrypt_cookie == TRUE)
		{
			$session = $this->CI->encrypt->decode($session);
		}
		else
		{
			// encryption was not used, so we need to check the md5 hash
			$hash	 = substr($session, strlen($session)-32); // get last 32 chars
			$session = substr($session, 0, strlen($session)-32);

			// Does the md5 hash match?  This is to prevent manipulation of session data in userspace
			if ($hash !==  md5($session.$this->encryption_key))
			{
				log_message('error', 'The session cookie data did not match what was expected. This could be a possible hacking attempt.');
				$this->sess_destroy();
				return FALSE;
			}
		}

		// Unserialize the session array
		$session = $this->_unserialize($session);

		// Is the session data we unserialized an array with the correct format?
		if ( ! is_array($session) OR ! isset($session['session_id']) OR ! isset($session['ip_address']) OR ! isset($session['user_agent']) OR ! isset($session['last_activity']))
		{
			$this->sess_destroy();
			return FALSE;
		}

		// Is the session current?
		if (($session['last_activity'] + $this->sess_expiration) < $this->now)
		{
			$this->sess_destroy();
			return FALSE;
		}

		// Does the IP Match?
		if ($this->sess_match_ip == TRUE AND $session['ip_address'] != $this->CI->input->ip_address())
		{
			$this->sess_destroy();
			return FALSE;
		}

		// Does the User Agent Match?
		if ($this->sess_match_useragent == TRUE AND trim($session['user_agent']) != trim(substr($this->CI->input->user_agent(), 0, 120)))
		{
			$this->sess_destroy();
			return FALSE;
		}

		// Is there a corresponding session in the DB?
		if ($this->sess_use_database === TRUE)
		{
			if ($this->_use_mongodb)
			{
				// Build the session match condition array
				$conditions = array('session_id' => $session['session_id']);

				if ($this->sess_match_ip == TRUE)
				{
					$conditions['ip_address'] = $session['ip_address'];
				}

				if ($this->sess_match_useragent == TRUE)
				{
					$conditions['user_agent'] = $session['user_agent'];
				}

				// Query mongodb to find possible session document
				$current_session = $this->CI->mongo_db
					->where($conditions)
					->get($this->_config['sess_collection_name']);

				// No result?  Kill it!
				if (empty($current_session))
				{
					$this->sess_destroy();
					return FALSE;
				}

				// Is there custom data? If so, add it to the main session array
				if (isset($current_session[0]['user_data']) AND $current_session[0]['user_data'] != '')
				{
					$custom_data = $this->_unserialize($current_session[0]['user_data']);

					if (is_array($custom_data))
					{
						foreach ($custom_data as $key => $val)
						{
							$session[$key] = $val;
						}
					}
				}
			} // Using MongoDB as session backend

			elseif ($this->sess_table_name != '')
			{
				$this->CI->db->where('session_id', $session['session_id']);

				if ($this->sess_match_ip == TRUE)
				{
					$this->CI->db->where('ip_address', $session['ip_address']);
				}

				if ($this->sess_match_useragent == TRUE)
				{
					$this->CI->db->where('user_agent', $session['user_agent']);
				}

				$query = $this->CI->db->get($this->sess_table_name);

				// No result?  Kill it!
				if ($query->num_rows() == 0)
				{
					$this->sess_destroy();
					return FALSE;
				}

				// Is there custom data?  If so, add it to the main session array
				$row = $query->row();
				if (isset($row->user_data) AND $row->user_data != '')
				{
					$custom_data = $this->_unserialize($row->user_data);

					if (is_array($custom_data))
					{
						foreach ($custom_data as $key => $val)
						{
							$session[$key] = $val;
						}
					}
				}
			} // Using database driver as session backend
		}

		// Session is valid!
		$this->userdata = $session;
		unset($session);

		return TRUE;
	}

	// --------------------------------------------------------------------

	/**
	 * Writes the session data
	 *
	 * @access	public
	 * @return	void
	 */
	public function sess_write()
	{
		// Are we saving custom data to the DB?  If not, all we do is update the cookie
		if ($this->sess_use_database === FALSE)
		{
			$this->_set_cookie();
			return;
		}

		// set the custom userdata, the session data we will set in a second
		$custom_userdata = $this->userdata;
		$cookie_userdata = array();

		// Before continuing, we need to determine if there is any custom data to deal with.
		// Let's determine this by removing the default indexes to see if there's anything left in the array
		// and set the session data while we're at it
		foreach (array('session_id','ip_address','user_agent','last_activity') as $val)
		{
			unset($custom_userdata[$val]);
			$cookie_userdata[$val] = $this->userdata[$val];
		}

		// Did we find any custom data?  If not, we turn the empty array into a string
		// since there's no reason to serialize and store an empty array in the DB
		if (count($custom_userdata) === 0)
		{
			$custom_userdata = '';
		}
		else
		{
			// Serialize the custom data array so we can store it
			$custom_userdata = $this->_serialize($custom_userdata);
		}

		// Run the update query
		if ($this->_use_mongodb)
		{
			$this->CI->mongo_db
				->where(array('session_id' => $this->userdata['session_id']))
				->set(array(
					'last_activity' => $this->userdata['last_activity'],
					'user_data' => $custom_userdata)
				)
				->update($this->_config['sess_collection_name']);
		}
		elseif ($this->sess_table_name != '')
		{
			$this->CI->db->where('session_id', $this->userdata['session_id']);
			$this->CI->db->update($this->sess_table_name, array(
				'last_activity' => $this->userdata['last_activity'],
				'user_data' => $custom_userdata)
			);
		}

		// Write the cookie.  Notice that we manually pass the cookie data array to the
		// _set_cookie() function. Normally that function will store $this->userdata, but
		// in this case that array contains custom data, which we do not want in the cookie.
		$this->_set_cookie($cookie_userdata);
	}

	// --------------------------------------------------------------------

	/**
	 * Creates a new session
	 *
	 * @access	public
	 * @return	void
	 */
	public function sess_create()
	{
		$sessid = '';
		while (strlen($sessid) < 32)
		{
			$sessid .= mt_rand(0, mt_getrandmax());
		}

		// To make the session ID even more secure we'll combine it with the user's IP
		$sessid .= $this->CI->input->ip_address();

		$this->userdata = array(
			'session_id'	=> md5(uniqid($sessid, TRUE)),
			'ip_address'	=> $this->CI->input->ip_address(),
			'user_agent'	=> substr($this->CI->input->user_agent(), 0, 120),
			'last_activity'	=> $this->now,
			'user_data'		=> '',
		);

		// Save the data to the DB if needed
		if ($this->sess_use_database === TRUE)
		{
			if ($this->_use_mongodb)
			{
				// Insert session document
				// Note: we cannot use $this->userdata because it's passed by reference
				// And Insert has side-effect that append _id to $this->userdata
				$this->CI->mongo_db->insert($this->_config['sess_collection_name'], array(
					'session_id'    => $this->userdata['session_id'],
					'ip_address'    => $this->userdata['ip_address'],
					'user_agent'    => $this->userdata['user_agent'],
					'last_activity' => $this->userdata['last_activity'],
					'user_data'     => '',
				));
			}
			elseif ($this->sess_table_name != '')
			{
				$this->CI->db->query($this->CI->db->insert_string($this->sess_table_name, $this->userdata));
			}
		}

		// Write the cookie
		$this->_set_cookie();
	}

	// --------------------------------------------------------------------

	/**
	 * Updates an existing session
	 *
	 * @access	public
	 * @return	void
	 */
	public function sess_update()
	{
		// We only update the session every "sess_time_to_update" seconds by default
		if (($this->userdata['last_activity'] + $this->sess_time_to_update) >= $this->now)
		{
			return;
		}

		// Save the old session id so we know which record to
		// update in the database if we need it
		$old_sessid = $this->userdata['session_id'];
		$new_sessid = '';
		while (strlen($new_sessid) < 32)
		{
			$new_sessid .= mt_rand(0, mt_getrandmax());
		}

		// To make the session ID even more secure we'll combine it with the user's IP
		$new_sessid .= $this->CI->input->ip_address();

		// Turn it into a hash
		$new_sessid = md5(uniqid($new_sessid, TRUE));

		// Update the session data in the session data array
		$this->userdata['session_id'] = $new_sessid;
		$this->userdata['last_activity'] = $this->now;

		// _set_cookie() will handle this for us if we aren't using database sessions
		// by pushing all userdata to the cookie.
		$cookie_data = NULL;

		// Update the session ID and last_activity field in the DB if needed
		if ($this->sess_use_database === TRUE)
		{
			// set cookie explicitly to only have our session data
			$cookie_data = array();
			foreach (array('session_id','ip_address','user_agent','last_activity') as $val)
			{
				$cookie_data[$val] = $this->userdata[$val];
			}

			// Update session document
			if ($this->_use_mongodb)
			{
				// Update session_id and last_activity
				$this->CI->mongo_db
					->where(array('session_id' => $old_sessid))
					->set(array(
						'session_id' => $new_sessid,
						'last_activity' => $this->now)
					)
					->update($this->_config['sess_collection_name']);
			}
			// Update session record
			elseif ($this->sess_table_name != '')
			{
				$this->CI->db->query(
					$this->CI->db->update_string(
						$this->sess_table_name,
						array(
							'last_activity' => $this->now,
							'session_id' => $new_sessid
						),
						array('session_id' => $old_sessid)
					)
				);
			}
		}

		// Write the cookie
		$this->_set_cookie($cookie_data);
	}

	// --------------------------------------------------------------------

	/**
	 * Destroys the current session
	 *
	 * @access	public
	 * @return	void
	 */
	public function sess_destroy()
	{
		// Kill the session DB row/document
		if ($this->sess_use_database === TRUE && isset($this->userdata['session_id']))
		{
			if ($this->_use_mongodb)
			{
				$this->CI->mongo_db
					->where(array('session_id' => $this->userdata['session_id']))
					->delete($this->_config['sess_collection_name']);
			}
			elseif ($this->sess_table_name != '')
			{
				$this->CI->db->where('session_id', $this->userdata['session_id']);
				$this->CI->db->delete($this->sess_table_name);
			}
		}

		// Kill the cookie
		setcookie(
			$this->sess_cookie_name,
			addslashes(serialize(array())),
			($this->now - 31500000),
			$this->cookie_path,
			$this->cookie_domain,
			0
		);

		// Kill session data
		$this->userdata = array();
	}

	// --------------------------------------------------------------------

	/**
	 * Garbage collection helper
	 *
	 * This deletes expired session rows from database
	 * if the probability percentage is met
	 *
	 * @access	public
	 * @return	void
	 */
	public function _sess_gc()
	{
		if ($this->sess_use_database != TRUE)
		{
			return;
		}

		srand(time());
		if ((rand() % 100) < $this->gc_probability)
		{
			$expire = $this->now - $this->sess_expiration;

			if ($this->_use_mongodb)
			{
				$this->CI->mongo_db
					->where_lt('last_activity', $expire)
					->delete_all($this->_config['sess_collection_name']);
			}
			elseif ($this->sess_table_name != '')
			{
				$this->CI->db->where("last_activity < {$expire}");
				$this->CI->db->delete($this->sess_table_name);
			}

			log_message('debug', 'Session garbage collection performed.');
		}
	}

}
// END MY_Session Class

/* End of file MY_Session.php */
/* Location: ./application/libraries/MY_Session.php */