let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema(
  {
    productName: { type: String, required: true },
    quantity: { type: Number, requierd: true },
    price: { type: Number, required: true },
    likes: Number,
    image: [{ type: String }],
    categories: [
      { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    ],
  },
  { timestamps: true }
);

let Product = mongoose.model('Product', productSchema);

module.exports = Product;
