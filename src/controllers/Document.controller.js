import { Document } from "../models/Document.mode.js";
import { User } from "../models/User.model.js";

export const getAllDocs = async(req,res)=>{
  try {
    const Id =  req.params.id;

      if (!Id) {
      return res.status(400).json({ error: "User ID is required" });
    }

      const documents = await Document.find({
      $or: [
        { owner: Id },
        { "collaborators.user": Id }
      ],
    })
      .populate("owner", "name email")
      .populate("collaborators.user", "name email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ message: "Documents fetched successfully", documents });
       
  } catch (error) {
     return res.status(500).json({ error: error.message });
  }
}

export const  getSingleDoc = async(req,res)=>{
  try {
    const docsId =  req.params.id;
    if (!docsId) {
      return res.status(400).json({ error: "Document ID is required" });
    }
    const docs = await Document.findById(docsId);
    
     if (!docs) return res.status(404).json({ error: "Document not found" });
     return res.status(200).json({ message: "Documents fetched successfully", docs });
  } catch (error) {
     return res.status(500).json({ error: error.message });
  }
}

// ✅ Create new document
export const createDocs = async (req, res) => {
  try {
    const { id, title } = req.body;

    if (!id || !title)
      return res.status(400).json({ error: "All fields are necessary" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const docs = await Document.create({
      title,
      owner: id,
      content: "",
      collaborators: [],
    });

    return res.status(201).json({ message: "Document created", docs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ✅ Delete a document
export const deleteDocs = async (req, res) => {
  try {
    const { owner } = req.body;
    const id = req.params.id;

    const docs = await Document.findById(id);
    if (!docs) return res.status(404).json({ error: "Document not found" });

    // docs.owner is an ObjectId, so use equals()
    if (!docs.owner.equals(owner))
      return res.status(403).json({ error: "Unauthorized to delete" });

    await Document.findByIdAndDelete(id);
    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ✅ Update document content (with version snapshot)
export const updateDocs = async (req, res) => {
  try {
    const { content } = req.body;
    const docs = await Document.findById(req.params.id);
    if (!docs) return res.status(404).json({ error: "Not found" });

    // Push current content to history before updating
    docs.versionHistory.push({ content: docs.content });
    docs.content = content;
    docs.lastEdited = Date.now();

    await docs.save();
    return res.status(200).json({ message: "Document updated", docs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ✅ Restore a specific version
export const restoreVersion = async (req, res) => {
  try {
    const {id,versionIndex} = req.params;
    // const versionIndex = req.body;
    const docs = await Document.findById(id);
    if (!docs) return res.status(404).json({ error: "Not found" });

    if (!docs.versionHistory[versionIndex])
      return res.status(404).json({ error: "Version not found" });

    // Save current version before restoring
    docs.versionHistory.push({ content: docs.content });
    docs.content = docs.versionHistory[versionIndex].content;

    await docs.save();
    return res.status(200).json({ message: "Version restored", docs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ✅ Add collaborators
export const addCollaborators = async (req, res) => {
  try {
    const { collaborators } = req.body; // array of { user, permission }
    const { id } = req.params;

    const docs = await Document.findById(id);
    if (!docs) return res.status(404).json({ error: "Not found" });

    if (!Array.isArray(collaborators))
      return res.status(400).json({ error: "Collaborators must be an array" });

    for (const collab of collaborators) {
      docs.collaborators.push(collab);
    }

    await docs.save();
    return res.status(200).json({ message: "Collaborators added", docs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ✅ Update collaborator permission
export const givePermission = async (req, res) => {
  try {
    const { id } = req.params; // document id
    const { userId, permission } = req.body;

    const docs = await Document.findById(id);
    if (!docs) return res.status(404).json({ error: "Not found" });

    const collaborator = docs.collaborators.find((c) =>
      c.user.equals(userId)
    );
    if (!collaborator)
      return res.status(404).json({ error: "Collaborator not found" });

    collaborator.permission = permission;
    await docs.save();

    return res.status(200).json({ message: "Permission updated", docs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const leaveDocs = async (req, res) => {
  try {
    const { id, docsId } = req.body;

    // Validate input
    if (!id || !docsId) {
      return res.status(400).json({ error: "User ID and Document ID are required" });
    }

    const docs = await Document.findById(docsId);
    if (!docs) return res.status(404).json({ error: "Document not found" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent owner from leaving their own document
    if (docs.owner.equals(user._id)) {
      return res.status(403).json({ error: "Owner cannot leave their own document" });
    }

    // Remove user from collaborators array
    docs.collaborators = docs.collaborators.filter(
      (collab) => !collab.user.equals(user._id)
    );

    await docs.save();

    return res.status(200).json({ message: "Left the document successfully" });
  } catch (error) {
    console.error("leaveDocs error:", error);
    return res.status(500).json({ error: error.message });
  }
};
