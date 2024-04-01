import bodyParser from "body-parser";
import express from "express";
import cors from "cors";

import { createWriteStream } from "node:fs";
const output = createWriteStream("output.ndjson");

import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 1000, // 1 sec
  max: 20, // Limit each IP to 30 requests per `window` (here, per second)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();
app.use(bodyParser.json());
app.use(limiter);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const PORT = 8040;
const admins = [];
const users = [];

app.get("/api/balance", async (req, res) => {
  console.log("BALANCE >>> ", new Date().toISOString());
  return res.send({
    data: 10,
  });
});

app.post("/api/login", async (req, res) => {
  const { email } = req.body;

  const loggedAdmin = admins.find(
    (admin) => admin.email == email
  );

  console.log("LOGIN >>> ", new Date().toISOString(), req.body, loggedAdmin);

  if (!loggedAdmin) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  return res.send({
    user: loggedAdmin,
    access_token: "fake_token",
    hidden_menu: [],
  });
});

app.post("/api/logout", async (req, res) => {
  console.log("LOGOUT >>> ", new Date().toISOString());

  return res.send({
    message: "Logged out successfully",
  });
});

app.post("/api/users", async (req, res) => {
  const newUser = {
    ...req.body,
    id: users.length + 1,
    created_at: new Date().toISOString(),
  };
  console.log("REGISTER USER >>> ", newUser);

  users.push(newUser);

  return res.send(newUser);
});

app.put("/api/users/:id", async (req, res) => {
  const userIndex = users.findIndex((user) => user.id == req.params.id);
  if (userIndex === -1) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  users[userIndex] = {
    ...users[userIndex],
    ...req.body,
  };

  console.log("UPDATE USER >>> ", users[userIndex]);
  return res.send(users[userIndex]);
});

app.delete("/api/users/:id", async (req, res) => {
  const userIndex = users.findIndex((user) => user.id == req.params.id);
  console.log("🚀 ~ app.delete ~ userIndex:", userIndex, req.params.id, users)

  if (userIndex === -1) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  users.splice(userIndex, 1);

  console.log("DELETE USER >>> ", req.params.id);
  return res.send({
    message: `User ${req.params.id} deleted successfully`,
  });
});

app.post("/api/register/admin", async (req, res) => {
  const newAdmin = {
    ...req.body,
    id: admins.length + 1,
    created_at: new Date().toISOString(),
  };

  admins.push(newAdmin);

  console.log("REGISTER ADMIN >>> ", newAdmin);

  return res.send(newAdmin);
});

app.get("/api/users", async (req, res) => {
  console.log("GET USERS >>> ", new Date().toISOString());
  return res.send({
    data: users,
  });
});

app.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
});
