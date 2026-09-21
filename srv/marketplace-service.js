import cds from "@sap/cds";

export default cds.service.impl(async function () {
  const { LearningArticles } = this.entities;
  const { Users } = cds.entities("smartfarm.marketplace");

  async function requireAdmin(req) {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return req.reject(401, "Missing user identity.");
    }

    const user = await SELECT.one.from(Users).where({ ID: userId });

    if (!user) {
      return req.reject(401, "User not found.");
    }

    if (user.role !== "admin") {
      return req.reject(403, "Only admins can manage learning articles.");
    }
  }

  this.before(["CREATE", "UPDATE", "DELETE"], LearningArticles, async (req) => {
    await requireAdmin(req);
  });
});