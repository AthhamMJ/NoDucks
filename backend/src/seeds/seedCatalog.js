//one-off script that fills the database
import "dotenv/config";
import mongoose from "mongoose";
import SubjectCatalog from "../models/SubjectCatalog.js";

const subjects = [
  { name: "Physics", defaultColor: "#10B981" },
  { name: "Mathematics", defaultColor: "#F59E0B" },
  { name: "Chemistry", defaultColor: "#EC4899" },
  { name: "Programming", defaultColor: "#8B5CF6" },
  { name: "History", defaultColor: "#3B82F6" },
  { name: "English", defaultColor: "#22C55E" },
  { name: "Biology", defaultColor: "#EAB308" },
];

await mongoose.connect(process.env.MONGODB_URI);

for (const subject of subjects) {
    await SubjectCatalog.updateOne(
        {name: subject.name},
        {$set: subject},
        {upsert: true},
    )
}

console.log("Subject catalog seeded")
await mongoose.disconnect();