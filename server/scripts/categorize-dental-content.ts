import { db } from "../db";
import { content, contentStandardMappings, standardObjectives, standards } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

const TENANT_ID = '32e0cea0-abd5-4456-9f78-99e1ca076437';

// Simple mapping rules for dental content to standards (deterministic fallback)
const CONTENT_MAPPING_RULES = {
  // Keywords that map to Curriculum Template standards
  curriculum: {
    'metabolism': ['Biochemistry and Molecular Biology'],
    'collagen': ['Tissue Biology and Development'], 
    'wound': ['Tissue Biology and Development'],
    'tmj': ['Oral and Maxillofacial Anatomy'],
    'anatomy': ['Oral and Maxillofacial Anatomy'],
    'nerve': ['Neuroanatomy and Physiology'],
    'trigeminal': ['Neuroanatomy and Physiology'],
    'salivary': ['Salivary Gland Function'],
    'gland': ['Salivary Gland Function'],
    'tooth': ['Tooth Development and Eruption'],
    'development': ['Tooth Development and Eruption'],
    'periodontal': ['Periodontal Health and Disease'],
    'scaling': ['Periodontal Health and Disease'],
    'planing': ['Periodontal Health and Disease'],
    'pulpal': ['Endodontic Diagnosis and Treatment'],
    'root canal': ['Endodontic Diagnosis and Treatment'],
    'instrumentation': ['Endodontic Diagnosis and Treatment'],
    'examination': ['Endodontic Diagnosis and Treatment'],
    'treatment': ['Endodontic Diagnosis and Treatment'],
    'behavior': ['Endodontic Diagnosis and Treatment'],
    'preventive': ['Endodontic Diagnosis and Treatment'],
    'anesthesia': ['Oral Surgery Principles'],
    'anaphylaxis': ['Oral Surgery Principles'],
    'complications': ['Oral Surgery Principles']
  },
  
  // Keywords that map to INBDE standards
  inbde: {
    'metabolism': ['Molecular, biochemical, cellular, and systems-level development, structure, and function'],
    'biochemical': ['Molecular, biochemical, cellular, and systems-level development, structure, and function'],
    'cellular': ['Molecular, biochemical, cellular, and systems-level development, structure, and function'],
    'collagen': ['Molecular, biochemical, cellular, and systems-level development, structure, and function'],
    'physiology': ['Physics and chemistry to explain normal biology and pathobiology'],
    'anatomy': ['Molecular, biochemical, cellular, and systems-level development, structure, and function'],
    'pathology': ['General and disease-specific pathology to assess patient risk'],
    'disease': ['General and disease-specific pathology to assess patient risk'],
    'diagnosis': ['Interpret patient information and medical data to assess and manage patients'],
    'examination': ['Perform head and neck and intraoral examinations, interpreting and evaluating the clinical findings'],
    'patient': ['Interpret patient information and medical data to assess and manage patients'],
    'treatment': ['Formulate a comprehensive diagnosis and treatment plan for patient management'],
    'management': ['Recognize the manifestations of systemic disease and how the disease and its management may affect the delivery of dental care']
  },
  
  // Keywords that map to CODA standards  
  coda: {
    'patient': ['Patient Care Competency'],
    'care': ['Patient Care Competency'],
    'treatment': ['Patient Care Competency'],
    'examination': ['Patient Care Competency'],
    'diagnosis': ['Patient Care Competency'],
    'knowledge': ['Biomedical Knowledge'],
    'learning': ['Practice-Based Learning'],
    'behavior': ['Interpersonal Communication'],
    'communication': ['Interpersonal Communication'],
    'ethics': ['Professionalism'],
    'professional': ['Professionalism'],
    'system': ['Systems-Based Practice'],
    'management': ['Systems-Based Practice'],
    'analysis': ['Critical Thinking'],
    'evaluation': ['Critical Thinking'],
    'development': ['Life-Long Learning'],
    'prevention': ['Life-Long Learning']
  }
};

async function categorizeDentalContent() {
  console.log("🦷 Starting Dental Content Categorization...");
  
  try {
    // Get all dental content
    const dentalContent = await db
      .select()
      .from(content)
      .where(and(
        eq(content.tenantId, TENANT_ID),
        eq(content.aiCategorized, true)
      ));

    console.log(`📋 Found ${dentalContent.length} dental content items`);

    // Get all standard objectives for the three frameworks
    const objectives = await db
      .select({
        id: standardObjectives.id,
        title: standardObjectives.title,
        description: standardObjectives.description,
        standardType: standards.type,
        standardName: standards.name
      })
      .from(standardObjectives)
      .innerJoin(standards, eq(standardObjectives.standardId, standards.id))
      .where(eq(standards.tenantId, TENANT_ID));

    console.log(`📚 Found ${objectives.length} standard objectives`);

    // Group objectives by standard type
    const objectivesByType = {
      internal: objectives.filter(obj => obj.standardType === 'internal'),
      inbde: objectives.filter(obj => obj.standardType === 'inbde'), 
      coda: objectives.filter(obj => obj.standardType === 'coda')
    };

    console.log(`📊 Objectives by type:
    - Curriculum (internal): ${objectivesByType.internal.length}
    - INBDE: ${objectivesByType.inbde.length}  
    - CODA: ${objectivesByType.coda.length}`);

    let totalMappings = 0;

    // Process each content item
    for (const contentItem of dentalContent) {
      const title = contentItem.title.toLowerCase();
      const description = (contentItem.description || '').toLowerCase();
      const searchText = `${title} ${description}`;

      console.log(`\n🔍 Processing: ${contentItem.title}`);

      // Find matching objectives for each framework
      const mappings = [];

      // Curriculum Template mappings
      for (const [keyword, targetTitles] of Object.entries(CONTENT_MAPPING_RULES.curriculum)) {
        if (searchText.includes(keyword)) {
          const matchingObjectives = objectivesByType.internal.filter(obj => 
            targetTitles.some(title => obj.title.includes(title))
          );
          mappings.push(...matchingObjectives.map(obj => ({ 
            objectiveId: obj.id, 
            confidence: 0.85,
            framework: 'Curriculum Template'
          })));
        }
      }

      // INBDE mappings  
      for (const [keyword, targetTitles] of Object.entries(CONTENT_MAPPING_RULES.inbde)) {
        if (searchText.includes(keyword)) {
          const matchingObjectives = objectivesByType.inbde.filter(obj => 
            targetTitles.some(title => obj.title.includes(title.substring(0, 20))) // Partial match
          );
          mappings.push(...matchingObjectives.map(obj => ({ 
            objectiveId: obj.id, 
            confidence: 0.80,
            framework: 'INBDE'
          })));
        }
      }

      // CODA mappings
      for (const [keyword, targetTitles] of Object.entries(CONTENT_MAPPING_RULES.coda)) {
        if (searchText.includes(keyword)) {
          const matchingObjectives = objectivesByType.coda.filter(obj => 
            targetTitles.some(title => obj.title.includes(title))
          );
          mappings.push(...matchingObjectives.map(obj => ({ 
            objectiveId: obj.id, 
            confidence: 0.75,
            framework: 'CODA'
          })));
        }
      }

      // Ensure at least one mapping per framework (fallback)
      if (mappings.filter(m => m.framework === 'Curriculum Template').length === 0 && objectivesByType.internal.length > 0) {
        const randomObjective = objectivesByType.internal[0]; // Use first objective as fallback
        mappings.push({ objectiveId: randomObjective.id, confidence: 0.60, framework: 'Curriculum Template' });
      }
      
      if (mappings.filter(m => m.framework === 'INBDE').length === 0 && objectivesByType.inbde.length > 0) {
        const randomObjective = objectivesByType.inbde[0];
        mappings.push({ objectiveId: randomObjective.id, confidence: 0.60, framework: 'INBDE' });
      }
      
      if (mappings.filter(m => m.framework === 'CODA').length === 0 && objectivesByType.coda.length > 0) {
        const randomObjective = objectivesByType.coda[0];
        mappings.push({ objectiveId: randomObjective.id, confidence: 0.60, framework: 'CODA' });
      }

      // Insert mappings
      for (const mapping of mappings) {
        await db.insert(contentStandardMappings).values({
          contentId: contentItem.id,
          standardObjectiveId: mapping.objectiveId,
          confidence: mapping.confidence,
          isAiGenerated: true
        }).onConflictDoNothing();
      }

      totalMappings += mappings.length;
      console.log(`✅ Created ${mappings.length} mappings for "${contentItem.title}"`);
    }

    console.log(`\n🎉 Categorization completed successfully!`);
    console.log(`📊 Summary:
    - Content items processed: ${dentalContent.length}
    - Total mappings created: ${totalMappings}
    - Average mappings per item: ${(totalMappings / dentalContent.length).toFixed(1)}`);
    
  } catch (error) {
    console.error("❌ Error during categorization:", error);
    throw error;
  }
}

// Run the categorization function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  categorizeDentalContent()
    .then(() => {
      console.log("✅ Categorization completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Categorization failed:", error);
      process.exit(1);
    });
}

export { categorizeDentalContent };