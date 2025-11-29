-- Add friend_code to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS friend_code TEXT UNIQUE;

-- Create function to generate unique friend codes
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6 character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE friend_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles to have friend codes
UPDATE public.profiles 
SET friend_code = generate_friend_code()
WHERE friend_code IS NULL;

-- Create trigger to auto-generate friend codes for new users
CREATE OR REPLACE FUNCTION set_friend_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.friend_code IS NULL THEN
    NEW.friend_code := generate_friend_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_friend_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION set_friend_code();

-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view their own friendships
CREATE POLICY "Users can view their own friendships"
ON public.friendships
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friendships for themselves
CREATE POLICY "Users can create their own friendships"
ON public.friendships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own friendships
CREATE POLICY "Users can delete their own friendships"
ON public.friendships
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Update profiles RLS to allow friends to view each other
CREATE POLICY "Users can view their friends profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = profiles.id)
       OR (friendships.friend_id = auth.uid() AND friendships.user_id = profiles.id)
  )
);

-- Allow viewing other users' stats for leaderboard (excluding email)
CREATE POLICY "Anyone can view basic profile info for leaderboard"
ON public.profiles
FOR SELECT
USING (true);

-- Update user_streaks RLS to allow friends to view
CREATE POLICY "Friends can view each others streaks"
ON public.user_streaks
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = user_streaks.user_id)
       OR (friendships.friend_id = auth.uid() AND friendships.user_id = user_streaks.user_id)
  )
);

-- Update user_trophies RLS to allow friends to view
CREATE POLICY "Friends can view each others trophies"
ON public.user_trophies
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = user_trophies.user_id)
       OR (friendships.friend_id = auth.uid() AND friendships.user_id = user_trophies.user_id)
  )
);

-- Update user_course_progress RLS to allow friends to view
CREATE POLICY "Friends can view each others course progress"
ON public.user_course_progress
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = user_course_progress.user_id)
       OR (friendships.friend_id = auth.uid() AND friendships.user_id = user_course_progress.user_id)
  )
);

-- Update learning_progress RLS to allow friends to view
CREATE POLICY "Friends can view each others learning progress"
ON public.learning_progress
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (friendships.user_id = auth.uid() AND friendships.friend_id = learning_progress.user_id)
       OR (friendships.friend_id = auth.uid() AND friendships.user_id = learning_progress.user_id)
  )
);