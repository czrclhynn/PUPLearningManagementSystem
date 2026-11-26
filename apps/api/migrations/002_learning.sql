ALTER TABLE lms.users ADD COLUMN instructor_approval text;
UPDATE lms.users SET instructor_approval = 'Approved' WHERE role = 'Instructor';
ALTER TABLE lms.users ADD CONSTRAINT instructor_approval_check CHECK (
  (role = 'Instructor' AND instructor_approval IS NOT NULL
    AND instructor_approval IN ('Pending', 'Approved', 'Rejected')
    AND (instructor_approval = 'Approved' OR status = 'Inactive'))
  OR (role <> 'Instructor' AND instructor_approval IS NULL)
);

ALTER TABLE lms.activities
  ADD COLUMN max_points numeric(7, 2) NOT NULL DEFAULT 100 CHECK (max_points > 0),
  ADD COLUMN status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  ADD COLUMN material_url text,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

UPDATE lms.activities a SET max_points = scores.highest
FROM (SELECT activity_id, max(grade) AS highest FROM lms.grades GROUP BY activity_id) scores
WHERE a.id = scores.activity_id AND scores.highest > a.max_points;

CREATE INDEX activities_course_status_due_idx ON lms.activities (course_id, status, due_date);
INSERT INTO lms.schema_migrations (version) VALUES ('002_learning');
