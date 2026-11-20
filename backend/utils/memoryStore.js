/**
 * INVESTMATE In-Memory Resilient Fallback Store
 * Enables full end-to-end functionality, local testing, and development
 * even when a MongoDB server is not running locally.
 */

const { categoriesData, usersData, schemesData } = require('../seeders/seedData');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

class MemoryStore {
  constructor() {
    this.users = [];
    this.categories = [];
    this.schemes = [];
    this.checklists = [];
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    // 1. Categories
    this.categories = categoriesData.map((cat) => ({
      _id: new mongoose.Types.ObjectId().toString(),
      ...cat,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const catMap = {};
    this.categories.forEach((c) => {
      catMap[c.slug] = c;
    });

    // 2. Users (hash passwords)
    for (let i = 0; i < usersData.length; i++) {
      const u = usersData[i];
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      this.users.push({
        _id: new mongoose.Types.ObjectId().toString(),
        fullName: u.fullName,
        email: u.email.toLowerCase(),
        password: hashedPassword,
        preferredLanguage: u.preferredLanguage || 'en',
        role: u.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        async matchPassword(entered) {
          return bcrypt.compare(entered, this.password);
        }
      });
    }

    // 3. Schemes & Document Checklists
    schemesData.forEach((s) => {
      const cat = catMap[s.categorySlug];
      const schemeId = new mongoose.Types.ObjectId().toString();

      const schemeObj = {
        _id: schemeId,
        name: s.name,
        slug: s.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
        category: cat ? cat._id : null,
        categoryName: cat ? cat.name : 'General',
        shortDescription: s.shortDescription,
        detailedExplanation: s.detailedExplanation,
        eligibilityCriteria: s.eligibilityCriteria,
        benefits: s.benefits,
        requiredDocuments: s.requiredDocuments,
        applicationProcedure: s.applicationProcedure,
        officialPortalUrl: s.officialPortalUrl,
        status: s.status || 'Active',
        lastVerifiedDate: new Date(),
        finePrint: s.finePrint,
        tags: s.tags || [],
        views: Math.floor(Math.random() * 50) + 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.schemes.push(schemeObj);

      // Checklist
      const docs = (s.requiredDocuments || []).map((docName, dIdx) => ({
        docId: `doc-${dIdx + 1}`,
        name: docName,
        purpose: `Required for official verification of ${s.name}.`,
        preparationInstructions: 'Keep original ready with 2 self-attested photocopies.',
        isMandatory: true,
        acceptedAlternatives: [],
        whereToObtain: 'Gram Panchayat / Tehsil / Bank / CSC Seva Kendra',
        digitalFormatAccepted: true
      }));

      this.checklists.push({
        _id: new mongoose.Types.ObjectId().toString(),
        schemeId: schemeId,
        schemeName: s.name,
        documents: docs,
        preparationGuidelines: [
          'Never submit your original identity documents to any unofficial agent.',
          'Verify that your mobile number is updated in your Aadhaar Card.',
          'Ensure your bank account is seeded with Aadhaar and active.'
        ],
        lastUpdated: new Date()
      });
    });

    this.isInitialized = true;
    console.log(`[MemoryStore] Initialized: ${this.schemes.length} schemes, ${this.categories.length} categories, ${this.users.length} users.`);
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
