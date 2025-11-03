import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "", // allow empty doc at creation
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["edit", "view"], // basic ACL for later
          default: "edit",
        },
      },
    ],
    versionHistory: [
      {
        content: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastEdited: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", DocumentSchema);
