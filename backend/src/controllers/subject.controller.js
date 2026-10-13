// import {
//   getUserSubjects,
//   getCatalog,
//   addUserSubject,
// } from "../services/subject.service.js";

// export async function getSubjects(req, res) {
//   try {
//     const subjects = await getUserSubjects(req.supabase, req.user.id);
//     return res.json({ subjects });
//   } catch (error) {
//     console.error("Failed to get subjects:", error);
//     return res.status(500).json({
//       error: error.message || "Failed to load subjects.",
//       code: error.code,
//     });
//   }
// }

// export async function getSubjectCatalog(req, res) {
//   try {
//     const catalog = await getCatalog(req.supabase);
//     return res.json({ catalog });
//   } catch (error) {
//     console.error("Failed to get catalog:", error);
//     return res.status(500).json({
//       error: error.message || "Failed to load subject catalog.",
//       code: error.code,
//     });
//   }
// }

// export async function createSubject(req, res) {
//   try {
//     const subject = await addUserSubject(req.supabase, req.user.id, req.body);
//     return res.status(201).json({ subject });
//   } catch (error) {
//     if (error?.name === "ZodError") {
//       return res.status(400).json({ error: error.issues[0]?.message || "Invalid subject data." });
//     }
//     console.error("Failed to create subject:", error);
//     return res.status(400).json({
//       error: error.message || "Failed to create subject.",
//       code: error.code,
//     });
//   }
// }
