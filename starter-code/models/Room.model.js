const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const roomSchema = new Schema(
  {
    name: String,
    desc: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Room', roomSchema);
