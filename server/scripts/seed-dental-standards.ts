import { db } from "../db";
import { 
  standards, 
  standardObjectives,
  standardsFrameworks
} from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { INBDE_FOUNDATION_KNOWLEDGE, INBDE_CLINICAL_CONTENT } from "../data/inbde-standards";

const TENANT_ID = '32e0cea0-abd5-4456-9f78-99e1ca076437'; // KU Dental tenant

// Curriculum Template objectives based on KU School of Dentistry structure
const CURRICULUM_TEMPLATE_OBJECTIVES = [
  {
    title: "Biochemistry and Molecular Biology",
    description: "Understanding of carbohydrate, protein, and lipid metabolism in oral tissues",
    code: "CURR-001"
  },
  {
    title: "Tissue Biology and Development",
    description: "Knowledge of collagen synthesis, wound healing, and tissue repair mechanisms",
    code: "CURR-002"
  },
  {
    title: "Oral and Maxillofacial Anatomy",
    description: "Comprehensive understanding of TMJ anatomy, function, and related structures",
    code: "CURR-003"
  },
  {
    title: "Neuroanatomy and Physiology",
    description: "Trigeminal nerve distribution, innervation patterns, and sensory mechanisms",
    code: "CURR-004"
  },
  {
    title: "Salivary Gland Function",
    description: "Understanding salivary composition, secretion mechanisms, and diagnostic applications",
    code: "CURR-005"
  },
  {
    title: "Tooth Development and Eruption",
    description: "Comprehensive knowledge of odontogenesis, eruption patterns, and developmental anomalies",
    code: "CURR-006"
  },
  {
    title: "Periodontal Health and Disease",
    description: "Classification, diagnosis, and treatment of periodontal conditions",
    code: "CURR-007"
  },
  {
    title: "Endodontic Diagnosis and Treatment",
    description: "Pulpal diagnosis methods, treatment planning, and therapeutic procedures",
    code: "CURR-008"
  },
  {
    title: "Oral Surgery Principles",
    description: "Extraction techniques, surgical principles, and complication management",
    code: "CURR-009"
  },
  {
    title: "Restorative Dentistry",
    description: "Direct and indirect restorations, material science, and clinical techniques",
    code: "CURR-010"
  },
  {
    title: "Prosthodontics",
    description: "Complete and partial dentures, fixed prosthodontics, and occlusion",
    code: "CURR-011"
  },
  {
    title: "Orthodontics",
    description: "Growth and development, malocclusion diagnosis, and treatment planning",
    code: "CURR-012"
  }
];

// CODA Standards objectives
const CODA_OBJECTIVES = [
  {
    title: "Patient Care Competency",
    description: "Provide patient care that is compassionate, appropriate, and effective",
    code: "CODA-001"
  },
  {
    title: "Biomedical Knowledge",
    description: "Demonstrate knowledge of established and evolving biomedical sciences",
    code: "CODA-002"
  },
  {
    title: "Practice-Based Learning",
    description: "Demonstrate ability to investigate and evaluate patient care practices",
    code: "CODA-003"
  },
  {
    title: "Interpersonal Communication",
    description: "Demonstrate interpersonal and communication skills for effective patient care",
    code: "CODA-004"
  },
  {
    title: "Professionalism",
    description: "Demonstrate commitment to professional responsibilities and ethical principles",
    code: "CODA-005"
  },
  {
    title: "Systems-Based Practice",
    description: "Demonstrate awareness of healthcare systems and cost-effective practice",
    code: "CODA-006"
  },
  {
    title: "Critical Thinking",
    description: "Use critical thinking and evidence-based decision making in patient care",
    code: "CODA-007"
  },
  {
    title: "Life-Long Learning",
    description: "Demonstrate commitment to continuous learning and professional development",
    code: "CODA-008"
  }
];

async function seedDentalStandards() {
  console.log("🦷 Starting Dental Standards seeding...");
  
  try {
    // Get the three dental frameworks
    const frameworks = await db
      .select()
      .from(standardsFrameworks)
      .where(and(
        eq(standardsFrameworks.educationalArea, 'dental_school'),
        eq(standardsFrameworks.isActive, true)
      ));

    if (frameworks.length !== 3) {
      throw new Error(`Expected 3 dental frameworks, found ${frameworks.length}`);
    }

    const curriculumFramework = frameworks.find(f => f.name.includes('Curriculum'));
    const inbdeFramework = frameworks.find(f => f.name.includes('INBDE'));
    const codaFramework = frameworks.find(f => f.name.includes('CODA'));

    if (!curriculumFramework || !inbdeFramework || !codaFramework) {
      throw new Error('Missing required dental frameworks');
    }

    console.log(`📚 Found frameworks:
    - ${curriculumFramework.name}
    - ${inbdeFramework.name}
    - ${codaFramework.name}`);

    // Create Curriculum Template Standard and Objectives
    console.log("🏫 Creating Curriculum Template standards...");
    const [curriculumStandard] = await db.insert(standards).values({
      tenantId: TENANT_ID,
      name: "KU School of Dentistry Curriculum Template",
      type: 'internal',
      description: "Core curriculum standards for dental education at KU School of Dentistry",
      version: "2025",
      isActive: true
    }).onConflictDoNothing().returning();

    if (curriculumStandard) {
      for (const obj of CURRICULUM_TEMPLATE_OBJECTIVES) {
        await db.insert(standardObjectives).values({
          standardId: curriculumStandard.id,
          title: obj.title,
          description: obj.description,
          code: obj.code
        }).onConflictDoNothing();
      }
      console.log(`✅ Created ${CURRICULUM_TEMPLATE_OBJECTIVES.length} Curriculum Template objectives`);
    }

    // Create INBDE Standard and Objectives
    console.log("📋 Creating INBDE standards...");
    const [inbdeStandard] = await db.insert(standards).values({
      tenantId: TENANT_ID,
      name: "INBDE Standards",
      type: 'inbde',
      description: "Integrated National Board Dental Examinations standards",
      version: "2025",
      isActive: true
    }).onConflictDoNothing().returning();

    if (inbdeStandard) {
      // Add Foundation Knowledge objectives
      for (const fk of INBDE_FOUNDATION_KNOWLEDGE) {
        await db.insert(standardObjectives).values({
          standardId: inbdeStandard.id,
          title: fk.name,
          description: fk.description,
          code: `FK-${fk.fkNumber}`
        }).onConflictDoNothing();
      }

      // Add key Clinical Content objectives (first 8 for demo)
      for (let i = 0; i < Math.min(8, INBDE_CLINICAL_CONTENT.length); i++) {
        const cc = INBDE_CLINICAL_CONTENT[i];
        await db.insert(standardObjectives).values({
          standardId: inbdeStandard.id,
          title: cc.name,
          description: cc.description,
          code: `CC-${cc.ccNumber}`
        }).onConflictDoNothing();
      }
      
      const totalINBDEObjectives = INBDE_FOUNDATION_KNOWLEDGE.length + 8;
      console.log(`✅ Created ${totalINBDEObjectives} INBDE objectives`);
    }

    // Create CODA Standard and Objectives
    console.log("🏛️ Creating CODA standards...");
    const [codaStandard] = await db.insert(standards).values({
      tenantId: TENANT_ID,
      name: "CODA Standards",
      type: 'coda',
      description: "Commission on Dental Accreditation standards for dental education",
      version: "2025",
      isActive: true
    }).onConflictDoNothing().returning();

    if (codaStandard) {
      for (const obj of CODA_OBJECTIVES) {
        await db.insert(standardObjectives).values({
          standardId: codaStandard.id,
          title: obj.title,
          description: obj.description,
          code: obj.code
        }).onConflictDoNothing();
      }
      console.log(`✅ Created ${CODA_OBJECTIVES.length} CODA objectives`);
    }

    console.log("🎉 Dental standards seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding dental standards:", error);
    throw error;
  }
}

// Run the seeding function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDentalStandards()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDentalStandards };