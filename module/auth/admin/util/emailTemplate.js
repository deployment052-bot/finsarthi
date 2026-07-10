export const forgotPasswordTemplate = (name, otp) => {
  return `
    <div style="font-family:Arial;padding:30px">
      <h2>Reset Password</h2>

      <p>Hello <strong>${name}</strong>,</p>

      <p>Your password reset OTP is:</p>

      <div style="
        font-size:34px;
        font-weight:bold;
        letter-spacing:10px;
        color:#2563eb;
        margin:20px 0;
      ">
        ${otp}
      </div>

      <p>This OTP will expire in <b>10 minutes</b>.</p>

      <p>If you didn't request this, simply ignore this email.</p>

      <br>

      <p>
        Regards,<br>
        <strong>FinSarthi Team</strong>
      </p>
    </div>
  `;
};