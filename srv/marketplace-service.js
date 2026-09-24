import cds from "@sap/cds";

const { SELECT, UPDATE } = cds.ql;

export default cds.service.impl(async function () {
  const { Users, LearningArticles } = this.entities;

  function getRequestEmail(req) {
    return (
      req.headers?.["x-user-email"] ||
      req.user?.id ||
      req.user?.attr?.email ||
      req.user?.attr?.mail
    );
  }

  function getTargetUserId(req) {
    return req.data?.ID || req.params?.[0]?.ID;
  }

  this.on("login", async (req) => {
    const email = req.data.email?.trim().toLowerCase();
    const password = req.data.password;

    if (!email || !password) {
      return req.reject(400, "Email and password are required");
    }

    const users = await SELECT.from(Users);
    const user = users.find(
      (u) => u.email?.trim().toLowerCase() === email
    );

    if (!user || user.passwordHash !== password) {
      return req.reject(401, "Invalid email or password");
    }

    return user;
  });

  this.on("resetPassword", async (req) => {
    const email = req.data.email?.trim().toLowerCase();
    const newPassword = req.data.newPassword;

    if (!email || !newPassword) {
      return req.reject(400, "Email and new password are required");
    }

    const users = await SELECT.from(Users);
    const user = users.find(
      (u) => u.email?.trim().toLowerCase() === email
    );

    if (!user) {
      return req.reject(404, "User not found");
    }

    await UPDATE(Users)
      .set({ passwordHash: newPassword })
      .where({ ID: user.ID });

    return "Password updated successfully";
  });

  this.on("me", async (req) => {
    const email = getRequestEmail(req);

    if (!email) {
      return req.reject(401, "Unauthorized");
    }

    const user = await SELECT.one.from(Users).where({ email });

    if (!user) {
      return req.reject(404, "User not found");
    }

    return user;
  });

  this.before("CREATE", Users, async (req) => {
    const email = req.data?.email;

    if (!email) {
      return req.reject(400, "Email is required");
    }

    const existingUser = await SELECT.one.from(Users).where({ email });

    if (existingUser) {
      return req.reject(409, "Email already exists");
    }
  });

  this.before(["CREATE", "UPDATE", "DELETE"], LearningArticles, async (req) => {
    const email = getRequestEmail(req);

    if (!email) {
      return req.reject(403, "Unauthorized: missing user email");
    }

    const currentUser = await SELECT.one.from(Users).where({ email });

    if (
      !currentUser ||
      (currentUser.role !== "admin" && currentUser.role !== "owner")
    ) {
      return req.reject(403, "Only admin or owner can manage learning articles");
    }
  });

  this.before("UPDATE", Users, async (req) => {
    const email = getRequestEmail(req);

    if (!email) {
      return req.reject(403, "Unauthorized: missing user email");
    }

    const currentUser = await SELECT.one.from(Users).where({ email });

    if (!currentUser) {
      return req.reject(403, "Unauthorized: user not found");
    }

    if (currentUser.role === "owner") {
      return;
    }

    const targetUserId = getTargetUserId(req);

    if (!targetUserId) {
      return req.reject(400, "Missing target user ID");
    }

    const targetUser = await SELECT.one.from(Users).where({ ID: targetUserId });

    if (!targetUser) {
      return req.reject(404, "User not found");
    }

    if (targetUser.email !== email) {
      return req.reject(403, "You can only update your own profile");
    }

    if ("role" in req.data || "isActive" in req.data) {
      return req.reject(403, "You cannot update protected fields");
    }
  });

  this.before("DELETE", Users, async (req) => {
    const email = getRequestEmail(req);

    if (!email) {
      return req.reject(403, "Unauthorized: missing user email");
    }

    const currentUser = await SELECT.one.from(Users).where({ email });

    if (!currentUser || currentUser.role !== "owner") {
      return req.reject(403, "Only the owner can delete users");
    }
  });
});