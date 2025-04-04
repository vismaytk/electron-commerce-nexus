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

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("Missing Razorpay credentials");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { amount, currency = "INR", user_id, order_details } = await req.json();

    if (!amount || !user_id || !order_details) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          details: {
            amount: !amount ? "Amount is required" : null,
            user_id: !user_id ? "User ID is required" : null,
            order_details: !order_details ? "Order details are required" : null
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Amount must be greater than 0" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    let razorpayOrder;
    try {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
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
            user_id: user_id,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Razorpay API error: ${JSON.stringify(errorData)}`);
      }

      razorpayOrder = await response.json();
    } catch (error) {
      console.error("Razorpay order creation failed:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create Razorpay order",
          details: error.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Save order to database
    let orderData;
    try {
      const { data, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id,
          total: amount,
          status: "pending",
          shipping_address: order_details.shipping_address,
          razorpay_order_id: razorpayOrder.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;
      orderData = data;
    } catch (error) {
      console.error("Database order creation failed:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create order in database",
          details: error.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Add order items
    try {
      const orderItems = order_details.items.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;
    } catch (error) {
      console.error("Database order items creation failed:", error);
      // Attempt to delete the created order since items failed
      await supabase
        .from("orders")
        .delete()
        .eq("id", orderData.id);

      return new Response(
        JSON.stringify({ 
          error: "Failed to create order items",
          details: error.message
        }),
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
