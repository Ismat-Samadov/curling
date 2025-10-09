-- Make a user admin by email
-- Replace 'user@example.com' with the actual user email
UPDATE poster.users
SET is_admin = true, updated_at = NOW()
WHERE email = 'user@example.com';

-- Verify the admin status
SELECT id, name, email, is_admin
FROM poster.users
WHERE email = 'user@example.com';
