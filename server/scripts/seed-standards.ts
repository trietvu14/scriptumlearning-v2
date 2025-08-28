import { db } from "../db";
import { 
  standardsFrameworks, 
  standardsSubjects, 
  standardsTopics, 
  standardsSubtopics 
} from "../../shared/schema";
import { seedOfficialStandards } from "../data/official-standards";

async function main() {
  console.log("Starting official standards seeding...");
  
  try {
    await seedOfficialStandards(db, standardsFrameworks, standardsSubjects, standardsTopics, standardsSubtopics);
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();