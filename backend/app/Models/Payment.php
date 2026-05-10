<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Payment extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'payments';

    protected $fillable = [
        'user_id',
        'provider',
        'purpose',
        'amount_inr',
        'currency',
        'status',
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'raw',
    ];

    protected $casts = [
        'raw' => 'array',
    ];
}

