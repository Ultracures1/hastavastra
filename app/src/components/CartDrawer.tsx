import { X, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity } = useCart();

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 z-[60]"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-paper z-[70] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-softgrey/20">
          <h2 className="text-charcoal text-lg font-serif font-medium">Your Bag</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-charcoal hover:text-ochre transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-softgrey font-sans">Your bag is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 text-ochre text-sm uppercase tracking-wider font-sans hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-charcoal text-sm font-sans font-medium uppercase">
                      {item.product.name}
                    </h3>
                    <p className="text-softgrey text-xs font-sans mt-0.5">
                      {item.product.type}
                    </p>
                    <p className="text-ochre text-sm font-sans font-semibold mt-1">
                      &#x20B9; {item.product.price.toLocaleString("en-IN")}.00
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-7 h-7 border border-softgrey/30 flex items-center justify-center hover:border-charcoal transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-charcoal text-sm font-sans w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-7 h-7 border border-softgrey/30 flex items-center justify-center hover:border-charcoal transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-auto text-softgrey text-xs font-sans hover:text-charcoal transition-colors underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-softgrey/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-charcoal text-sm font-sans uppercase tracking-wider">
                Subtotal
              </span>
              <span className="text-charcoal text-lg font-sans font-semibold">
                &#x20B9; {total.toLocaleString("en-IN")}.00
              </span>
            </div>
            <button className="w-full bg-charcoal text-paper py-4 text-xs uppercase tracking-[2px] font-sans font-medium hover:bg-ochre transition-colors">
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
