import {
  Atom,
  Sigma,
  FlaskConical,
  Code2,
  Dna,
  BookOpen,
} from "lucide-react";

const subjectIconMap = {
  physics: Atom,
  mathematics: Sigma,
  chemistry: FlaskConical,
  "computer-science": Code2,
  biology: Dna,
};

// Make simpler
function normalize(name = "") {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

// Custom subjects the user types in fall back to BookOpen
export function getSubjectIcon(name) {
  return subjectIconMap[normalize(name)] ?? BookOpen;
}