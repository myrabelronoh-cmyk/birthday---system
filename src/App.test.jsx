import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./hooks/useAuth", () => ({
  useAuth: () => ({
    currentUser: { uid: "test-user", email: "test@example.com" },
    loading: false,
    authError: "",
    signOut: vi.fn(),
  }),
}));

describe("birthday management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds a birthday and keeps it after the dashboard reloads", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(await screen.findByRole("button", { name: "Add Birthday" }));
    await user.type(screen.getByLabelText("Name"), "Casey Example");
    fireEvent.change(screen.getByLabelText("Date of birth"), {
      target: { value: "2000-02-14" },
    });
    await user.type(screen.getByLabelText("Category"), "Friend");
    await user.click(screen.getByRole("button", { name: "Save Birthday" }));

    expect(await screen.findByText("Casey Example")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("birthday-reminder:test-user:birthdays")))
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Casey Example",
            category: "Friend",
            day: 14,
            month: 2,
            year: 2000,
          }),
        ])
      );

    unmount();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Casey Example")).toBeInTheDocument();
    });
  });
});
