<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ $appName }} - Registration successful</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e6eaf0;border-radius:12px;padding:20px;">
        <h2 style="margin:0 0 12px 0;color:#0f172a;">You're successfully registered</h2>
        <p style="margin:0 0 12px 0;color:#334155;line-height:1.5;">
          Hi {{ $name }}, your email has been verified and your account on <strong>{{ $appName }}</strong> is now active.
        </p>
        <p style="margin:0;color:#475569;line-height:1.5;">
          You can now login and continue your renewal process.
        </p>
      </div>
      <p style="margin:14px 0 0 0;color:#64748b;font-size:12px;line-height:1.4;">
        If you didn’t create this account, please ignore this email.
      </p>
    </div>
  </body>
</html>

