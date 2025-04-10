import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/connectdb";
import order from "@/model/order";
import item from "@/model/item";

export async function POST(req: NextRequest) {
  const session = await mongoose.startSession();
  try {
    await connectDB();
    session.startTransaction();

    const { customerName, seatNumber, items } = await req.json();

    if (!customerName || !seatNumber || !items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingOrder = await order
      .findOne({ customerName, seatNumber})
      .session(session);

    for (const newItem of items) {
      const foundItem = await item.findById(newItem.item).session(session);
      if (!foundItem) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { error: `Item not found: ${newItem.item}` },
          { status: 404 }
        );
      }

      const variant = foundItem.variants.find(
        (v: any) => v.size === newItem.size
      );
      if (!variant) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { error: `Variant not found: ${newItem.size}` },
          { status: 400 }
        );
      }

      if (variant.stock < newItem.quantity) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { error: `Not enough stock for ${foundItem.name} (${newItem.size})` },
          { status: 400 }
        );
      }
      variant.stock -= newItem.quantity;
      await foundItem.save({ session });

      if (existingOrder) {
        const existingItemIndex = existingOrder.items.findIndex(
          (i: any) =>
            String(i.item) === String(newItem.item) && i.size === newItem.size
        );

        if (existingItemIndex !== -1) {
          existingOrder.items[existingItemIndex].quantity += newItem.quantity;
        } else {
          existingOrder.items.push(newItem);
        }
      }
    }

    if (existingOrder) {
      existingOrder.markModified("items");
      await existingOrder.save({ session });
      await session.commitTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Order updated successfully", order: existingOrder },
        { status: 200 }
      );
    }

    const newOrder = await order.create([{ customerName, seatNumber, items }], {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { message: "Order placed successfully", order: newOrder[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error placing order:", error);
    await session.abortTransaction();
    session.endSession();
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
  
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const seatNumber = searchParams.get("seatNumber");

    if (!seatNumber) {
      return NextResponse.json(
        { success: false, message: "Seat number is required" },
        { status: 400 }
      );
    }

    const deletedOrders = await order.deleteMany({ seatNumber });

    if (deletedOrders.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "No orders found for the given seat" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Orders marked as delivered" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting orders:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting orders" },
      { status: 500 }
    );
  }
}