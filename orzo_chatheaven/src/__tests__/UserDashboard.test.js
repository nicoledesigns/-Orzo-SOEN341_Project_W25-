import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UserDashboard from "../components/UserDashboard/UserDashboard";
import { MemoryRouter } from "react-router-dom";

test("renders UserDashboard correctly", () => {
    render(
        <MemoryRouter>
            <UserDashboard />
        </MemoryRouter>
    );

    expect(screen.getByText("ChatHaven")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
});

test("shows 'No channels available' when there are no channels", () => {
    render(
        <MemoryRouter>
            <UserDashboard />
        </MemoryRouter>
    );

    expect(screen.getByText("No channels available")).toBeInTheDocument();
});

test("logout button works", () => {
    window.sessionStorage.clear = jest.fn(); // Mock sessionStorage clear
    window.alert = jest.fn(); // Mock window alert

    render(
        <MemoryRouter>
            <UserDashboard />
        </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Logout"));
    expect(window.sessionStorage.clear).toHaveBeenCalled(); // Check session storage was cleared
});

test("selecting a channel updates UI", () => {
    const channels = [
        { id: 1, name: "General" },
        { id: 2, name: "Tech" },
    ];

    render(
        <MemoryRouter>
            <UserDashboard />
        </MemoryRouter>
    );

    const channel = screen.getByText("#General");
    fireEvent.click(channel);

    expect(channel).toHaveClass("active"); // Ensures the selected channel is marked as active
});
