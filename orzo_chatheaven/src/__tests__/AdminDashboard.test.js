import React from "react";
import renderer from "react-test-renderer";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";

// Mock sessionStorage
beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => "Admin");
});

// Mock fetch API responses
global.fetch = jest.fn((url) =>
  Promise.resolve({
    json: () =>
      Promise.resolve(
        url.includes("/getChannels")
          ? { channels: [{ id: 1, name: "General" }, { id: 2, name: "Tech" }] }
          : url.includes("/getUsers")
          ? { users: [{ id: 1, name: "User1" }, { id: 2, name: "User2" }] }
          : {}
      ),
  })
);

describe("AdminDashboard Snapshot Tests", () => {
  test("AdminDashboard renders correctly with no channels", () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve({ channels: [] }) })
    );

    const tree = renderer
      .create(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("AdminDashboard renders correctly with channels and users", async () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("AdminDashboard renders correctly when a channel is selected", () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            channels: [{ id: 1, name: "General", members: ["Admin", "User1"] }],
          }),
      })
    );

    const tree = renderer
      .create(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("AdminDashboard renders correctly when a new channel is added", () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            channels: [
              { id: 1, name: "General" },
              { id: 2, name: "NewChannel" },
            ],
          }),
      })
    );

    const tree = renderer
      .create(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("AdminDashboard renders correctly when users are added to a channel", () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            channels: [{ id: 1, name: "General", members: ["Admin", "User1"] }],
          }),
      })
    );

    const tree = renderer
      .create(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
