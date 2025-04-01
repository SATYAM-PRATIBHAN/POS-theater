"use client";
import { useRouter } from "next/navigation";
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
  _id: string;
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
  const [isAdmin, setIsAdmin] = useState(true)
  const router = useRouter()

  
  useEffect(() => {
    const admin = localStorage.getItem("isAdmin");
    if(admin === "true"){
      setIsAdmin(false)
    }
  }, [])
  

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
    if (!variant || variant.stock < quantity) {
      alert("Not enough stock available for this item.");
      return;
    }

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem._id === item._id && cartItem.size === selectedVariant
    );

    let newCart = [...cart];
    if (existingItemIndex !== -1) {
      newCart[existingItemIndex].quantity += quantity;
    } else {
      newCart.push({
        _id: item._id,
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

    // Check stock availability before confirming
    for (const cartItem of cart) {
      const item = items.find((i) => i._id === cartItem._id);
      const variant = item?.variants.find((v) => v.size === cartItem.size);
      if (!variant || variant.stock < cartItem.quantity) {
        alert(`Not enough stock for ${cartItem.name} (${cartItem.size}).`);
        return;
      }
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          seatNumber,
          items: cart.map((item) => ({
            item: item._id,
            size: item.size,
            name: item.name,
            quantity: item.quantity,
          })),
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Update stock locally
        const updatedItems = items.map((item) => {
          const cartItem = cart.find((ci) => ci._id === item._id);
          if (cartItem) {
            return {
              ...item,
              variants: item.variants.map((variant) =>
                variant.size === cartItem.size
                  ? { ...variant, stock: variant.stock - cartItem.quantity }
                  : variant
              ),
            };
          }
          return item;
        });

        setItems(updatedItems);
        setFilteredItems(updatedItems);

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

  const grandTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 h-[calc(100vh-4rem)] gap-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All</option>
                <option value="Beverages">Beverages</option>
                <option value="Food">Food</option>
                <option value="Misc">Misc</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Size</label>
              <select
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">All</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Items</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading items...</p>
          ) : Array.isArray(filteredItems) && filteredItems.length === 0 ? (
            <p className="text-center text-gray-500">No items found.</p>
          ) : (
            <div className="space-y-4">
              {Array.isArray(filteredItems) && filteredItems.map((item) => (
                <div key={item._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">Category: {item.category ?? "Unknown"}</p>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {item.variants.map((variant, index) => (
                      <p key={index}>
                        Size: {variant.size} | ${variant.price} | Stock: {variant.stock}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        {isAdmin && <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Customer Name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Seat Number"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
            />
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedItem}
              onChange={(e) => {
                setSelectedItem(e.target.value);
                setSelectedVariant("");
              }}
            >
              <option value="">Select Item</option>
              {Array.isArray(items) && items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>

            {selectedItem && (
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                <option value="">Select Size</option>
                {items
                  .find((item) => item._id === selectedItem)
                  ?.variants.map((variant, index) => (
                    <option key={index} value={variant.size}>
                      {variant.size} - ${variant.price}
                    </option>
                  ))}
              </select>
            )}

            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>

            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">Cart</h3>
              {cart.length === 0 ? (
                <p className="text-sm text-gray-500">Cart is empty</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm border-t pt-2"
                    >
                      <span>{item.name} ({item.size}) x {item.quantity} - ${item.price * item.quantity}</span>
                      <button
                        onClick={() => handleRemoveFromCart(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="border-t pt-2">
              <p className="text-md font-semibold text-gray-800">
                Grand Total: ${grandTotal.toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleConfirmOrder}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirm Order
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
}