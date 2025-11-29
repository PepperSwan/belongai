-- Add graphical game courses for each difficulty level for Data Analyst role
INSERT INTO public.courses (role, difficulty, title, description, order_index, total_questions)
VALUES 
  ('Data Analyst', 'easy', 'Chart Challenge', 'Test your chart recognition skills with this interactive mini-game', 99, 1),
  ('Data Analyst', 'medium', 'Data Pattern Game', 'Identify patterns and trends in this engaging visual challenge', 99, 1),
  ('Data Analyst', 'hard', 'Analytics Puzzle', 'Master complex data visualization concepts through gameplay', 99, 1);