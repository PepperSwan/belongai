-- Create courses table
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  title text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL,
  total_questions integer NOT NULL DEFAULT 4,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user course progress table
CREATE TABLE public.user_course_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  questions_answered integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 4,
  first_attempt_correct integer NOT NULL DEFAULT 0,
  total_attempts integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  last_accessed timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create trophies table
CREATE TABLE public.trophies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  criteria_type text NOT NULL,
  criteria_value jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user trophies table
CREATE TABLE public.user_trophies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trophy_id uuid NOT NULL REFERENCES public.trophies(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, trophy_id)
);

-- Create user streaks table
CREATE TABLE public.user_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  max_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses (public read)
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  USING (true);

-- RLS Policies for user_course_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_course_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for trophies (public read)
CREATE POLICY "Anyone can view trophies"
  ON public.trophies FOR SELECT
  USING (true);

-- RLS Policies for user_trophies
CREATE POLICY "Users can view their own trophies"
  ON public.user_trophies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trophies"
  ON public.user_trophies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streak"
  ON public.user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak"
  ON public.user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak"
  ON public.user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updating user_streaks updated_at
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample courses for Data Analyst
INSERT INTO public.courses (role, difficulty, title, description, order_index, total_questions) VALUES
('Data Analyst', 'easy', 'Data Fundamentals', 'Learn the basics of data analysis and interpretation', 1, 4),
('Data Analyst', 'easy', 'Working with Numbers', 'Master basic calculations and metrics', 2, 4),
('Data Analyst', 'medium', 'Data Visualization', 'Create meaningful charts and dashboards', 3, 4),
('Data Analyst', 'medium', 'Statistical Thinking', 'Apply statistical concepts to real problems', 4, 4),
('Data Analyst', 'hard', 'Advanced Analytics', 'Deep dive into complex data scenarios', 5, 4),
('Data Analyst', 'hard', 'Business Intelligence', 'Drive decisions with data insights', 6, 4);

-- Insert sample trophies
INSERT INTO public.trophies (name, description, icon, criteria_type, criteria_value) VALUES
('The Data Trophy', 'Try out at least one course in a data role', '📊', 'role_attempt', '{"role": "data"}'),
('The Design Trophy', 'Try out at least one course in a design role', '🎨', 'role_attempt', '{"role": "design"}'),
('The Jack of All Trades', 'Complete one course in at least three different roles', '🌟', 'diverse_roles', '{"count": 3}'),
('Data Master', 'Complete half of all data courses', '🏆', 'role_progress', '{"role": "Data Analyst", "percentage": 50}'),
('Data Expert', 'Complete all data courses', '👑', 'role_progress', '{"role": "Data Analyst", "percentage": 100}'),
('Early Bird', 'Complete a course before 9am', '🌅', 'time_based', '{"before": "09:00"}'),
('Night Owl', 'Complete a course after 10pm', '🦉', 'time_based', '{"after": "22:00"}'),
('First Steps', 'Complete your first course', '🎯', 'course_count', '{"count": 1}'),
('On Fire', 'Maintain a 7-day streak', '🔥', 'streak', '{"days": 7}'),
('Unstoppable', 'Maintain a 30-day streak', '⚡', 'streak', '{"days": 30}');