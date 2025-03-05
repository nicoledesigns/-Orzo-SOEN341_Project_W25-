import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders LoginSignup page by default", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  // Check if the default LoginSignup component renders
  expect(screen.getByText("Sign Up")).toBeInTheDocument();
});
