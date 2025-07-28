/*
  # Initial Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `subscription_plan` (text, default 'free')
      - `subscription_status` (text, default 'active')
      - `tokens_used` (integer, default 0)
      - `tokens_remaining` (integer, default 1000)
      - `token_limit` (integer, default 1000)
      - `total_messages` (integer, default 0)
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `is_active` (boolean, default true)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `message` (text)
      - `response` (text)
      - `tokens_used` (integer)
      - `created_at` (timestamptz)

    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (decimal)
      - `currency` (text, default 'usd')
      - `status` (text)
      - `payment_method` (text)
      - `stripe_payment_intent_id` (text)
      - `paypal_order_id` (text)
      - `plan` (text)
      - `created_at` (timestamptz)

    - `paypal_orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `order_id` (text)
      - `plan` (text)
      - `amount` (decimal)
      - `status` (text)
      - `capture_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add admin policies for user management
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  subscription_plan text DEFAULT 'free',
  subscription_status text DEFAULT 'active',
  tokens_used integer DEFAULT 0,
  tokens_remaining integer DEFAULT 1000,
  token_limit integer DEFAULT 1000,
  total_messages integer DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  is_active boolean DEFAULT true,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  response text NOT NULL,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'usd',
  status text NOT NULL,
  payment_method text NOT NULL,
  stripe_payment_intent_id text,
  paypal_order_id text,
  plan text,
  created_at timestamptz DEFAULT now()
);

-- Create paypal_orders table
CREATE TABLE IF NOT EXISTS paypal_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id text NOT NULL,
  plan text NOT NULL,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'created',
  capture_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_orders ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin policies for user_profiles
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Chat messages policies
CREATE POLICY "Users can read own messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- PayPal orders policies
CREATE POLICY "Users can read own paypal orders"
  ON paypal_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own paypal orders"
  ON paypal_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own paypal orders"
  ON paypal_orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_orders_user_id ON paypal_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_orders_order_id ON paypal_orders(order_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();