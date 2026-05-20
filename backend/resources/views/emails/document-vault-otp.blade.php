<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MSME - Document Vault Access</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e6eaf0;border-radius:12px;padding:20px;">
        <h2 style="margin:0 0 12px 0;color:#0f172a;">Document vault access</h2>
        <p style="margin:0 0 16px 0;color:#334155;line-height:1.5;">
          Use this OTP to unlock your document vault on <strong>MSME</strong>.
        </p>

        <div style="margin:16px 0;padding:14px 16px;border-radius:12px;background:#f1f5f9;border:1px solid #e2e8f0;">
          <div style="font-size:12px;color:#475569;margin-bottom:6px;">Your 4-digit OTP</div>
          <div style="font-size:28px;letter-spacing:6px;font-weight:700;color:#0f172a;">{{ $otp }}</div>
        </div>

        <p style="margin:0;color:#475569;font-size:13px;">
          This OTP expires in {{ $expiresMinutes }} minutes.
        </p>
      </div>
      <p style="margin:14px 0 0 0;color:#64748b;font-size:12px;line-height:1.4;">
        If you did not request this, change your password and contact support.
      </p>
    </div>
  </body>
</html>
