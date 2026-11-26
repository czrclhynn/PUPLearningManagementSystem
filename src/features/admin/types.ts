import type { Role } from "../../app/api";

export type Status = "Active" | "Inactive";

export type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  instructor_approval: "Approved" | "Pending" | "Rejected" | null;
};

export type Course = {
  id: string;
  course_code: string;
  course_name: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  instructor_status: Status;
  status: Status;
};

export type Enrollment = {
  id: string;
  student_id: string;
  student_name: string;
  student_status: Status;
  course_id: string;
  course_code: string;
  course_name: string;
  course_status: Status;
  enrollment_date: string;
  status: Status;
};

type Counter = "users" | "students" | "instructors" | "administrators" | "courses" | "enrollments";
export type AdminData = {
  stats: Record<Counter | `active_${Counter}`, number>;
  accounts: Account[];
  courses: Course[];
  enrollments: Enrollment[];
  signIns: { day: string; accounts: number }[];
  recent: { id: string; kind: string; label: string; status: Status; updated_at: string }[];
};

export type Editor =
  | { kind: "account"; account?: Account }
  | { kind: "course"; course?: Course }
  | { kind: "enrollment"; studentId: string; courseId: string }
  | { kind: "enrollmentStatus"; enrollment: Enrollment };
