-- ============================================================
-- ARTOPIA — Row Level Security Policies
-- Run this file SECOND in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read non-banned profiles
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (is_banned = FALSE OR is_admin());

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- System can insert profile (via trigger)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can do anything
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (is_admin());

-- ============================================================
-- ADMINS
-- ============================================================

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admins table
CREATE POLICY "admins_select"
  ON admins FOR SELECT
  USING (is_admin() OR auth.uid() = user_id);

-- Only admins can manage admins
CREATE POLICY "admins_admin_all"
  ON admins FOR ALL
  USING (is_admin());

-- ============================================================
-- CATEGORIES
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "categories_select_all"
  ON categories FOR SELECT
  USING (TRUE);

-- Only admins can manage categories
CREATE POLICY "categories_admin_all"
  ON categories FOR ALL
  USING (is_admin());

-- ============================================================
-- EVENTS
-- ============================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Everyone can read non-draft events
CREATE POLICY "events_select_public"
  ON events FOR SELECT
  USING (status != 'draft' OR is_admin());

-- Only admins can create/update/delete events
CREATE POLICY "events_admin_all"
  ON events FOR ALL
  USING (is_admin());

-- ============================================================
-- SUBMISSIONS
-- ============================================================

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved submissions
CREATE POLICY "submissions_select_approved"
  ON submissions FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR is_admin());

-- Authenticated users can submit to events with open submissions
CREATE POLICY "submissions_insert_authenticated"
  ON submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_banned = FALSE
    )
    AND EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND status = 'submission_open'
    )
  );

-- Users can update their own submissions only while submissions are open
CREATE POLICY "submissions_update_own"
  ON submissions FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND status = 'submission_open'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND status = 'submission_open'
    )
  );

-- Users can delete their own submissions only while submissions are open
CREATE POLICY "submissions_delete_own"
  ON submissions FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND status = 'submission_open'
    )
  );

-- Admins can do anything with submissions
CREATE POLICY "submissions_admin_all"
  ON submissions FOR ALL
  USING (is_admin());

-- ============================================================
-- VOTES
-- ============================================================

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Users can read their own votes; admins can read all votes
CREATE POLICY "votes_select"
  ON votes FOR SELECT
  USING (auth.uid() = voter_id OR is_admin());

-- Users can vote only during voting_open, one vote per rank per event, cannot self-vote
CREATE POLICY "votes_insert"
  ON votes FOR INSERT
  WITH CHECK (
    auth.uid() = voter_id
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_banned = FALSE
    )
    AND EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND status = 'voting_open'
    )
    AND NOT EXISTS (
      SELECT 1 FROM submissions
      WHERE id = submission_id AND user_id = auth.uid()
    )
  );

-- Users can update their own votes (change which submission gets which rank)
CREATE POLICY "votes_update_own"
  ON votes FOR UPDATE
  USING (
    auth.uid() = voter_id
    AND EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND status = 'voting_open'
    )
  );

-- Users can remove their own votes during voting
CREATE POLICY "votes_delete_own"
  ON votes FOR DELETE
  USING (
    auth.uid() = voter_id
    AND EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND status = 'voting_open'
    )
  );

-- Admins can manage all votes
CREATE POLICY "votes_admin_all"
  ON votes FOR ALL
  USING (is_admin());

-- ============================================================
-- EVENT RESULTS
-- ============================================================

ALTER TABLE event_results ENABLE ROW LEVEL SECURITY;

-- Anyone can read results (only exist when published)
CREATE POLICY "event_results_select_public"
  ON event_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND status = 'results_published'
    )
    OR is_admin()
  );

-- Only admins can manage results
CREATE POLICY "event_results_admin_all"
  ON event_results FOR ALL
  USING (is_admin());

-- ============================================================
-- SETTINGS
-- ============================================================

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "settings_select_all"
  ON settings FOR SELECT
  USING (TRUE);

-- Only admins can update settings
CREATE POLICY "settings_admin_all"
  ON settings FOR ALL
  USING (is_admin());
