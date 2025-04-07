
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          is_admin: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          is_admin?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          is_admin?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category: string
          subcategory: string | null
          price: number
          original_price: number | null
          description: string
          features: Json | null
          images: string[]
          rating: number
          review_count: number
          stock: number
          is_featured: boolean | null
          is_new: boolean | null
          specifications: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          subcategory?: string | null
          price: number
          original_price?: number | null
          description: string
          features?: Json | null
          images: string[]
          rating?: number
          review_count?: number
          stock?: number
          is_featured?: boolean | null
          is_new?: boolean | null
          specifications?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          subcategory?: string | null
          price?: number
          original_price?: number | null
          description?: string
          features?: Json | null
          images?: string[]
          rating?: number
          review_count?: number
          stock?: number
          is_featured?: boolean | null
          is_new?: boolean | null
          specifications?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          total: number
          shipping_address: Json
          payment_details: Json | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total: number
          shipping_address: Json
          payment_details?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total?: number
          shipping_address?: Json
          payment_details?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_at_purchase: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_at_purchase: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_at_purchase?: number
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
