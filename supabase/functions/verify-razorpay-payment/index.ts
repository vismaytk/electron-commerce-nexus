import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("Missing Razorpay secret key");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !db_order_id) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          details: {
            razorpay_order_id: !razorpay_order_id ? "Razorpay order ID is required" : null,
            razorpay_payment_id: !razorpay_payment_id ? "Razorpay payment ID is required" : null,
            razorpay_signature: !razorpay_signature ? "Razorpay signature is required" : null,
            db_order_id: !db_order_id ? "Database order ID is required" : null
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the order exists and is in pending state
    const { data: existingOrder, error: orderError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", db_order_id)
      .single();

    if (orderError || !existingOrder) {
      return new Response(
        JSON.stringify({ 
          error: "Order not found",
          details: orderError?.message || "Order does not exist"
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (existingOrder.status !== "pending") {
      return new Response(
        JSON.stringify({ 
          error: "Invalid order status",
          details: `Order is in ${existingOrder.status} state`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify signature
    try {
      const generatedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const isAuthentic = generatedSignature === razorpay_signature;

      if (!isAuthentic) {
        // Update order status to failed
        await supabase
          .from("orders")
          .update({ 
            status: "failed",
            payment_details: {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              error: "Payment signature verification failed",
              verified_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq("id", db_order_id);

        return new Response(
          JSON.stringify({ 
            error: "Payment verification failed",
            details: "Invalid payment signature"
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verify payment status with Razorpay
      const auth = btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${RAZORPAY_KEY_SECRET}`);
      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      if (!paymentResponse.ok) {
        throw new Error("Failed to verify payment status with Razorpay");
      }

      const paymentData = await paymentResponse.json();
      
      if (paymentData.status !== "captured") {
        throw new Error(`Payment is not captured. Status: ${paymentData.status}`);
      }

      // Update order status to completed
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          razorpay_payment_id,
          payment_details: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            payment_status: paymentData.status,
            payment_method: paymentData.method,
            verified_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", db_order_id);

      if (updateError) {
        throw new Error(`Failed to update order status: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment verified successfully",
          order_id: db_order_id,
          payment_id: razorpay_payment_id
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Payment verification error:", error);
      
      // Update order status to failed
      await supabase
        .from("orders")
        .update({ 
          status: "failed",
          payment_details: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            error: error.message,
            verified_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", db_order_id);

      return new Response(
        JSON.stringify({ 
          error: "Payment verification failed",
          details: error.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
