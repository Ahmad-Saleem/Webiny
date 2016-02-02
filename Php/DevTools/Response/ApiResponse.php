<?php
namespace Apps\Core\Php\DevTools\Response;

/**
 * Class ApiResponse
 */
class ApiResponse extends ResponseAbstract implements \ArrayAccess
{

    protected $data;
    protected $msg;
    protected $phpTrace;

    /**
     * @param array  $data Response data
     * @param string $msg Response message
     * @param int    $httpStatus HTTP Status Code
     */
    public function __construct($data, $msg = '', $httpStatus = 200)
    {
        $this->data = $data;
        $this->msg = $msg;
        $this->statusCode = $httpStatus;
    }

    /**
     * Get original data
     *
     * @return mixed
     */
    public function getData()
    {
        return $this->data;
    }

    public function output()
    {
        $data = $this->formatResponse();
        header("Content-type: application/json");
        die(json_encode($data));
    }

    public function setErrors(array $errors)
    {
        $this->phpTrace = $errors;

        return $this;
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Whether a offset exists
     * @link http://php.net/manual/en/arrayaccess.offsetexists.php
     *
     * @param mixed $offset <p>
     *                      An offset to check for.
     *                      </p>
     *
     * @return boolean true on success or false on failure.
     * </p>
     * <p>
     * The return value will be casted to boolean if non-boolean was returned.
     */
    public function offsetExists($offset)
    {
        return isset($this->data[$offset]);
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to retrieve
     * @link http://php.net/manual/en/arrayaccess.offsetget.php
     *
     * @param mixed $offset <p>
     *                      The offset to retrieve.
     *                      </p>
     *
     * @return mixed Can return all value types.
     */
    public function offsetGet($offset)
    {
        return $this->data[$offset];
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to set
     * @link http://php.net/manual/en/arrayaccess.offsetset.php
     *
     * @param mixed $offset <p>
     *                      The offset to assign the value to.
     *                      </p>
     * @param mixed $value <p>
     *                      The value to set.
     *                      </p>
     *
     * @return void
     */
    public function offsetSet($offset, $value)
    {
        $this->data[$offset] = $value;
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to unset
     * @link http://php.net/manual/en/arrayaccess.offsetunset.php
     *
     * @param mixed $offset <p>
     *                      The offset to unset.
     *                      </p>
     *
     * @return void
     */
    public function offsetUnset($offset)
    {
        unset($this->data[$offset]);
    }

    protected function formatResponse()
    {
        $data = [
            'message' => $this->msg,
            'data'    => $this->data,
            'trace'   => $this->phpTrace
        ];

        if (!$this->msg) {
            unset($data['message']);
        }

        return $data;
    }
}