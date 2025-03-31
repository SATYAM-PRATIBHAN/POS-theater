import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectdb";
import order from "@/model/order";
import item from "@/model/item";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { customerName, seatNumber, items } = await req.json();
    console.log("Data Recieved my route : ", { customerName, seatNumber, items });

    if (!customerName || !seatNumber || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let existingOrder = await order.findOne({ customerName, seatNumber });

    for (const newItem of items) {
      const foundItem = await item.findById(newItem.item);
      if (!foundItem) {
        return NextResponse.json({ error: `Item not found: ${newItem.item}` }, { status: 404 });
      }

      const variant = foundItem.variants.find((v: any) => v.size === newItem.size);
      if (!variant) {
        return NextResponse.json({ error: `Variant not found: ${newItem.size}` }, { status: 400 });
      }

      if (variant.stock < newItem.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${foundItem.name} (${newItem.size})` },
          { status: 400 }
        );
      }

      variant.stock -= newItem.quantity;
      await foundItem.save();

      if (existingOrder) {
        const existingItemIndex = existingOrder.items.findIndex(
          (i: any) => String(i.item) === String(newItem.item) && i.size === newItem.size
        );

        if (existingItemIndex !== -1) {
          existingOrder.items[existingItemIndex].quantity += newItem.quantity;
        } else {
          existingOrder.items.push(newItem);
        }
      }
    }

    if (existingOrder) {
      await existingOrder.markModified("items");
      await existingOrder.save();
      return NextResponse.json({ message: "Order updated successfully", order: existingOrder }, { status: 200 });
    }

    const newOrder = await order.create({ customerName, seatNumber, items });
    return NextResponse.json({ message: "Order placed successfully", order: newOrder }, { status: 201 });

  } catch (error) {
    console.error("Error placing order:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}




export async function GET() {
    try {
        await connectDB();
        const orders = await order.find()

        return NextResponse.json({ success: true, orders }, { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ success: false, message: "Error fetching orders" }, { status: 500 });
    }
}
  