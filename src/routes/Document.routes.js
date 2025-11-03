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
  leaveDocs
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

export default Docsrouter;
