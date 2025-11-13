import express from "express";
import {
  createDocs,
  deleteDocs,
  updateDocs,
  restoreVersion,
  addCollaborators,
  givePermission,
  getAllDocs,
  getSingleDoc,
  leaveDocs,
  getAllCollabs
} from "../controllers/Document.controller.js";

const Docsrouter = express.Router();
Docsrouter.get("/:id",getAllDocs);
Docsrouter.get("/single/:id",getSingleDoc);
Docsrouter.post("/", createDocs);
Docsrouter.put("/:id", updateDocs);
Docsrouter.delete("/:id", deleteDocs);
Docsrouter.put("/:id/restore/:versionIndex", restoreVersion);
Docsrouter.post("/:id/collaborators", addCollaborators);
Docsrouter.put("/:id/permission", givePermission);
Docsrouter.put("/leave",leaveDocs);
Docsrouter.get("/collabs/:id",getAllCollabs);

export default Docsrouter;
