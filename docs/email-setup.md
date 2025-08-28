# Email Setup Guide: Vercel + Resend + Next.js

This guide covers setting up email sending and forwarding in a Next.js application deployed on Vercel using Resend as the email service provider.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up Resend](#setting-up-resend)
3. [Configuring Your Domain](#configuring-your-domain)
4. [Setting Up Next.js API Routes](#setting-up-nextjs-api-routes)
5. [Environment Variables](#environment-variables)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- A Next.js project deployed on Vercel
- A domain name (e.g., `yourdomain.com`)
- A Resend account (sign up at [resend.com](https://resend.com))
- A ProtonMail account (or any other email service for receiving forwarded emails)
- Git and GitHub account (for deployment)

## Setting Up Resend

1. **Create a Resend Account**

   - Go to [resend.com](https://resend.com)
   - Sign up for a free account
   - Verify your email address
   - Complete your profile setup

2. **Get Your API Key**

   - In the Resend dashboard, go to "API Keys"
   - Click "Create API Key"
   - Give it a name (e.g., "Portfolio Email")
   - Select the appropriate permissions (at minimum: `emails.send`)
   - Copy the API key (starts with `re_`)
   - ⚠️ Save this key securely - you won't be able to see it again

3. **Verify Your Domain**
   - In the Resend dashboard, go to "Domains"
   - Click "Add Domain"
   - Enter your domain name
   - Add the required DNS records:
     ```
     Type: MX
     Name: @
     Value: inbound.resend.com
     Priority: 10
     ```
   - Add DKIM and SPF records as provided by Resend
   - Wait for domain verification (can take up to 24 hours)
   - Check the verification status in the Resend dashboard

## Configuring Your Domain

1. **DNS Records**
   Add these records to your domain's DNS settings:

   ```
   # MX Record for receiving emails
   Type: MX
   Name: @
   Value: inbound.resend.com
   Priority: 10

   # DKIM Records (provided by Resend)
   Type: TXT
   Name: [provided by Resend]
   Value: [provided by Resend]

   # SPF Record
   Type: TXT
   Name: @
   Value: v=spf1 include:resend.com ~all
   ```

   ⚠️ Important DNS Notes:

   - Some registrars use different terminology:
     - "Host" instead of "Name"
     - "Points to" instead of "Value"
     - "TTL" might be required (use 3600 or 1 hour)
   - DNS changes can take 24-48 hours to propagate
   - You can check propagation using tools like [MXToolbox](https://mxtoolbox.com)

2. **Email Addresses**
   - Set up your contact email: `contact@yourdomain.com`
   - This will be used for receiving contact form submissions
   - Configure forwarding to your ProtonMail address
   - Test the email address by sending a test email

## Setting Up Next.js API Routes

1. **Contact Form API Route**
   Create `src/app/api/contact/route.ts`:

   ```typescript
   import { Resend } from "resend";
   import { NextResponse } from "next/server";

   const resend = new Resend(process.env.RESEND_API_KEY);

   export async function POST(request: Request) {
     try {
       const { name, email, message } = await request.json();

       // Validate input
       if (!name || !email || !message) {
         return NextResponse.json(
           { error: "Missing required fields" },
           { status: 400 },
         );
       }

       // Validate email format
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(email)) {
         return NextResponse.json(
           { error: "Invalid email format" },
           { status: 400 },
         );
       }

       const data = await resend.emails.send({
         from: "Portfolio Contact Form <contact@yourdomain.com>",
         to: ["contact@yourdomain.com"],
         subject: `New Contact Form Submission from ${name}`,
         html: `
           <h2>New Contact Form Submission</h2>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Message:</strong></p>
           <p>${message}</p>
         `,
         replyTo: email,
       });

       return NextResponse.json({ success: true, data });
     } catch (error) {
       console.error("Email sending error:", error);
       return NextResponse.json(
         { success: false, error: "Failed to send email" },
         { status: 500 },
       );
     }
   }
   ```

2. **Email Forwarding API Route**
   Create `src/app/api/forward-email/route.ts`:

   ```typescript
   import { Resend } from "resend";
   import { NextResponse } from "next/server";
   import crypto from "crypto";

   const resend = new Resend(process.env.RESEND_API_KEY);

   function verifyWebhookSignature(
     payload: string,
     signature: string,
     webhookSecret: string,
   ) {
     const hmac = crypto.createHmac("sha256", webhookSecret);
     const calculatedSignature = hmac.update(payload).digest("hex");
     return crypto.timingSafeEqual(
       Buffer.from(signature),
       Buffer.from(calculatedSignature),
     );
   }

   export async function POST(request: Request) {
     try {
       const signature = request.headers.get("resend-signature");
       const body = await request.json();

       if (body.type === "email.delivered") {
         // Verify webhook signature
         if (
           !signature ||
           !verifyWebhookSignature(
             JSON.stringify(body),
             signature,
             process.env.RESEND_WEBHOOK_SECRET!,
           )
         ) {
           console.error("Invalid webhook signature");
           return NextResponse.json(
             { error: "Invalid webhook signature" },
             { status: 401 },
           );
         }

         const emailData = body.data;

         // Log received email for debugging
         console.log("Received email:", {
           from: emailData.from,
           subject: emailData.subject,
           timestamp: new Date().toISOString(),
         });

         const { data, error } = await resend.emails.send({
           from: "Portfolio Contact <contact@yourdomain.com>",
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
           console.error("Forwarding error:", error);
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

       const { data, error } = await resend.emails.send({
         from: "Portfolio Contact <contact@yourdomain.com>",
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
         console.error("Forwarding error:", error);
         return NextResponse.json({ error }, { status: 400 });
       }

       return NextResponse.json({ success: true, data });
     } catch (error) {
       console.error("Internal server error:", error);
       return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 },
       );
     }
   }
   ```

## Environment Variables

1. **Local Development**
   Create or update `.env.local`:

   ```bash
   # Resend API Key
   RESEND_API_KEY=re_your_api_key_here

   # Webhook Secret (from Resend webhook settings)
   RESEND_WEBHOOK_SECRET=your_webhook_secret_here

   # Email to forward to
   FORWARD_TO_EMAIL=your.protonmail@address
   ```

2. **Vercel Environment Variables**

   - Go to your Vercel project dashboard
   - Click on "Settings"
   - Select "Environment Variables"
   - Add each variable:

     ```
     Name: RESEND_API_KEY
     Value: re_your_api_key_here
     Environment: Production, Preview, Development

     Name: RESEND_WEBHOOK_SECRET
     Value: your_webhook_secret_here
     Environment: Production, Preview, Development

     Name: FORWARD_TO_EMAIL
     Value: your.protonmail@address
     Environment: Production, Preview, Development
     ```

   - Click "Save" for each variable
   - Redeploy your application to apply changes

## Testing

1. **Local Testing**
   Create a test script `test-api.sh`:

   ```bash
   #!/bin/bash

   echo "Testing Contact Form API..."
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "message": "This is a test message from the contact form"
     }'

   echo -e "\n\nTesting Email Forwarding API..."
   curl -X POST http://localhost:3000/api/forward-email \
     -H "Content-Type: application/json" \
     -d '{
       "from": "test@example.com",
       "subject": "Test Email",
       "text": "This is a test email for forwarding"
     }'
   ```

2. **Webhook Testing**
   - Deploy your site to Vercel
   - Get your deployed URL (e.g., `https://yourdomain.com`)
   - In Resend dashboard:
     1. Go to "Webhooks"
     2. Click "Add Webhook"
     3. Select "Email Delivered" event
     4. Set endpoint to `https://yourdomain.com/api/forward-email`
     5. Copy the webhook secret
     6. Add the secret to Vercel environment variables
     7. Click "Save"
   - Send a test email to `contact@yourdomain.com`
   - Check your ProtonMail inbox for the forwarded email
   - Monitor Vercel logs for any errors

## Deployment

1. **Vercel Deployment**

   - Push your code to GitHub:
     ```bash
     git add .
     git commit -m "Add email forwarding setup"
     git push origin main
     ```
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure project settings:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `next build`
     - Output Directory: .next
   - Add environment variables (as described above)
   - Click "Deploy"

2. **Resend Webhook Setup**
   - Go to Resend dashboard → Webhooks
   - Click "Add Webhook"
   - Configure webhook:
     - Name: "Portfolio Email Forwarding"
     - Events: Select "Email Delivered"
     - Endpoint: `https://yourdomain.com/api/forward-email`
     - HTTP Method: POST
     - Headers: Leave empty
     - Secret: Copy the generated secret
   - Click "Save"
   - Add the webhook secret to Vercel environment variables
   - Test the webhook using the "Send Test Event" button

## Troubleshooting

1. **Emails Not Being Received**

   - Check DNS records are properly configured
   - Verify domain is verified in Resend
   - Check spam folder
   - Verify environment variables are set correctly
   - Check Vercel logs for errors
   - Verify MX record propagation using [MXToolbox](https://mxtoolbox.com)

2. **Webhook Issues**

   - Verify webhook URL is correct
   - Check webhook secret is properly set
   - Monitor Vercel logs for errors
   - Test webhook with Postman:
     ```bash
     curl -X POST https://yourdomain.com/api/forward-email \
       -H "Content-Type: application/json" \
       -H "resend-signature: your_signature" \
       -d '{
         "type": "email.delivered",
         "data": {
           "from": "test@example.com",
           "subject": "Test",
           "text": "Test content"
         }
       }'
     ```

3. **Common Issues**

   - DNS propagation delay (can take up to 24 hours)
   - Incorrect API key
   - Missing environment variables
   - Invalid webhook signature
   - Rate limiting (check Resend dashboard)
   - Spam filters blocking emails

4. **Debugging Tips**
   - Enable Vercel logging
   - Check Resend dashboard for delivery status
   - Use Postman for API testing
   - Monitor email headers for issues
   - Check domain verification status

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [DNS Records Guide](https://resend.com/docs/domains/verify-domain)
- [Webhook Testing Guide](https://resend.com/docs/webhooks)
- [Email Deliverability Guide](https://resend.com/docs/deliverability)
