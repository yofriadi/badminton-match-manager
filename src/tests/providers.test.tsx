import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Providers } from "@/components/providers";

describe("Providers", () => {
  it("renders children", () => {
    render(
      <Providers>
        <div>match-manager</div>
      </Providers>,
    );

    expect(screen.getByText("match-manager")).toBeInTheDocument();
  });
});
