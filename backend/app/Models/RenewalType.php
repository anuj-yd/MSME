<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class RenewalType extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'renewal_types';

    protected $fillable = [
        'code',
        'name',
        'description',
        'required_document_tags',
        'fields_schema',
        'active',
    ];

    protected $casts = [
        'required_document_tags' => 'array',
        'fields_schema' => 'array',
        'active' => 'boolean',
    ];
}
