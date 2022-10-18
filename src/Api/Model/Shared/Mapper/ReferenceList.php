<?php

namespace Api\Model\Shared\Mapper;

use Palaso\Utilities\CodeGuard;

class ReferenceList
{
    public function __construct()
    {
        $this->refs = [];
    }

    /** @var Id[] */
    public $refs;

    /**
     * @param string $theirId - the id of the referent
     * @param string $theirRefList - the referent's reference list back to us
     * @param string $myId - the id of the model containing this reference list
     */
    /*
     public function addRef($theirId, $theirRefList, $myId)
     {
    $this->_addRef($theirId);
    $theirRefList->_addRef($myId);
    }
    */

    /**
     * @see addRef - this should only be called by the addRef method of other ReferenceLists
     * @param string $id
     */
    public function _addRef($id)
    {
        CodeGuard::checkTypeAndThrow($id, "string");
        // CARRY ON HERE CP :-)
        $idModel = new Id($id);
        if (!in_array($idModel, $this->refs)) {
            $this->refs[] = $idModel;
        }
        // TODO log if ref already exists?
    }

    /**
     * @param string $theirId - the id of the referent
     * @param string $theirRefList - the referent's reference list back to us
     * @param string $myId - the id of the model containing this reference list
     */
    /*
     public function removeRef($theirId, $theirRefList, $myId)
     {
    $this->_removeRef($theirId);
    $theirRefList->_removeRef($myId);
    }
    */

    /**
     * @see removeRef - this should only be called by the removeRef method of other ReferenceLists
     * @param string $id
     */
    public function _removeRef($id)
    {
        if (in_array($id, $this->refs)) {
            $this->refs = array_values(array_diff($this->refs, [$id]));
        }
        // TODO Log if ref doesn't exist?
    }

    /**
     * Removes References back to me contained in my own ReferenceList
     * Note: this calls $model->write() on the models that refer back to me in their ReferenceList
     *
     * @param string $myId - the id of the model containing this reference list
     * @param string $theirModelName - the name of their model e.g. 'ProjectModel'
     * @param string $theirRefListName - the property name of the reference list on their model e.g. 'users'
     */
    /*
     public function removeOtherRefs($myId, $theirModelName, $theirRefListName)
     {
    foreach ($this->refs as $theirId) {
    $theirModel = new $theirModelName($theirId);
    $theirRefList = $theirModel->$theirRefListName;
    $theirRefList->_removeRef($myId);
    $theirModel->write();
    }
    }
    */
}
