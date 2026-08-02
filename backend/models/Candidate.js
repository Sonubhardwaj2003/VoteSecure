const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    party: { type: String, required: true, trim: true },
    symbol: { type: String, default: "" }, // URL/text of party symbol
    constituency: { type: String, required: true, trim: true },
    voteCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
