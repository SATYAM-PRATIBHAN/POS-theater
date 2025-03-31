import mongoose, { Schema, Document } from "mongoose";

interface Variant {
  size: string; 
  price: number;
  stock: number;
}
export interface IItem extends Document {
  name: string;
  category: string;
  variants: Variant[];
}

const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["Beverages", "Food", "Misc"], 
    required: true 
  },
  variants: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
      stock: { type: Number, required: true },
    },
  ],
});

export default mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);
