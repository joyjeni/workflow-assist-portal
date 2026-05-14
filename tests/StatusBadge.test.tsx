import { render, screen } from "@testing-library/react";
import { StatusBadge, RiskBadge } from "@/components/StatusBadge";

describe("StatusBadge", () => {
  it("renders a known status with a human label", () => {
    render(<StatusBadge status="UNDER_REVIEW" />);
    expect(screen.getByText(/Under Review/i)).toBeInTheDocument();
  });
  it("renders unknown statuses safely", () => {
    render(<StatusBadge status="UNKNOWN" />);
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
  });
});

describe("RiskBadge", () => {
  it("shows dash when level is null", () => {
    const { container } = render(<RiskBadge level={null} />);
    expect(container.textContent).toContain("—");
  });
  it("renders the level when provided", () => {
    render(<RiskBadge level="HIGH" />);
    expect(screen.getByText(/HIGH RISK/i)).toBeInTheDocument();
  });
});
