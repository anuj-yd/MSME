<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $otp,
        public readonly int $expiresMinutes,
        public readonly string $appName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->appName} - Reset your password",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset-otp',
            with: [
                'otp' => $this->otp,
                'expiresMinutes' => $this->expiresMinutes,
                'appName' => $this->appName,
            ],
        );
    }
}
