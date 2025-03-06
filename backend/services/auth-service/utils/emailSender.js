const postmark = require("postmark");

// Initialize Postmark client
const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    await client.sendEmail({
      From: process.env.POSTMARK_SENDER_EMAIL, // Ensure this email is verified in Postmark
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
      MessageStream: "outbound",
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

module.exports = sendEmail;