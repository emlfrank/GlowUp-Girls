import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://einrfndbtscmcrgdgyxx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbnJmbmRidHNjbWNyZ2RneXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjEwNDMsImV4cCI6MjA5NDgzNzA0M30.b7Tog1oei15zufPQeCOq6fO5sWi7hBDr_QW6IjYdAnQ"
)
