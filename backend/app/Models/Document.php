<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Document extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'documents';

    protected $fillable = [
        'user_id',
        'original_name',
        'mime_type',
        'size_bytes',
        'imagekit_file_id',
        'imagekit_url',
        'imagekit_thumbnail_url',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
    ];
}

