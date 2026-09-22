import cds from "@sap/cds";
import express from "express";

cds.on("bootstrap", (app) => {
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
});

export default cds.server;