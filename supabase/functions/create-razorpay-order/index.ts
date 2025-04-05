
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    // Validate Razorpay credentials
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay credentials");
      return new Response(
        JSON.stringify({ error: "Missing Razorpay credentials" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Razorpay credentials found");

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Missing Supabase credentials" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const { amount, currency = "INR", user_id, order_details } = reqBody;

    if (!amount || !user_id || !order_details) {
      console.error("Missing required fields:", { amount, user_id, hasOrderDetails: !!order_details });
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          details: { 
            hasAmount: !!amount, 
            hasUserId: !!user_id, 
            hasOrderDetails: !!order_details 
          } 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Creating Razorpay order with amount:", amount);
    console.log("Order details:", JSON.stringify(order_details));

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
        currency,
        receipt: `order_${Date.now()}`,
        notes: {
          company_name: "GADA ELECTRONICS"
        }
      }),
    });

    // Handle Razorpay API errors
    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error("Razorpay API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Razorpay API error", details: errorData }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log("Razorpay order created:", razorpayOrder.id);

    // Simplify order items to avoid any complex data issues
    const simplifiedItems = order_details.items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_purchase: item.product.price,
    }));

    // Save order to database
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id,
        total: amount,
        status: "pending",
        shipping_address: order_details.shipping_address,
        razorpay_order_id: razorpayOrder.id,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Database error:", orderError);
      return new Response(
        JSON.stringify({ error: `Database error: ${orderError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Add order items
    const orderItems = simplifiedItems.map((item) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Database error for order items:", itemsError);
      return new Response(
        JSON.stringify({ error: `Database error: ${itemsError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        order_id: razorpayOrder.id,
        db_order_id: orderData.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: RAZORPAY_KEY_ID,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Function error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
