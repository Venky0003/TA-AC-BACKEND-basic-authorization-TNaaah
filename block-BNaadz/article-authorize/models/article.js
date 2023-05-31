let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let articleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: {type:String, required: true},
    likes: Number,
    author: {type: Schema.Types.ObjectId, ref: "User", required: true},
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);


module.exports = mongoose.model('Article', articleSchema);