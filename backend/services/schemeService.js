const Scheme = require('../models/Scheme');
const Category = require('../models/Category');
const DocumentChecklist = require('../models/DocumentChecklist');
const memoryStore = require('../utils/memoryStore');
const { isOfflineMode } = require('../config/db');

class SchemeService {
  /**
   * Get all schemes with pagination, filtering, and low-bandwidth optimization
   */
  static async getSchemes(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'Active',
      sort = '-createdAt',
      lite = 'false',
      search
    } = queryParams;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    if (isOfflineMode()) {
      let filtered = [...memoryStore.schemes];

      if (status && status !== 'all') {
        filtered = filtered.filter((s) => s.status.toLowerCase() === status.toLowerCase());
      }

      if (category) {
        filtered = filtered.filter(
          (s) =>
            s.category?.toString() === category ||
            s.categoryName?.toLowerCase() === category.toLowerCase() ||
            s.categorySlug?.toLowerCase() === category.toLowerCase()
        );
      }

      if (search) {
        const sLower = search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(sLower) ||
            s.shortDescription.toLowerCase().includes(sLower) ||
            s.detailedExplanation.toLowerCase().includes(sLower) ||
            (s.tags && s.tags.some((t) => t.toLowerCase().includes(sLower)))
        );
      }

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limitNum);

      const mapped = paginated.map((s) => {
        if (lite === 'true') {
          return {
            _id: s._id,
            name: s.name,
            slug: s.slug,
            category: s.category,
            categoryName: s.categoryName,
            shortDescription: s.shortDescription,
            status: s.status,
            benefits: s.benefits,
            lastVerifiedDate: s.lastVerifiedDate,
            finePrint: {
              isVerified: s.finePrint?.isVerified,
              lockInPeriod: s.finePrint?.lockInPeriod
            }
          };
        }
        return {
          _id: s._id,
          name: s.name,
          slug: s.slug,
          category: s.category,
          categoryName: s.categoryName,
          shortDescription: s.shortDescription,
          eligibilityCriteria: s.eligibilityCriteria,
          benefits: s.benefits,
          status: s.status,
          lastVerifiedDate: s.lastVerifiedDate,
          finePrint: s.finePrint,
          officialPortalUrl: s.officialPortalUrl,
          views: s.views || 0
        };
      });

      return {
        schemes: mapped,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          hasNextPage: pageNum * limitNum < total,
          hasPrevPage: pageNum > 1
        }
      };
    }

    // Standard MongoDB Path
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({
          $or: [{ slug: category.toLowerCase() }, { name: new RegExp(`^${category}$`, 'i') }]
        }).lean();
        if (cat) {
          filter.category = cat._id;
        }
      }
    }

    if (search) {
      filter.$text = { $search: search };
    }

    let projection = '';
    if (lite === 'true') {
      projection = 'name slug category categoryName shortDescription status benefits lastVerifiedDate finePrint.isVerified finePrint.lockInPeriod';
    } else {
      projection = 'name slug category categoryName shortDescription eligibilityCriteria benefits status lastVerifiedDate finePrint officialPortalUrl views';
    }

    const [schemes, total] = await Promise.all([
      Scheme.find(filter)
        .select(projection)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Scheme.countDocuments(filter)
    ]);

    return {
      schemes,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      }
    };
  }

  /**
   * Get single scheme by ID or Slug
   */
  static async getSchemeById(idOrSlug) {
    if (isOfflineMode()) {
      const scheme = memoryStore.schemes.find(
        (s) => s._id.toString() === idOrSlug || s.slug === idOrSlug.toLowerCase()
      );
      if (!scheme) {
        const error = new Error('Government scheme not found.');
        error.statusCode = 404;
        throw error;
      }
      scheme.views = (scheme.views || 0) + 1;
      const category = memoryStore.categories.find((c) => c._id.toString() === scheme.category?.toString());
      return {
        ...scheme,
        category: category || { name: scheme.categoryName, slug: scheme.categoryName.toLowerCase() }
      };
    }

    let scheme;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(idOrSlug).populate('category', 'name slug icon description');
    } else {
      scheme = await Scheme.findOne({ slug: idOrSlug.toLowerCase() }).populate('category', 'name slug icon description');
    }

    if (!scheme) {
      const error = new Error('Government scheme not found.');
      error.statusCode = 404;
      throw error;
    }

    Scheme.findByIdAndUpdate(scheme._id, { $inc: { views: 1 } }).exec().catch(() => {});
    return scheme;
  }

  /**
   * Fast search and filter across schemes
   */
  static async searchSchemes(params = {}) {
    const {
      q,
      category,
      age,
      occupation,
      gender,
      page = 1,
      limit = 10
    } = params;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    if (isOfflineMode()) {
      let filtered = memoryStore.schemes.filter((s) => s.status === 'Active');

      if (q && q.trim()) {
        const sLower = q.trim().toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(sLower) ||
            s.shortDescription.toLowerCase().includes(sLower) ||
            s.categoryName.toLowerCase().includes(sLower) ||
            (s.tags && s.tags.some((t) => t.toLowerCase().includes(sLower)))
        );
      }

      if (category && category !== 'all') {
        filtered = filtered.filter(
          (s) =>
            s.category?.toString() === category ||
            s.categoryName.toLowerCase() === category.toLowerCase()
        );
      }

      if (age) {
        const parsedAge = parseInt(age, 10);
        if (!isNaN(parsedAge)) {
          filtered = filtered.filter((s) => {
            const min = s.eligibilityCriteria?.minAge;
            const max = s.eligibilityCriteria?.maxAge;
            if (min !== null && min !== undefined && parsedAge < min) return false;
            if (max !== null && max !== undefined && parsedAge > max) return false;
            return true;
          });
        }
      }

      if (occupation) {
        const occLower = occupation.toLowerCase();
        filtered = filtered.filter((s) => {
          const occs = s.eligibilityCriteria?.targetOccupations || [];
          if (occs.length === 0) return true;
          return occs.some((o) => o.toLowerCase().includes(occLower));
        });
      }

      if (gender && gender !== 'All') {
        filtered = filtered.filter((s) => {
          const g = s.eligibilityCriteria?.gender || 'All';
          return g === 'All' || g.toLowerCase() === gender.toLowerCase();
        });
      }

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limitNum);

      return {
        schemes: paginated,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          query: q || '',
          category: category || 'all'
        }
      };
    }

    // Standard MongoDB search
    const filter = { status: 'Active' };

    if (q && q.trim()) {
      const searchTerm = q.trim();
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { shortDescription: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        { categoryName: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({
          $or: [{ slug: category.toLowerCase() }, { name: new RegExp(`^${category}$`, 'i') }]
        }).lean();
        if (catDoc) {
          filter.category = catDoc._id;
        }
      }
    }

    if (age) {
      const parsedAge = parseInt(age, 10);
      if (!isNaN(parsedAge)) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { 'eligibilityCriteria.minAge': null, 'eligibilityCriteria.maxAge': null },
            {
              $and: [
                { $or: [{ 'eligibilityCriteria.minAge': null }, { 'eligibilityCriteria.minAge': { $lte: parsedAge } }] },
                { $or: [{ 'eligibilityCriteria.maxAge': null }, { 'eligibilityCriteria.maxAge': { $gte: parsedAge } }] }
              ]
            }
          ]
        });
      }
    }

    if (occupation) {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { 'eligibilityCriteria.targetOccupations': { $in: [new RegExp(occupation, 'i')] } },
        { 'eligibilityCriteria.targetOccupations': { $size: 0 } }
      );
    }

    if (gender && gender !== 'All') {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { 'eligibilityCriteria.gender': 'All' },
        { 'eligibilityCriteria.gender': gender }
      );
    }

    const [schemes, total] = await Promise.all([
      Scheme.find(filter)
        .select('name slug category categoryName shortDescription eligibilityCriteria benefits finePrint officialPortalUrl status lastVerifiedDate')
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Scheme.countDocuments(filter)
    ]);

    return {
      schemes,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        query: q || '',
        category: category || 'all'
      }
    };
  }

  /**
   * Create new scheme (Admin only)
   */
  static async createScheme(schemeData) {
    if (isOfflineMode()) {
      const cat = memoryStore.categories.find((c) => c._id.toString() === schemeData.category?.toString());
      if (!cat) {
        const error = new Error('Category specified does not exist.');
        error.statusCode = 400;
        throw error;
      }
      const existing = memoryStore.schemes.find((s) => s.name.toLowerCase() === schemeData.name.toLowerCase());
      if (existing) {
        const error = new Error(`A scheme named "${schemeData.name}" already exists.`);
        error.statusCode = 400;
        throw error;
      }

      const newId = `sch_${Date.now()}`;
      const slug = schemeData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      const newScheme = {
        _id: newId,
        slug,
        categoryName: cat.name,
        ...schemeData,
        lastVerifiedDate: new Date(),
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.schemes.unshift(newScheme);
      return newScheme;
    }

    const categoryDoc = await Category.findById(schemeData.category);
    if (!categoryDoc) {
      const error = new Error('Category specified does not exist.');
      error.statusCode = 400;
      throw error;
    }

    schemeData.categoryName = categoryDoc.name;
    const existingScheme = await Scheme.findOne({ name: schemeData.name });
    if (existingScheme) {
      const error = new Error(`A scheme named "${schemeData.name}" already exists.`);
      error.statusCode = 400;
      throw error;
    }

    const scheme = await Scheme.create(schemeData);
    return scheme;
  }

  /**
   * Update existing scheme (Admin only)
   */
  static async updateScheme(id, updateData) {
    if (isOfflineMode()) {
      const idx = memoryStore.schemes.findIndex((s) => s._id.toString() === id.toString() || s.slug === id);
      if (idx === -1) {
        const error = new Error('Scheme not found.');
        error.statusCode = 404;
        throw error;
      }
      const target = memoryStore.schemes[idx];
      Object.keys(updateData).forEach((key) => {
        if (key.startsWith('finePrint.')) {
          const subKey = key.split('.')[1];
          target.finePrint = target.finePrint || {};
          target.finePrint[subKey] = updateData[key];
        } else {
          target[key] = updateData[key];
        }
      });
      target.updatedAt = new Date();
      return target;
    }

    if (updateData.category) {
      const categoryDoc = await Category.findById(updateData.category);
      if (!categoryDoc) {
        const error = new Error('Selected category does not exist.');
        error.statusCode = 400;
        throw error;
      }
      updateData.categoryName = categoryDoc.name;
    }

    updateData.lastVerifiedDate = Date.now();

    const scheme = await Scheme.findByIdAndUpdate(id, { $set: updateData }, {
      new: true,
      runValidators: true
    });

    if (!scheme) {
      const error = new Error('Scheme not found.');
      error.statusCode = 404;
      throw error;
    }

    return scheme;
  }

  /**
   * Delete scheme (Admin only)
   */
  static async deleteScheme(id) {
    if (isOfflineMode()) {
      const idx = memoryStore.schemes.findIndex((s) => s._id.toString() === id.toString());
      if (idx === -1) {
        const error = new Error('Scheme not found.');
        error.statusCode = 404;
        throw error;
      }
      const removed = memoryStore.schemes.splice(idx, 1)[0];
      const chkIdx = memoryStore.checklists.findIndex((c) => c.schemeId.toString() === id.toString());
      if (chkIdx !== -1) memoryStore.checklists.splice(chkIdx, 1);
      return removed;
    }

    const scheme = await Scheme.findByIdAndDelete(id);
    if (!scheme) {
      const error = new Error('Scheme not found.');
      error.statusCode = 404;
      throw error;
    }

    await DocumentChecklist.findOneAndDelete({ schemeId: id });
    return scheme;
  }

  /**
   * Update verification status (Admin only)
   */
  static async updateVerificationStatus(id, { isVerified, verificationSource, status }) {
    if (isOfflineMode()) {
      const scheme = memoryStore.schemes.find((s) => s._id.toString() === id.toString());
      if (!scheme) {
        const error = new Error('Scheme not found.');
        error.statusCode = 404;
        throw error;
      }
      if (isVerified !== undefined) scheme.finePrint.isVerified = isVerified;
      if (verificationSource) scheme.finePrint.verificationSource = verificationSource;
      if (status) scheme.status = status;
      scheme.lastVerifiedDate = new Date();
      return scheme;
    }

    const updateObj = { lastVerifiedDate: Date.now() };
    if (isVerified !== undefined) updateObj['finePrint.isVerified'] = isVerified;
    if (verificationSource) updateObj['finePrint.verificationSource'] = verificationSource;
    if (status) updateObj.status = status;

    const scheme = await Scheme.findByIdAndUpdate(id, { $set: updateObj }, { new: true });
    if (!scheme) {
      const error = new Error('Scheme not found.');
      error.statusCode = 404;
      throw error;
    }
    return scheme;
  }
}

module.exports = SchemeService;
