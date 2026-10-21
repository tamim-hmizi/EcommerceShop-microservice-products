import mongoose from 'mongoose';

// Read-only view of the categories collection owned by the categories service,
// used to populate a product's category.
const categorySchema = new mongoose.Schema(
  { name: String, description: String },
  { strict: false }
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
