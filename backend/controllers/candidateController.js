const Candidate = require("../models/Candidate");

// @route GET /api/candidates?constituency=XYZ
exports.getCandidates = async (req, res) => {
  try {
    const filter = {};
    if (req.query.constituency) filter.constituency = req.query.constituency;
    const candidates = await Candidate.find(filter);
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching candidates", error: err.message });
  }
};

// @route POST /api/candidates  (admin only)
// Body: { name, party, symbol, constituency }
exports.addCandidate = async (req, res) => {
  try {
    const { name, party, symbol, constituency } = req.body;
    if (!name || !party || !constituency) {
      return res.status(400).json({ message: "name, party, and constituency are required" });
    }
    if (name.trim().length < 3) {
      return res.status(400).json({ message: "Candidate name must be at least 3 characters" });
    }
    if (constituency.trim().length < 2) {
      return res.status(400).json({ message: "Constituency name looks too short" });
    }
    const candidate = await Candidate.create({ name, party, symbol, constituency });
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ message: "Server error adding candidate", error: err.message });
  }
};

// @route DELETE /api/candidates/:id  (admin only)
exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidate removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting candidate", error: err.message });
  }
};
