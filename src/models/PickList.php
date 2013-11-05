<?php
namespace models;

use models\mapper\Id;

use models\mapper\ArrayOf;

class PickItem
{
	/**
	 * @var string
	 */
	public $key;
	
	/**
	 * @var string
	 */
	public $value;
	
}

class PickList
{
	public function __construct() {
		$this->id = new Id();
		$this->items = new ArrayOf(ArrayOf::OBJECT, function($data) {
			return new PickItem();
		});
		
	}
	
	/**
	 * @var string
	 */
	public $id;
	
	/**
	 * @var ArrayOf ArrayOf<PickItem>
	 */
	public $items;
	
	/**
	 * @var string
	 */
	public $defaultKey;
}

?>
