import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import { MemoryRouter } from "react-router-dom";

test("renders AdminDashboard correctly", () => {
    render(
        <MemoryRouter>
            <AdminDashboard />
        </MemoryRouter>
    );

    expect(screen.getByText("ChatHaven")).toBeInTheDocument();
});

test("Clicking 'Add' without entering a channel name shows alert", () => {
    window.alert = jest.fn(); // Mock window alert
    render(
        <MemoryRouter>
            <AdminDashboard />
        </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Add"));
    expect(window.alert).toHaveBeenCalledWith("Channel name cannot be empty!");
});
