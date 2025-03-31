"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Variant {
  size: string;
  price: number;
  stock: number;
}

interface Item {
  _id: string;
  name: string;
  category: string;
  variants: Variant[];
}

interface CartItem {
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.data as Item[]);
        setFilteredItems(data.data as Item[]);
      })
      .catch((err) => console.error("Error fetching items:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = items;
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }
    if (selectedSize) {
      filtered = filtered.filter((item) =>
        item.variants.some((variant) => variant.size === selectedSize)
      );
    }
    setFilteredItems(filtered);
  }, [selectedCategory, selectedSize, items]);

  const handleAddToCart = () => {
    if (!selectedItem || !selectedVariant || quantity < 1) {
      alert("Please select an item, size, and valid quantity.");
      return;
    }

    const item = items.find((i) => i._id === selectedItem);
    if (!item) return;

    const variant = item.variants.find((v) => v.size === selectedVariant);
    if (!variant) return;

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.size === selectedVariant
    );

    let newCart = [...cart];

    if (existingItemIndex !== -1) {
      // If item exists, update quantity
      newCart[existingItemIndex].quantity += quantity;
    } else {
      // If item is new, add to cart
      newCart.push({
        name: item.name,
        size: selectedVariant,
        price: variant.price,
        quantity,
      });
    }

    setCart(newCart);
    setSelectedItem("");
    setSelectedVariant("");
    setQuantity(1);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleConfirmOrder = async () => {
    if (!customerName || !seatNumber || cart.length === 0) {
      alert("Please enter customer details and add items to the cart.");
      return;
    }
    console.log("Submitting Order:", { customerName, seatNumber, items: cart });
  
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, seatNumber, items: cart }),
      });
  
      const responseData = await response.json();
      console.log(responseData);
  
      if (response.ok) {
        alert("Order placed successfully!");
        setCustomerName("");
        setSeatNumber("");
        setCart([]);
      } else {
        console.error("Failed to place order:", responseData);
        alert(`Error: ${responseData.message || "Failed to place order."}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing the order.");
    }
  };
  

  return (
    <div className="flex min-h-screen p-6 gap-6">
      {/* Sidebar for Filters */}
      <div className="w-1/4 p-4 border rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Filter Items</h2>
        <label>Category:</label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All</option>
          <option value="Beverages">Beverages</option>
          <option value="Food">Food</option>
          <option value="Misc">Misc</option>
        </select>
        <label>Size:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
        >
          <option value="">All</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
        </select>
      </div>

      {/* Items List */}
      <div className="w-1/2 p-4 border rounded-lg shadow-md max-h-screen overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Available Items</h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading items...</p>
        ) : filteredItems.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <ul className="space-y-3">
            {filteredItems.map((item) => (
              <li key={item._id} className="p-3 border rounded-lg">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p>Category: {item.category ?? "Unknown"}</p>
                <ul>
                  {item.variants.map((variant, index) => (
                    <li key={index}>
                      Size: {variant.size} | Price: ${variant.price} | Stock:{" "}
                      {variant.stock}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Order Form */}
      <div className="w-1/4 p-4 border rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Add to Cart</h2>
        <input
          type="text"
          placeholder="Customer Name"
          className="w-full p-2 border rounded mb-2"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Seat Number"
          className="w-full p-2 border rounded mb-2"
          value={seatNumber}
          onChange={(e) => setSeatNumber(e.target.value)}
        />
        {/* Dropdown for Item Selection */}
        <select
          className="w-full p-2 border rounded mb-2"
          value={selectedItem}
          onChange={(e) => {
            setSelectedItem(e.target.value);
            setSelectedVariant(""); // Reset variant when item changes
          }}
        >
          <option value="">Select Item</option>
          {items.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        {/* Dropdown for Variant Selection */}
        {selectedItem && (
          <select
            className="w-full p-2 border rounded mb-2"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
          >
            <option value="">Select Variant</option>
            {items
              .find((item) => item._id === selectedItem)
              ?.variants.map((variant, index) => (
                <option key={index} value={variant.size}>
                  {variant.size} - ${variant.price}
                </option>
              ))}
          </select>
        )}

        {/* Quantity Input */}
        <input
          type="number"
          min="1"
          className="w-full p-2 border rounded mb-2"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />


        <button onClick={handleAddToCart} className="w-full bg-blue-600 text-white p-2 rounded mb-2">
          Add to Cart
        </button>

        {/* Cart Display */}
        <h2 className="text-lg font-bold mb-4">Cart</h2>
        <ul>
          {cart.map((item, index) => (
            <li key={index} className="border p-2 rounded mb-2 flex justify-between">
              {item.name} ({item.size}) x {item.quantity}
              <button className="bg-red-500 text-white p-1 rounded" onClick={() => handleRemoveFromCart(index)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <button onClick={handleConfirmOrder} className="w-full bg-green-600 text-white p-2 rounded mt-4">
          Confirm Order
        </button>
      </div>
    </div>
  );
}
