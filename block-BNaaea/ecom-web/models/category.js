var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let categorySchema = new Schema(
  {
    category_type: [{ type: String, required: true }],
  },
  { timestamps: true }
);

let Category = mongoose.model('Category', categorySchema);

module.exports = Category;


