import { NextResponse } from "next/server";
import connectDB from "@/lib/connectdb";
import item from "@/model/item";

interface Variant {
    size: string;
    price: number;
    stock: number;
}
export async function POST(req: Request) {
    function capitalize(word : string) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    try {
        await connectDB();

        const body = await req.json();
        const { name, category, variants }: { name: string; category: string; variants: { size: string; price: number; stock: number }[] } = body;
        const itemName = capitalize(name)

        if (!name || !category || !Array.isArray(variants) || !variants.length) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const existingItem = await item.findOne({ name: itemName });

        if (existingItem) {
            variants.forEach((newVariant: Variant) => {
                const existingVariant = existingItem.variants.find(
                    (variant: Variant) => variant.size === newVariant.size.toUpperCase()
                );

                if (existingVariant) {
                    existingVariant.price = Number(newVariant.price);
                    existingVariant.stock += Number(newVariant.stock);
                } else {
                    existingItem.variants.push({
                        size: newVariant.size.toUpperCase(),
                        price: Number(newVariant.price),
                        stock: Number(newVariant.stock),
                    });
                }
            });

            await existingItem.save();
            return new Response(JSON.stringify({ message: "Item updated successfully", item: existingItem }), { status: 200 });
        } else {
            const newItem = new item({
                name: itemName,
                category,
                variants: variants.map((variant: Variant) => ({
                    size: variant.size.toUpperCase(),                   
                    price: Number(variant.price),
                    stock: Number(variant.stock),
                })),
            });

            await newItem.save();
            return new Response(JSON.stringify({ message: "Item added successfully", item: newItem }), { status: 201 });
        }
    } catch (error) {
        console.error("Error adding/updating item:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}



export async function GET() {
    try {
      await connectDB();
      const items = await item.find().populate("category");
  
      return NextResponse.json({ success: true, data: items }, { status: 200 });
    } catch (error) {
        console.log(error)
      return NextResponse.json({ success: false, message: "Error fetching items" }, { status: 500 });
    }
  }
  