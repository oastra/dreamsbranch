import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

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
