-- SQL Migration: Create alert_subscriptions table
-- Run this query in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  threshold_score INTEGER NOT NULL CHECK (threshold_score >= 0 AND threshold_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_triggered_at TIMESTAMPTZ,
  last_triggered_score INTEGER,
  CONSTRAINT unique_email_threshold UNIQUE (email, threshold_score)
);
