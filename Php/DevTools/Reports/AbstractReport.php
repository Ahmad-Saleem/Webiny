<?php
namespace Apps\Core\Php\DevTools\Reports;

use Apps\Core\Php\DevTools\DevToolsTrait;
use Webiny\Component\StdLib\StdLibTrait;
use Webiny\Component\Storage\File\File;

/**
 * Class AbstractReport
 */
abstract class AbstractReport implements ReportInterface
{
    use DevToolsTrait, StdLibTrait;

    private $data = [];

    abstract public function getFileName();

    abstract public function getTemplate();

    /**
     * @param bool|void|File $asFile
     *
     * @return mixed
     */
    abstract public function getReport($asFile = false);

    function __get($name)
    {
        return $this->data[$name];
    }

    public function set($key, $value)
    {
        $this->data[$key] = $value;
    }

    public function getData()
    {
        return $this->data;
    }
}