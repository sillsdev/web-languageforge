<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestLibPath . 'jsonRPCClient.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class FavoriteAPITestEnvironment
{
	/**
	 * @var jsonRPCClient
	 */
	public $api;

	/**
	 * @var array
	 */
	private $_idAdded = array();

	function __construct() {
		$this->api = new jsonRPCClient("http://scriptureforge.local/api/sf", false);
		$e = new MongoTestEnvironment();
		$e->clean();
	}

	/**
	 * @param string $title
	 * @param string $description
	 */
	function addFavorite($title = 'Some Title', $description = 'Some Description') {
		$param = array(
			'id' => '',
			'title' => $title,
			'description' => $description
		);
		$id = $this->api->favorite_update($param);
		$this->_idAdded[] = $id;
		return $id;
	}

	/**
	 * @param string $id
	 */
	function deleteFavorite($id) {
		// If you used addFavorite to add it, use this to delete it. This
		// ensures that dispose() won't attempt to delete it a second time.
		$index = array_search($id, $this->_idAdded);
		$result = $this->api->favorite_delete(array($id));
		unset($this->_idAdded[$index]);
		return $result;
	}

	function dispose() {
		$this->api->favorite_delete($this->_idAdded);
	}
}

class TestFavoriteAPI extends UnitTestCase {

	function __construct() {
		$this->e = new FavoriteAPITestEnvironment();
	}

	function testFavoriteCRUD_CRUDOK() {
		// "Shortcut" variables for ease of typing
		$e = $this->e;
		$api = $e->api;

		// Create
		$id = $e->addFavorite(
			'Favorite Title',
			'Nice and clear description'
		);
		$this->assertNotNull($id);
		$this->assertEqual(24, strlen($id));

		// Read
		$result = $api->favorite_read($id);
		$this->assertNotNull($result['id']);
		$this->assertEqual('Favorite Title', $result['title']);
		$this->assertEqual('Nice and clear description', $result['description']);

		// Update
		$result['description'] = 'Muddled description';
		$newid = $api->favorite_update($result);
		$this->assertNotNull($id);
		$this->assertEqual($id, $newid);

		// Verify update actually changed DB
		$postUpdateResult = $api->favorite_read($id);
		$this->assertNotNull($postUpdateResult['id']);
		$this->assertEqual($postUpdateResult['description'], 'Muddled description');

		// Delete
		$result = $e->deleteFavorite($id);
		$this->assertTrue($result);
	}

	function testFavoriteList_Ok() {
		$e = $this->e;
		$api = $e->api;

		$id = $e->addFavorite(
			'Favorite Title',
			'Nice and clear description'
		);
		$id2 = $e->addFavorite(
			'A title',
			'A description'
		);

		$result = $api->favorite_list('someuser');

		$this->assertEqual($result['count'], 2);

		$e->deleteFavorite($id);
		$e->deleteFavorite($id2);
	}

}

?>
