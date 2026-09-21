import cds from "@sap/cds";

const { SELECT } = cds.ql;

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

  // Learning articles -> admin only
  this.before(["CREATE", "UPDATE", "DELETE"], LearningArticles, async (req) => {
    const email = getRequestEmail(req);

    if (!email) {
      return req.reject(403, "Unauthorized: missing user email");
    }

    const currentUser = await SELECT.one.from(Users).where({ email });

    if (!currentUser || currentUser.role !== "admin") {
      return req.reject(403, "Only admins can manage learning articles");
    }
  });

  // Users UPDATE
  this.before("UPDATE", Users, async (req) => {
    const email = getRequestEmail(req);

    console.log("UPDATE Users -> x-user-email:", req.headers?.["x-user-email"]);
    console.log("UPDATE Users -> resolved email:", email);
    console.log("UPDATE Users -> req.data:", req.data);
    console.log("UPDATE Users -> req.params:", req.params);

    if (!email) {
      return req.reject(403, "Unauthorized: missing user email");
    }

    const currentUser = await SELECT.one.from(Users).where({ email });

    console.log("UPDATE Users -> currentUser:", currentUser);

    if (!currentUser) {
      return req.reject(403, "Unauthorized: user not found");
    }

    // owner can update anyone
    if (currentUser.role === "owner") {
      return;
    }

    const targetUserId = getTargetUserId(req);

    if (!targetUserId) {
      return req.reject(400, "Missing target user ID");
    }

    const targetUser = await SELECT.one.from(Users).where({ ID: targetUserId });

    console.log("UPDATE Users -> targetUser:", targetUser);

    if (!targetUser) {
      return req.reject(404, "User not found");
    }

    // normal user can update only own profile
    if (targetUser.email !== email) {
      return req.reject(403, "You can only update your own profile");
    }

    // normal user cannot change protected fields
    if ("role" in req.data || "isActive" in req.data) {
      return req.reject(403, "You cannot update protected fields");
    }
  });

  // Users DELETE -> owner only
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