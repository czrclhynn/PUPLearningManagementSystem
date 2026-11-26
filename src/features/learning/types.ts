export type RecordStatus = "Active" | "Inactive";

export type LearningCourse = {
  id: string;
  course_code: string;
  course_name: string;
  instructor_name: string;
  description: string;
  status: RecordStatus;
};

export type Activity = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string | null;
  max_points: number;
  material_url: string | null;
  created_at: string;
  status: RecordStatus;
};

export type Submission = {
  submission_id: string | null;
  submission_content: string | null;
  submitted_at: string | null;
  submission_status: "Submitted" | "Returned" | "Graded" | null;
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
};

export type StudentActivity = Activity & Submission;
export type StudentLearning = { courses: LearningCourse[]; activities: StudentActivity[] };
export type InstructorCourse = LearningCourse & {
  enrolled: number;
  activity_count: number;
  review_count: number;
};
export type StaffSubmission = Submission & {
  activity_id: string;
  student_id: string;
  graded_by: string | null;
};
export type StaffCourse = {
  course: LearningCourse;
  roster: {
    student_id: string;
    student_name: string;
    enrollment_date: string;
    status: RecordStatus;
    student_status: RecordStatus;
  }[];
  activities: Activity[];
  submissions: StaffSubmission[];
};
