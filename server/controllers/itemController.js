const Item = require('../models/Item');
const cloudinary = require('../services/cloudinaryService');
const aiService = require('../services/aiService');

// POST /api/items
exports.createItem = async (req, res) => {
  try {
    const { category, quantity, location, notes } = req.body;
    let imageUrl = null;
    let imagePublicId = null;

    // Handle image upload via Cloudinary
    if (req.file) {
      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
    }

    const item = await Item.create({
      category,
      quantity: quantity || 1,
      location,
      notes,
      imageUrl,
      imagePublicId,
      foundBy: req.user._id,
    });

    await item.populate('foundBy', 'name designation');

    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/items
exports.getItems = async (req, res) => {
  try {
    const { status, category, location, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (search) filter.itemId = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Item.countDocuments(filter);

    const items = await Item.find(filter)
      .populate('foundBy', 'name designation')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/items/stats
exports.getStats = async (req, res) => {
  try {
    const [active, claimed, expired, disposed] = await Promise.all([
      Item.countDocuments({ status: 'ACTIVE' }),
      Item.countDocuments({ status: 'CLAIMED' }),
      Item.countDocuments({ status: 'EXPIRED' }),
      Item.countDocuments({ status: 'DISPOSED' }),
    ]);

    res.json({
      success: true,
      stats: { active, claimed, expired, disposed, total: active + claimed + expired + disposed },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/items/:id
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('foundBy', 'name designation email');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    const { category, quantity, location, notes } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (category) item.category = category;
    if (quantity) item.quantity = quantity;
    if (location) item.location = location;
    if (notes !== undefined) item.notes = notes;

    // Handle image update
    if (req.file) {
      // Delete old image from cloudinary if exists
      if (item.imagePublicId) {
        try { await cloudinary.uploader.destroy(item.imagePublicId); } catch (_) {}
      }
      item.imageUrl = req.file.path;
      item.imagePublicId = req.file.filename;
    }

    await item.save();
    await item.populate('foundBy', 'name designation');

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/items/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ACTIVE', 'CLAIMED', 'EXPIRED', 'DISPOSED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.status = status;
    if (status === 'DISPOSED') item.disposedDate = new Date();
    await item.save();

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/items/ai-suggest
exports.aiSuggest = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image data required' });
    }
    const suggestion = await aiService.suggestCategory(imageBase64);
    res.json({ success: true, suggestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
