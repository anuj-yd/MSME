<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Entitlement extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'entitlements';

    protected $fillable = [
        'user_id',
        'is_premium',
        'premium_until',
    ];

    protected $casts = [
        'is_premium' => 'boolean',
        'premium_until' => 'datetime',
    ];
}

