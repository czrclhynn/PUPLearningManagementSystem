import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CoursesPage } from "./CoursesPage";

describe("course discovery", () => {
  it("filters courses by title and opens the selected result", async () => {
    const user = userEvent.setup();
    const openCourse = vi.fn();
    render(
      <CoursesPage
        openCourse={openCourse}
        learning={{
          courses: [
            {
              id: "database",
              course_code: "COMP 018",
              course_name: "Database Administration",
              instructor_name: "Mia Santos",
              description: "",
              status: "Active",
            },
            {
              id: "science",
              course_code: "COMP 034",
              course_name: "Introduction to Data Science",
              instructor_name: "Carlo Inovero",
              description: "",
              status: "Active",
            },
          ],
          activities: [],
        }}
      />,
    );

    await user.type(screen.getByPlaceholderText("Search by course or code..."), "Database");
    expect(screen.getByRole("heading", { name: "Database Administration" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Introduction to Data Science" })).toBeNull();

    await user.click(screen.getByRole("button", { name: /view course/i }));
    expect(openCourse).toHaveBeenCalledExactlyOnceWith("database");
  });
});
