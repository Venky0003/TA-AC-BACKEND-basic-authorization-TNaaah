let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let podcastSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    audio: [{ type: String, required: true }],
    image: [{ type: String, required: true }],
    userRole: { type: String, required: true },
    createdByAdmin: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

let Podcast = mongoose.model('Podcast', podcastSchema);

module.exports = Podcast;
