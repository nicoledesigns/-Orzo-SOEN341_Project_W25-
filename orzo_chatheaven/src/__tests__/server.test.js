const app = require("../server2");

describe("ChatHaven API", () => {
    test("Signup should return an error if fields are missing", async () => {
        const req = { body: {} }; // Simulating an empty request
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await app._router.stack.find(r => r.route?.path === "/signup").route.stack[0].handle(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "All fields are required!" });
    });

    test("Login should return an error for missing email/password", async () => {
        const req = { body: { email: "", password: "" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await app._router.stack.find(r => r.route?.path === "/login").route.stack[0].handle(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email and password are required!" });
    });

    test("Adding a channel should fail if name is missing", async () => {
        const req = { body: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await app._router.stack.find(r => r.route?.path === "/addChannel").route.stack[0].handle(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Channel name is required!" });
    });
});
