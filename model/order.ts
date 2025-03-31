import mongoose, { Schema, Document } from "mongoose";

interface OrderItem {
  item: mongoose.Schema.Types.ObjectId;
  size: string;
  quantity: number;
}

export interface IOrder extends Document {
  customerName: string;
  seatNumber: string;
  items: OrderItem[];
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  customerName: { type: String, required: true },
  seatNumber: { type: String, required: true },
  items: [
    {
      name : {type : String, required: true},
      item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
      size: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
