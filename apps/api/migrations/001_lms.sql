CREATE SCHEMA lms;
REVOKE ALL ON SCHEMA lms FROM PUBLIC;

CREATE TABLE lms.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (btrim(name) <> ''),
  email text NOT NULL CHECK (email = lower(btrim(email))),
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('Administrator', 'Instructor', 'Student')),
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz,
  UNIQUE (email),
  UNIQUE (id, role)
);
CREATE INDEX users_role_status_idx ON lms.users (role, status);
CREATE INDEX users_last_login_idx ON lms.users (last_login_at);

CREATE TABLE lms.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL UNIQUE CHECK (course_code = upper(btrim(course_code)) AND course_code <> ''),
  course_name text NOT NULL CHECK (btrim(course_name) <> ''),
  description text NOT NULL DEFAULT '',
  instructor_id uuid NOT NULL,
  instructor_role text GENERATED ALWAYS AS ('Instructor'::text) STORED,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (instructor_id, instructor_role) REFERENCES lms.users (id, role)
);
CREATE INDEX courses_instructor_idx ON lms.courses (instructor_id);

CREATE TABLE lms.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  student_role text GENERATED ALWAYS AS ('Student'::text) STORED,
  course_id uuid NOT NULL REFERENCES lms.courses (id),
  enrollment_date timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  FOREIGN KEY (student_id, student_role) REFERENCES lms.users (id, role),
  UNIQUE (student_id, course_id)
);
CREATE INDEX enrollments_course_idx ON lms.enrollments (course_id);

CREATE TABLE lms.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES lms.courses (id),
  title text NOT NULL CHECK (btrim(title) <> ''),
  description text NOT NULL DEFAULT '',
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, course_id)
);
CREATE INDEX activities_course_idx ON lms.activities (course_id);

CREATE TABLE lms.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  course_id uuid NOT NULL,
  student_id uuid NOT NULL,
  submission_content text,
  file_reference text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Returned', 'Graded')),
  CHECK (coalesce(nullif(btrim(submission_content), ''), nullif(btrim(file_reference), '')) IS NOT NULL),
  FOREIGN KEY (activity_id, course_id) REFERENCES lms.activities (id, course_id),
  FOREIGN KEY (student_id, course_id) REFERENCES lms.enrollments (student_id, course_id),
  UNIQUE (activity_id, student_id)
);
CREATE INDEX submissions_student_course_idx ON lms.submissions (student_id, course_id);

CREATE TABLE lms.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  activity_id uuid NOT NULL,
  instructor_id uuid NOT NULL,
  instructor_role text GENERATED ALWAYS AS ('Instructor'::text) STORED,
  grade numeric(7, 2) NOT NULL CHECK (grade >= 0),
  feedback text,
  graded_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (activity_id, student_id) REFERENCES lms.submissions (activity_id, student_id),
  FOREIGN KEY (instructor_id, instructor_role) REFERENCES lms.users (id, role),
  UNIQUE (student_id, activity_id)
);
CREATE INDEX grades_instructor_idx ON lms.grades (instructor_id);
CREATE INDEX grades_submission_idx ON lms.grades (activity_id, student_id);

CREATE TABLE lms.sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES lms.users (id),
  expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_user_idx ON lms.sessions (user_id);
CREATE INDEX sessions_expiry_idx ON lms.sessions (expires_at);

CREATE TABLE lms.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO lms.schema_migrations (version) VALUES ('001_lms');

ALTER TABLE lms.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.schema_migrations ENABLE ROW LEVEL SECURITY;
