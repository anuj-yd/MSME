<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class OtpApproval extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'otp_approvals';

    protected $fillable = [
        'renewal_id',
        'user_id',
        'requested_by_admin_id',
        'status',
        'expires_at',
        'otp_ciphertext',
        'viewed_at',
        'note',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'viewed_at' => 'datetime',
    ];
}

