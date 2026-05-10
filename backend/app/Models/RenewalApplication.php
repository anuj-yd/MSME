<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class RenewalApplication extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'renewal_applications';

    protected $fillable = [
        'user_id',
        'renewal_type_code',
        'status',
        'fields',
        'document_ids',
        'submitted_at',
    ];

    protected $casts = [
        'fields' => 'array',
        'document_ids' => 'array',
        'submitted_at' => 'datetime',
    ];
}

