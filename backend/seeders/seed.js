require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Scheme = require('../models/Scheme');
const DocumentChecklist = require('../models/DocumentChecklist');
const { categoriesData, usersData, schemesData } = require('./seedData');

// Comprehensive document preparation instructions template
const getDetailedDocumentItems = (schemeName, requiredDocs = []) => {
  const docKnowledgeBase = {
    'Aadhaar Card': {
      purpose: 'Primary identity proof and Aadhaar-seeded Direct Benefit Transfer (DBT) verification.',
      preparationInstructions: 'Ensure original Aadhaar is available. Mobile number must be linked for OTP authentication. Keep 2 photocopies signed by applicant.',
      whereToObtain: 'UIDAI Aadhaar Enrolment / Seva Kendra, Post Office, or Bank',
      isMandatory: true,
      acceptedAlternatives: []
    },
    'Bank Passbook': {
      purpose: 'To disburse welfare payments directly into the beneficiary bank account without middlemen.',
      preparationInstructions: 'First page showing Account Number, IFSC code, and Beneficiary Name clearly. Ensure account is Aadhaar seeded (NPCI mapped).',
      whereToObtain: 'Bank Branch or Post Office where savings account was opened',
      isMandatory: true,
      acceptedAlternatives: ['Cancelled Cheque with printed name', 'Bank Account Statement with seal']
    },
    'Land Ownership Record (Khatauni / Khasra document)': {
      purpose: 'Proof of cultivable land ownership as required by agricultural department.',
      preparationInstructions: 'Certified copy of latest RoR (Record of Rights) / Khatauni / Khasra issued by Revenue authority.',
      whereToObtain: 'Tehsil office, Revenue Inspector, or State Bhulekh / Land Records online portal',
      isMandatory: true,
      acceptedAlternatives: []
    },
    'Ration Card': {
      purpose: 'Family composition and socio-economic category verification.',
      preparationInstructions: 'Original ration card with all family members listed.',
      whereToObtain: 'Food and Civil Supplies Department / Tehsil Office',
      isMandatory: false,
      acceptedAlternatives: ['Family ID card', 'Panchayat Parivar Register copy']
    },
    'Birth Certificate': {
      purpose: 'Exact date of birth verification.',
      preparationInstructions: 'Birth certificate issued by Municipal Corporation, Registrar of Births & Deaths, or Gram Panchayat.',
      whereToObtain: 'Municipal Corporation or Gram Panchayat office',
      isMandatory: true,
      acceptedAlternatives: ['School Leaving Certificate / 10th Marksheet', 'Hospital Discharge Summary']
    },
    'Income Certificate': {
      purpose: 'Verification of family income ceiling eligibility.',
      preparationInstructions: 'Income certificate issued within the last 6 months by competent revenue authority.',
      whereToObtain: 'Tehsildar office, Sub-Divisional Magistrate (SDM), or e-District portal',
      isMandatory: true,
      acceptedAlternatives: []
    },
    'BPL Ration Card': {
      purpose: 'Proof of Below Poverty Line status under national or state survey.',
      preparationInstructions: 'Valid BPL ration card or certificate with family enumeration code.',
      whereToObtain: 'District Food & Civil Supplies Office / Gram Panchayat',
      isMandatory: true,
      acceptedAlternatives: ['Antyodaya Anna Yojana (AAY) Card']
    }
  };

  return requiredDocs.map((docName, index) => {
    // Match against knowledge base or build high-quality fallback
    let match = docKnowledgeBase[docName];
    if (!match) {
      for (const [key, val] of Object.entries(docKnowledgeBase)) {
        if (docName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(docName.toLowerCase())) {
          match = val;
          break;
        }
      }
    }

    return {
      docId: `doc-${index + 1}`,
      name: docName,
      purpose: match ? match.purpose : `Official documentary verification for ${schemeName}.`,
      preparationInstructions: match
        ? match.preparationInstructions
        : 'Keep 1 original document for physical verification and 2 self-attested photocopies ready.',
      isMandatory: match ? match.isMandatory : true,
      acceptedAlternatives: match ? match.acceptedAlternatives : [],
      whereToObtain: match ? match.whereToObtain : 'Nearest Village Panchayat / Tehsil / CSC Seva Kendra',
      digitalFormatAccepted: true
    };
  });
};

const seedDatabase = async () => {
  try {
    console.log('--------------------------------------------------');
    console.log('🌾 INVESTMATE - Database Seeder Initialization');
    console.log('--------------------------------------------------');

    await connectDB();

    // Clear existing data
    console.log('[Seeder] Resetting collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Scheme.deleteMany({}),
      DocumentChecklist.deleteMany({})
    ]);

    // 1. Seed Categories
    console.log('[Seeder] Inserting Categories...');
    const createdCategories = await Category.insertMany(categoriesData);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat;
    });
    console.log(`[Seeder] Successfully seeded ${createdCategories.length} categories.`);

    // 2. Seed Users
    console.log('[Seeder] Creating Users (with encrypted passwords)...');
    for (const user of usersData) {
      await User.create(user);
    }
    console.log(`[Seeder] Successfully seeded ${usersData.length} users (Admin & Demo Citizens).`);

    // 3. Seed Schemes & Document Checklists
    console.log('[Seeder] Inserting Government Schemes & Checklists...');
    let schemeCount = 0;
    for (const schemeItem of schemesData) {
      const category = categoryMap[schemeItem.categorySlug];
      if (!category) {
        console.warn(`[Seeder Warning] Category ${schemeItem.categorySlug} not found for scheme ${schemeItem.name}`);
        continue;
      }

      const schemePayload = {
        ...schemeItem,
        category: category._id,
        categoryName: category.name
      };

      const createdScheme = await Scheme.create(schemePayload);

      // Create Document Checklist for this scheme
      const docItems = getDetailedDocumentItems(createdScheme.name, createdScheme.requiredDocuments);
      await DocumentChecklist.create({
        schemeId: createdScheme._id,
        schemeName: createdScheme.name,
        documents: docItems,
        preparationGuidelines: [
          'Never submit your original documents to any unauthorized individual or agent.',
          'Always submit clear photocopies with your signature (self-attested).',
          'Verify that your mobile number is updated in your Aadhaar Card for OTP delivery.',
          'Ensure your bank account is seeded with Aadhaar and NPCI mapped for Direct Benefit Transfer (DBT).'
        ]
      });

      schemeCount++;
    }

    console.log(`[Seeder] Successfully seeded ${schemeCount} verified welfare schemes with full fine-print disclosures and document checklists.`);
    console.log('--------------------------------------------------');
    console.log('✅ Database Seeding Completed Successfully!');
    console.log('   Admin Login : admin@investmate.gov.in / Admin@Secure123');
    console.log('   User Login  : farmer.ramesh@investmate.in / Farmer@Ramesh123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
