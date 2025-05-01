import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const data = await resend.emails.send({
      from: "Wealthwise <onboarding@resend.dev>",
      to: to,
      subject,
      react,
    });
    console.log("Sending email to:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
