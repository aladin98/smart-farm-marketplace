import cds from "@sap/cds";
import express from "express";
import cors from "cors";

const { SELECT } = cds.ql;

cds.on("bootstrap", (app) => {
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:4173",
        "https://port4173-workspaces-ws-c97u5.eu10.applicationstudio.cloud.sap",
        "https://port5173-workspaces-ws-c97u5.eu10.applicationstudio.cloud.sap",
      ],
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "x-user-email"],
      credentials: false,
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.get("/api/public/countries", async (_req, res) => {
    try {
      const db = await cds.connect.to("db");
      const countries = await db.run(
        SELECT.from("smartfarm.marketplace.Countries")
      );

      res.json(countries);
    } catch (error) {
      console.error("Failed to load public countries:", error);
      res.status(500).json({ error: "Failed to load countries" });
    }
  });

  app.get("/api/public/categories", async (_req, res) => {
    try {
      const db = await cds.connect.to("db");
      const categories = await db.run(
        SELECT.from("smartfarm.marketplace.Categories")
      );

      res.json(categories);
    } catch (error) {
      console.error("Failed to load public categories:", error);
      res.status(500).json({ error: "Failed to load categories" });
    }
  });

  app.get("/api/public/animal-types", async (_req, res) => {
    try {
      const db = await cds.connect.to("db");
      const animalTypes = await db.run(
        SELECT.from("smartfarm.marketplace.AnimalTypes")
      );

      res.json(animalTypes);
    } catch (error) {
      console.error("Failed to load public animal types:", error);
      res.status(500).json({ error: "Failed to load animal types" });
    }
  });

  app.get("/api/public/animal-variants", async (_req, res) => {
    try {
      const db = await cds.connect.to("db");
      const animalVariants = await db.run(
        SELECT.from("smartfarm.marketplace.AnimalVariants")
      );

      res.json(animalVariants);
    } catch (error) {
      console.error("Failed to load public animal variants:", error);
      res.status(500).json({ error: "Failed to load animal variants" });
    }
  });

  app.get("/api/public/learning-categories", async (_req, res) => {
    try {
      const db = await cds.connect.to("db");
      const learningCategories = await db.run(
        SELECT.from("smartfarm.marketplace.LearningCategories")
      );

      res.json(learningCategories);
    } catch (error) {
      console.error("Failed to load public learning categories:", error);
      res.status(500).json({ error: "Failed to load learning categories" });
    }
  });
});

export default cds.server;