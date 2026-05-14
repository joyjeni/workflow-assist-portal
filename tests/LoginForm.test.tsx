import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/forms/LoginForm";

describe("LoginForm", () => {
  it("shows validation errors when empty", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it("submits valid input", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, user: { id: "u1", role: "CITIZEN" } }),
    });
    (global as unknown as { fetch: unknown }).fetch = fetchMock;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });
    render(<LoginForm redirectTo="/dashboard" />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "Demo@1234");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" })
    );
  });
});
