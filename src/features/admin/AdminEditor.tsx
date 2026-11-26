import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { api, ApiError, errorMessage } from "../../app/api";
import type { AdminData, Editor, Status } from "./types";

export function AdminEditor({
  editor,
  data,
  onClose,
  onSaved,
  onSessionExpired,
}: {
  editor: Editor;
  data: AdminData;
  onClose: () => void;
  onSaved: (message: string) => void;
  onSessionExpired: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const modal = dialog.current;
    modal?.showModal();
    return () => modal?.close();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const fields = Object.fromEntries(values);
    const previous =
      editor.kind === "account"
        ? editor.account
        : editor.kind === "course"
          ? editor.course
          : undefined;
    if (previous?.status === "Active" && fields.status === "Inactive") {
      const label = editor.kind === "account" ? "this account" : "this course";
      if (!window.confirm(`Deactivate ${label}? Related academic records will be preserved.`))
        return;
    }
    setSaving(true);
    setError("");
    try {
      switch (editor.kind) {
        case "account": {
          if (!fields.password) delete fields.password;
          await api(`/admin/accounts${editor.account ? `/${editor.account.id}` : ""}`, {
            method: editor.account ? "PUT" : "POST",
            body: fields,
          });
          onSaved(editor.account ? "Account updated." : "Account created.");
          break;
        }
        case "course":
          await api(`/admin/courses${editor.course ? `/${editor.course.id}` : ""}`, {
            method: editor.course ? "PUT" : "POST",
            body: fields,
          });
          onSaved(editor.course ? "Course updated." : "Course created.");
          break;
        case "enrollment":
          await api("/admin/enrollments", { method: "POST", body: fields });
          onSaved("Student enrolled.");
          break;
        case "enrollmentStatus": {
          const status = editor.enrollment.status === "Active" ? "Inactive" : "Active";
          await api(`/admin/enrollments/${editor.enrollment.id}`, {
            method: "PATCH",
            body: { status },
          });
          onSaved(status === "Active" ? "Enrollment reactivated." : "Enrollment deactivated.");
          break;
        }
      }
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) onSessionExpired();
      else setError(errorMessage(failure));
    } finally {
      setSaving(false);
    }
  }

  let title: string;
  let fields: ReactNode;
  let action = "Save";
  if (editor.kind === "account") {
    const { account } = editor;
    title = account ? "Edit account" : "Add account";
    fields = (
      <>
        <label>
          Name
          <input name="name" required maxLength={120} defaultValue={account?.name} />
        </label>
        <label>
          Email
          <input name="email" type="email" required maxLength={254} defaultValue={account?.email} />
        </label>
        {!account && (
          <label>
            Role
            <select name="role" aria-label="Role">
              <option>Student</option>
              <option>Instructor</option>
            </select>
          </label>
        )}
        <label>
          {account ? "New password (optional)" : "Password"}
          <input
            name="password"
            type="password"
            required={!account}
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
          />
        </label>
        <StatusField status={account?.status} />
      </>
    );
  } else if (editor.kind === "course") {
    const { course } = editor;
    const choices = data.accounts.filter(
      (account) =>
        account.role === "Instructor" &&
        (account.status === "Active" || account.id === course?.instructor_id),
    );
    title = course ? "Edit course" : "Add course";
    fields = (
      <>
        <label>
          Course code
          <input name="course_code" required maxLength={32} defaultValue={course?.course_code} />
        </label>
        <label>
          Course name
          <input name="course_name" required maxLength={120} defaultValue={course?.course_name} />
        </label>
        <label>
          Description
          <textarea name="description" maxLength={4000} defaultValue={course?.description} />
        </label>
        <label>
          Instructor
          <select
            name="instructor_id"
            aria-label="Instructor"
            required
            defaultValue={course?.instructor_id ?? ""}
          >
            <option value="" disabled>
              Choose an instructor
            </option>
            {choices.map((account) => (
              <option value={account.id} key={account.id}>
                {account.name}
                {account.status === "Inactive" ? " (Inactive)" : ""}
              </option>
            ))}
          </select>
        </label>
        <StatusField status={course?.status} />
      </>
    );
  } else if (editor.kind === "enrollment") {
    title = "Enroll student";
    action = "Enroll";
    fields = (
      <>
        <label>
          Student
          <select name="student_id" aria-label="Student" required defaultValue={editor.studentId}>
            <option value="" disabled>
              Choose a student
            </option>
            {data.accounts
              .filter((account) => account.role === "Student" && account.status === "Active")
              .map((student) => (
                <option value={student.id} key={student.id}>
                  {student.name} · {student.email}
                </option>
              ))}
          </select>
        </label>
        <label>
          Course
          <select name="course_id" aria-label="Course" required defaultValue={editor.courseId}>
            <option value="" disabled>
              Choose a course
            </option>
            {data.courses
              .filter((course) => course.status === "Active")
              .map((course) => (
                <option value={course.id} key={course.id}>
                  {course.course_code} · {course.course_name}
                </option>
              ))}
          </select>
        </label>
      </>
    );
  } else {
    const { enrollment } = editor;
    action = enrollment.status === "Active" ? "Deactivate" : "Reactivate";
    title = `${action} enrollment`;
    fields = (
      <p>
        {action} the enrollment for {enrollment.student_name} in {enrollment.course_code}?
      </p>
    );
  }

  return (
    <dialog
      ref={dialog}
      className="admin-dialog card"
      aria-labelledby="admin-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <form className="compose-modal" onSubmit={submit}>
        <div className="section-head">
          <h2 id="admin-dialog-title">{title}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {fields}
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <div>
          <button type="button" className="btn secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn primary" disabled={saving}>
            {saving ? "Saving…" : action}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function StatusField({ status = "Active" }: { status?: Status }) {
  return (
    <label>
      Status
      <select name="status" aria-label="Status" defaultValue={status}>
        <option>Active</option>
        <option>Inactive</option>
      </select>
    </label>
  );
}
