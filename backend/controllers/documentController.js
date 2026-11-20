const DocumentChecklist = require('../models/DocumentChecklist');
const Scheme = require('../models/Scheme');
const ApiResponse = require('../utils/apiResponse');
const memoryStore = require('../utils/memoryStore');
const { isOfflineMode } = require('../config/db');

/**
 * @desc    Get document checklist and preparation instructions for a scheme
 * @route   GET /api/documents/:schemeId
 * @access  Public (Guest accessible)
 */
const getChecklistBySchemeId = async (req, res, next) => {
  try {
    const { schemeId } = req.params;

    if (isOfflineMode()) {
      const scheme = memoryStore.schemes.find(
        (s) => s._id.toString() === schemeId || s.slug === schemeId.toLowerCase()
      );
      if (!scheme) {
        return ApiResponse.error(res, 404, 'Scheme not found');
      }

      let checklist = memoryStore.checklists.find((c) => c.schemeId.toString() === scheme._id.toString());
      if (!checklist) {
        const defaultDocs = (scheme.requiredDocuments || ['Aadhaar Card', 'Bank Passbook']).map((docName, index) => ({
          docId: `doc-${index + 1}`,
          name: docName,
          purpose: `Required for official verification of ${scheme.name}.`,
          preparationInstructions: 'Keep original for verification along with 2 clear self-attested photocopies.',
          isMandatory: true,
          acceptedAlternatives: [],
          whereToObtain: 'Competent local authority / Bank / CSC Centre',
          digitalFormatAccepted: true
        }));

        checklist = {
          _id: `chk_${scheme._id}`,
          schemeId: scheme._id,
          schemeName: scheme.name,
          documents: defaultDocs,
          preparationGuidelines: [
            'Never submit your original identity documents to any unofficial agent.',
            'Verify that your mobile number is updated in your Aadhaar Card.',
            'Ensure your bank account is seeded with Aadhaar and active.'
          ],
          lastUpdated: new Date()
        };
      }

      return ApiResponse.success(res, 200, 'Document checklist retrieved successfully', checklist);
    }

    // Standard MongoDB path
    let scheme;
    if (schemeId.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(schemeId).select('name requiredDocuments');
    } else {
      scheme = await Scheme.findOne({ slug: schemeId.toLowerCase() }).select('name requiredDocuments');
    }

    if (!scheme) {
      return ApiResponse.error(res, 404, 'Scheme not found');
    }

    let checklist = await DocumentChecklist.findOne({ schemeId: scheme._id }).lean();

    if (!checklist) {
      const defaultDocs = (scheme.requiredDocuments || ['Aadhaar Card', 'Bank Passbook']).map((docName, index) => ({
        docId: `doc-${index + 1}`,
        name: docName,
        purpose: `Required for official verification of ${scheme.name}.`,
        preparationInstructions: 'Keep original for verification along with 2 clear self-attested photocopies.',
        isMandatory: true,
        acceptedAlternatives: [],
        whereToObtain: 'Competent local authority / Bank / CSC Centre',
        digitalFormatAccepted: true
      }));

      checklist = {
        schemeId: scheme._id,
        schemeName: scheme.name,
        documents: defaultDocs,
        preparationGuidelines: [
          'Never submit your original identity documents to any unofficial agent.',
          'Verify that your mobile number is updated in your Aadhaar Card.',
          'Ensure your bank account is seeded with Aadhaar and active.'
        ],
        lastUpdated: new Date()
      };
    }

    return ApiResponse.success(res, 200, 'Document checklist retrieved successfully', checklist);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update or create document checklist for a scheme
 * @route   PUT /api/documents/:schemeId
 * @access  Private (Admin only)
 */
const updateChecklist = async (req, res, next) => {
  try {
    const { schemeId } = req.params;
    const { documents, preparationGuidelines } = req.body;

    if (isOfflineMode()) {
      const scheme = memoryStore.schemes.find((s) => s._id.toString() === schemeId || s.slug === schemeId);
      if (!scheme) {
        return ApiResponse.error(res, 404, 'Target scheme not found');
      }

      let checklist = memoryStore.checklists.find((c) => c.schemeId.toString() === scheme._id.toString());
      if (checklist) {
        checklist.documents = documents;
        if (preparationGuidelines) checklist.preparationGuidelines = preparationGuidelines;
        checklist.lastUpdated = new Date();
      } else {
        checklist = {
          _id: `chk_${Date.now()}`,
          schemeId: scheme._id,
          schemeName: scheme.name,
          documents,
          preparationGuidelines: preparationGuidelines || [],
          lastUpdated: new Date()
        };
        memoryStore.checklists.push(checklist);
      }

      return ApiResponse.success(res, 200, 'Document checklist updated successfully', checklist);
    }

    const scheme = await Scheme.findById(schemeId).select('name');
    if (!scheme) {
      return ApiResponse.error(res, 404, 'Target scheme not found');
    }

    const updatedChecklist = await DocumentChecklist.findOneAndUpdate(
      { schemeId: scheme._id },
      {
        $set: {
          schemeId: scheme._id,
          schemeName: scheme.name,
          documents,
          preparationGuidelines: preparationGuidelines || undefined,
          lastUpdated: Date.now()
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    return ApiResponse.success(res, 200, 'Document checklist updated successfully', updatedChecklist);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChecklistBySchemeId,
  updateChecklist
};
