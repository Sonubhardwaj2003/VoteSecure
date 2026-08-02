const crypto = require("crypto");
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");

// @route POST /api/vote/cast
// Protected (voter JWT required). Body: { candidateId }
exports.castVote = async (req, res) => {
  const session = await Voter.startSession();
  session.startTransaction();
  try {
    const { candidateId } = req.body;
    const { id: voterMongoId, voterId } = req.voter;

    const voter = await Voter.findById(voterMongoId).session(session);
    if (!voter) throw new Error("Voter not found");
    if (voter.hasVoted) throw new Error("You have already voted");
    if (!voter.isVerified) throw new Error("Voter not verified");

    const candidate = await Candidate.findById(candidateId).session(session);
    if (!candidate) throw new Error("Candidate not found");
    if (candidate.constituency !== voter.constituency) {
      throw new Error("You can only vote for candidates in your own constituency");
    }

    // Hash the voter ID so the Vote record can't be trivially reverse-linked
    // to an identity just by reading the votes collection.
    const voterHash = crypto
      .createHash("sha256")
      .update(voterId + process.env.JWT_SECRET)
      .digest("hex");

    await Vote.create(
      [
        {
          voterHash,
          candidate: candidate._id,
          constituency: voter.constituency,
        },
      ],
      { session }
    );

    candidate.voteCount += 1;
    await candidate.save({ session });

    voter.hasVoted = true;
    await voter.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Vote cast successfully. Thank you for participating!" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

// @route GET /api/vote/results?constituency=XYZ
exports.getResults = async (req, res) => {
  try {
    const filter = {};
    if (req.query.constituency) filter.constituency = req.query.constituency;

    const candidates = await Candidate.find(filter).sort({ voteCount: -1 });
    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

    res.json({ totalVotes, candidates });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching results", error: err.message });
  }
};
