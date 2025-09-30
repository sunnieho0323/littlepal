const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true, unique: true }, 
    name:    { type: String, required: true },
    type:    { type: String, enum: ['cat','dog','rabbit'], default: 'cat' },
    mood:    { type: Number, default: 50, min: 0, max: 100 },
    hunger:  { type: Number, default: 50, min: 0, max: 100 },
    thirst:  { type: Number, default: 50, min: 0, max: 100 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pet', PetSchema);
