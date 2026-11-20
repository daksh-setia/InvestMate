const mongoose = require('mongoose');

// Sub-schema for Fine-Print Transparency Module
const finePrintSchema = new mongoose.Schema(
  {
    lockInPeriod: {
      type: String,
      required: [true, 'Lock-in period specification is required'],
      default: 'No lock-in period'
    },
    exitPenalties: {
      type: String,
      required: [true, 'Exit penalties disclosure is required'],
      default: 'No exit penalties'
    },
    hiddenCharges: {
      type: String,
      required: [true, 'Hidden charges / fee disclosure is required'],
      default: '₹0 hidden charges - 100% free government welfare scheme'
    },
    withdrawalConditions: {
      type: String,
      required: [true, 'Withdrawal conditions are required'],
      default: 'Direct Benefit Transfer (DBT) directly into bank account'
    },
    expectedReturns: {
      type: String,
      default: 'Information not verified'
    },
    inflationAdjustedReturns: {
      type: String,
      default: 'Information not verified'
    },
    importantWarnings: {
      type: [String],
      default: [
        'Never pay money to unauthorized agents or middlemen. Application is free at official CSCs/portals.',
        'Beware of fake SMS and phone calls asking for OTP or bank credentials.'
      ]
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    verificationSource: {
      type: String,
      default: 'Official Government Gazette & Ministry Portal'
    }
  },
  { _id: false }
);

// Sub-schema for Structured Eligibility Criteria
const eligibilitySchema = new mongoose.Schema(
  {
    minAge: {
      type: Number,
      default: null
    },
    maxAge: {
      type: Number,
      default: null
    },
    targetOccupations: {
      type: [String],
      default: []
    },
    incomeLimit: {
      type: String,
      default: 'No specific income ceiling'
    },
    gender: {
      type: String,
      enum: ['All', 'Female', 'Male', 'Transgender'],
      default: 'All'
    },
    residence: {
      type: String,
      default: 'Citizen of India'
    },
    rules: {
      type: [String],
      required: [true, 'At least one eligibility rule is required']
    }
  },
  { _id: false }
);

// Sub-schema for Application Procedure
const applicationProcedureSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Both'],
      default: 'Both'
    },
    steps: {
      type: [String],
      required: [true, 'Application steps must be provided']
    },
    whereToApply: {
      type: String,
      default: 'Nearest Common Service Centre (CSC) or Official Portal'
    },
    officialHelpline: {
      type: String,
      default: 'Toll-free national helpline'
    },
    processingFees: {
      type: String,
      default: '₹0 (Free of charge)'
    }
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Scheme category is required'],
      index: true
    },
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      index: true
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description in simple language is required'],
      trim: true,
      maxlength: [400, 'Short description should be concise and simple (max 400 chars)']
    },
    detailedExplanation: {
      type: String,
      required: [true, 'Detailed explanation is required'],
      trim: true
    },
    eligibilityCriteria: {
      type: eligibilitySchema,
      required: true
    },
    benefits: {
      type: [String],
      required: [true, 'At least one benefit must be specified']
    },
    requiredDocuments: {
      type: [String],
      required: [true, 'Required document names must be listed']
    },
    applicationProcedure: {
      type: applicationProcedureSchema,
      required: true
    },
    officialPortalUrl: {
      type: String,
      required: [true, 'Official government portal URL is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Discontinued', 'Upcoming'],
      default: 'Active',
      index: true
    },
    lastVerifiedDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    finePrint: {
      type: finePrintSchema,
      required: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate slug before saving
schemeSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Full-text search index for high performance search queries
schemeSchema.index({
  name: 'text',
  shortDescription: 'text',
  detailedExplanation: 'text',
  tags: 'text'
});

const Scheme = mongoose.model('Scheme', schemeSchema);
module.exports = Scheme;
