<?php

namespace Apps\Webiny\Php;

use Apps\Webiny\Php\Entities\User;
use Webiny\Component\Entity\Entity;
use Webiny\Component\StdLib\StdObject\DateTimeObject\DateTimeObject;

class Bootstrap extends \Apps\Webiny\Php\DevTools\LifeCycle\Bootstrap
{
    public function run(PackageManager\App $app)
    {
        parent::run($app);
        $this->addAppRoute('/^\/' . $this->wConfig()->get('Application.Backend') . '/', 'Webiny:Templates/Backend.tpl', 380);
        $this->addAppRoute('/^\/sandbox/', 'Webiny:Templates/Sandbox.tpl', 500);

        Entity::appendConfig([
            'Attributes' => [
                'many2many' => '\Apps\Webiny\Php\DevTools\Entity\Attributes\Many2ManyAttribute'
            ]
        ]);

        User::onActivity(function (User $user) {
            $user->lastActive = new DateTimeObject('now');
            $user->save();
        });

        User::onLoginSuccess(function (User $user) {
            $user->lastActive = new DateTimeObject('now');
            $user->lastLogin = $user->lastActive;
            $user->save();
        });
    }
}