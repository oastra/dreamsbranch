import { Resend } from "resend";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Email service not configured" }, { status: 503 });
    }
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "Dreams Branch <onboarding@resend.dev>",
      to: "your@email.com",
      subject: "New waitlist signup",
      html: `<p>New subscriber: ${email}</p>`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
