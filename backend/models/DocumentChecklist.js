const mongoose = require('mongoose');

const documentItemSchema = new mongoose.Schema(
  {
    docId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true
    },
    purpose: {
      type: String,
      required: [true, 'Document purpose is required'],
      trim: true
    },
    preparationInstructions: {
      type: String,
      required: [true, 'Preparation instructions are required'],
      trim: true
    },
    isMandatory: {
      type: Boolean,
      default: true
    },
    acceptedAlternatives: {
      type: [String],
      default: []
    },
    whereToObtain: {
      type: String,
      default: 'Nearest Panchayat / Tehsil / Bank / CSC Seva Kendra'
    },
    digitalFormatAccepted: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const documentChecklistSchema = new mongoose.Schema(
  {
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      unique: true,
      index: true
    },
    schemeName: {
      type: String,
      required: true,
      trim: true
    },
    documents: {
      type: [documentItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one document requirement must be present in the checklist'
      }
    },
    preparationGuidelines: {
      type: [String],
      default: [
        'Keep both original documents and 2 self-attested photocopies ready.',
        'Ensure that your mobile number is linked and active with your Aadhaar Card for OTP verification.',
        'Ensure your bank account is Aadhaar seeded (NPCI mapped) for Direct Benefit Transfer (DBT).',
        'Do not hand over original documents to any unauthorized person or intermediary.'
      ]
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const DocumentChecklist = mongoose.model('DocumentChecklist', documentChecklistSchema);
module.exports = DocumentChecklist;
