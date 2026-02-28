/**
 * Nexus ERP - Email Templates (Plain HTML)
 */

export const INVITATION_EMAIL = (orgName, inviteLink) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #ffffff; color: #000000; padding: 40px;">
  <div style="border: 2px solid #000000; padding: 40px; box-shadow: 8px 8px 0px #000000;">
    <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 20px;">
      JOIN ${orgName.toUpperCase()}
    </h1>
    <p style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px;">
      You have been invited to join the organization on Nexus ERP.
    </p>
    <a href="${inviteLink}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 15px 30px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; border: 1px solid #000000;">
      ACCEPT INVITATION
    </a>
    <p style="font-size: 10px; color: #666666; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px;">
      If you didn't expect this email, you can safely ignore it.
    </p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_EMAIL = (resetLink) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #ffffff; color: #000000; padding: 40px;">
  <div style="border: 2px solid #000000; padding: 40px; box-shadow: 8px 8px 0px #000000;">
    <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 20px;">
      RESET PASSWORD
    </h1>
    <p style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px;">
      Click the button below to reset your Nexus ERP password.
    </p>
    <a href="${resetLink}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 15px 30px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; border: 1px solid #000000;">
      RESET PASSWORD
    </a>
    <p style="font-size: 10px; color: #666666; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px;">
      Link expires in 1 hour.
    </p>
  </div>
</body>
</html>
`;
