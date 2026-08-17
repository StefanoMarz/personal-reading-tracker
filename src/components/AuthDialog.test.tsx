import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthDialog } from "./AuthDialog";

describe("AuthDialog", () => {
  it("collects first and last name when creating an account", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSignUp = vi.fn().mockResolvedValue({
      error: null,
      requiresEmailConfirmation: false,
    });

    render(
      <AuthDialog
        onClose={onClose}
        onSignIn={vi.fn().mockResolvedValue(null)}
        onSignUp={onSignUp}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create account",
        pressed: false,
      })
    );
    await user.type(screen.getByLabelText("First name"), "Stefano");
    await user.type(screen.getByLabelText("Last name"), "Example");
    await user.type(screen.getByLabelText("Email"), "stefano@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(
      screen.getByLabelText("Confirm password"),
      "password123"
    );

    const submitButton = document.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    );
    expect(submitButton).not.toBeNull();
    await user.click(submitButton!);

    await waitFor(() =>
      expect(onSignUp).toHaveBeenCalledWith(
        "Stefano",
        "Example",
        "stefano@example.com",
        "password123"
      )
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("lets the visitor continue as a guest", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AuthDialog
        onClose={onClose}
        onSignIn={vi.fn().mockResolvedValue(null)}
        onSignUp={vi.fn()}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Continue as guest" })
    );

    expect(onClose).toHaveBeenCalledOnce();
  });
});
