import { db } from "../db";
import { inbdeFoundationKnowledge, inbdeClinicalContent } from "@shared/schema";
import { INBDE_FOUNDATION_KNOWLEDGE, INBDE_CLINICAL_CONTENT } from "../data/inbde-standards";

async function seedINBDEStandards() {
  console.log("🌱 Starting INBDE standards seeding...");
  
  try {
    // Seed Foundation Knowledge areas
    console.log("📚 Seeding Foundation Knowledge areas...");
    for (const fk of INBDE_FOUNDATION_KNOWLEDGE) {
      await db.insert(inbdeFoundationKnowledge).values({
        fkNumber: fk.fkNumber,
        name: fk.name,
        description: fk.description,
        isActive: true
      }).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${INBDE_FOUNDATION_KNOWLEDGE.length} Foundation Knowledge areas`);

    // Seed Clinical Content areas
    console.log("🏥 Seeding Clinical Content areas...");
    for (const cc of INBDE_CLINICAL_CONTENT) {
      await db.insert(inbdeClinicalContent).values({
        ccNumber: cc.ccNumber,
        name: cc.name,
        description: cc.description,
        category: cc.category,
        isActive: true
      }).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${INBDE_CLINICAL_CONTENT.length} Clinical Content areas`);

    console.log("🎉 INBDE standards seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding INBDE standards:", error);
    throw error;
  }
}

// Run the seeding function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedINBDEStandards()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedINBDEStandards };