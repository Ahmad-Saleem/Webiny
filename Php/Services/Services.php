<?php

namespace Apps\Webiny\Php\Services;

use Apps\Webiny\Php\DevTools\WebinyTrait;
use Apps\Webiny\Php\DevTools\Services\AbstractService;
use Apps\Webiny\Php\PackageManager\Parser\ServiceParser;
use Apps\Webiny\Php\PackageManager\App;
use Webiny\Component\StdLib\StdLibTrait;
use Webiny\Component\StdLib\StdObject\StdObjectWrapper;

/**
 * Class Services
 * @package Apps\Webiny\Php\Services
 */
class Services extends AbstractService
{
    use WebinyTrait, StdLibTrait;

    function __construct()
    {
        parent::__construct();
        /**
         * @api.name Get system services
         * @api.description This method returns an overview of all active services
         */
        $this->api('get', '/', function () {
            $singleService = $this->wRequest()->query('service', false);
            $withDetails = StdObjectWrapper::toBool($this->wRequest()->query('withDetails', false));
            $services = [];
            /* @var $app App */
            foreach ($this->wApps() as $app) {
                foreach($app->getServices() as $service){
                    if ($singleService && $service['class'] != $singleService) {
                        continue;
                    }

                    if($withDetails){
                        $serviceParser = new ServiceParser($service['class']);
                        $service['methods'] = $serviceParser->getApiMethods();
                    }

                    if ($service['class'] == $singleService) {
                        return $service;
                    }

                    $services[] = $service;
                }
            }
            
            return $services;
        });
    }
}