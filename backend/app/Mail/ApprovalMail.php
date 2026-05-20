<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApprovalMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $name,
        public readonly string $trackingId,
        public readonly string $appName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->appName} - Renewal approved",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.approval',
            with: [
                'name' => $this->name,
                'trackingId' => $this->trackingId,
                'appName' => $this->appName,
            ],
        );
    }
}
