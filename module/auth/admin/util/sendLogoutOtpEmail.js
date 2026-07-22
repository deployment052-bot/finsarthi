import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendLogoutOtpEmail = async (email, name, otp) => {
  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: "FinSarthi Security",
    },

    subject: "Logout All Devices Verification Code",

    text: `Your verification code is ${otp}. This OTP will expire in 5 minutes.`,

    html: `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Logout Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">

<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08);">

<tr>
<td style="background:#0f172a;padding:25px;text-align:center;">

<h1 style="color:#fff;margin:0;font-size:28px;">
FinSarthi
</h1>

<p style="color:#cbd5e1;margin-top:10px;">
Security Verification
</p>

</td>
</tr>

<tr>

<td style="padding:40px;">

<h2 style="margin:0;color:#111827;">
Hello ${name},
</h2>

<p style="font-size:16px;color:#4b5563;line-height:28px;margin-top:20px;">

We received a request to
<strong>log out all devices</strong>
from your FinSarthi account.

</p>

<p style="font-size:16px;color:#4b5563;line-height:28px;">

Please use the verification code below.

</p>

<div style="
margin:35px auto;
background:#f3f4f6;
border:2px dashed #2563eb;
border-radius:10px;
font-size:42px;
font-weight:bold;
letter-spacing:10px;
color:#2563eb;
text-align:center;
padding:22px;
width:260px;
">

${otp}

</div>

<p style="color:#6b7280;font-size:15px;line-height:26px;">

This code will expire in
<strong>5 minutes.</strong>

</p>

<p style="color:#6b7280;font-size:15px;line-height:26px;">

If you did not request this action,
please change your password immediately.

</p>

</td>

</tr>

<tr>

<td style="background:#f9fafb;padding:25px;text-align:center;">

<p style="color:#9ca3af;font-size:13px;margin:0;">
© ${new Date().getFullYear()} FinSarthi.
All Rights Reserved.
</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`,
  };

  await sgMail.send(msg);
};