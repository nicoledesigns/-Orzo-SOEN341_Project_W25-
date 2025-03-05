import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginSignup from "../components/LoginSignup/LoginSignup";
import { MemoryRouter } from "react-router-dom";

test("renders login form", () => {
    render(
        <MemoryRouter>
            <LoginSignup />
        </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("E-mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});

test("Shows error if invalid email format", () => {
    render(
        <MemoryRouter>
            <LoginSignup />
        </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText("E-mail");
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });

    expect(screen.getByText("Invalid email format")).toBeInTheDocument();
});
