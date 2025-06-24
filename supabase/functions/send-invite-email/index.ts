
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
    const { name, email, password, userType }: InviteEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Digital4 Bootcamp <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Digital4 Bootcamp",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to Digital4 Bootcamp</h2>
          
          <p>Hello ${name},</p>
          
          <p>Your account has been created.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong style="color: #dc2626;">Username:</strong> ${email}</p>
            <p><strong style="color: #dc2626;">Password:</strong> ${password}</p>
          </div>
          
          <p>Please <strong>log in</strong> and <strong>reset</strong> your password.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    console.log("Invite email sent successfully:", emailResponse);

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
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
