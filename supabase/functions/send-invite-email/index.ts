
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  name: string;
  email: string;
  password: string;
  userType: 'student' | 'trainer';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("Received invite email request:", { 
      ...requestBody, 
      password: "[REDACTED]" 
    });

    const { name, email, password, userType }: InviteEmailRequest = requestBody;

    // Validate required fields
    if (!name || !email || !password || !userType) {
      console.error("Missing required fields:", { name: !!name, email: !!email, password: !!password, userType: !!userType });
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userTypeDisplay = userType.charAt(0).toUpperCase() + userType.slice(1);

    const emailResponse = await resend.emails.send({
      from: "Digital4 Bootcamp <onboarding@resend.dev>",
      to: [email],
      subject: `Welcome to Digital4 Bootcamp - ${userTypeDisplay} Access`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Digital4 Bootcamp</h1>
              <div style="width: 50px; height: 3px; background-color: #2563eb; margin: 10px auto;"></div>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome ${name}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Your ${userTypeDisplay.toLowerCase()} account has been created for the Digital4 Bootcamp platform. 
              You can now access the system using the credentials below.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">Login Credentials</h3>
              <p style="margin: 8px 0; color: #374151;"><strong>Username:</strong> ${email}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</code></p>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-weight: 500;">
                🔒 <strong>Important:</strong> Please log in and change your password immediately for security purposes.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                Access Platform
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center;">
              <p style="margin: 0;">This is an automated message from Digital4 Bootcamp.</p>
              <p style="margin: 5px 0 0 0;">Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Invite email sent successfully to:", email, "Response:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
