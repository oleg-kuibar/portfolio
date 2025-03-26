import { Resend } from "resend";
import { NextResponse } from "next/server";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string,
) {
  try {
    const hmac = crypto.createHmac("sha256", webhookSecret);
    const calculatedSignature = hmac.update(payload).digest("hex");
    return signature === calculatedSignature;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("resend-signature");
    const body = await request.json();

    // Handle webhook payload
    if (body.type === "email.delivered") {
      // Verify webhook signature
      if (!signature) {
        return NextResponse.json(
          { error: "Missing webhook signature" },
          { status: 401 },
        );
      }

      if (!process.env.RESEND_WEBHOOK_SECRET) {
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 },
        );
      }

      const isValid = verifyWebhookSignature(
        JSON.stringify(body),
        signature,
        process.env.RESEND_WEBHOOK_SECRET
      );

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 },
        );
      }

      const emailData = body.data;

      // Forward the email to your ProtonMail address
      const { data, error } = await resend.emails.send({
        from: "Portfolio Contact <contact@olegkuibar.dev>",
        to: process.env.FORWARD_TO_EMAIL!,
        subject: `[Portfolio Contact] ${emailData.subject}`,
        text: `
From: ${emailData.from}
Subject: ${emailData.subject}

${emailData.text}
        `,
        replyTo: emailData.from,
      });

      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      return NextResponse.json({ success: true, data });
    }

    // Handle direct API calls (for testing)
    if (!body.from || !body.subject || !body.text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Forward the email to your ProtonMail address
    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact <contact@olegkuibar.dev>",
      to: process.env.FORWARD_TO_EMAIL!,
      subject: `[Portfolio Contact] ${body.subject}`,
      text: `
From: ${body.from}
Subject: ${body.subject}

${body.text}
      `,
      replyTo: body.from,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
