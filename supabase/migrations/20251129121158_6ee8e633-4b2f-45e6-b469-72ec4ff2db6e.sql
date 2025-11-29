-- Fix security warnings by setting search_path on functions

-- Recreate generate_friend_code function with search_path
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE friend_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Recreate set_friend_code function with search_path
CREATE OR REPLACE FUNCTION set_friend_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.friend_code IS NULL THEN
    NEW.friend_code := generate_friend_code();
  END IF;
  RETURN NEW;
END;
$$;