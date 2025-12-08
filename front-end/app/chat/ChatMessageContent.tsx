"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Package } from "lucide-react";

export const ChatMessageContent = ({ content }: { content: string }) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const productIdRegex = /Product ID: ([a-fA-F0-9]{24})/;
    const match = content.match(productIdRegex);

    if (match && match[1]) {
      const productId = match[1];
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(`/api/products?id=${productId}`);
          setProduct(data);
        } catch (error) {
          console.error("Failed to fetch product for chat message:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [content]);

  return (
    <div>
      <p className="text-sm whitespace-pre-wrap">{content}</p>
      {loading && <p className="text-xs mt-2 italic">Loading product...</p>}
      {product && (
        <div className="mt-2 border-t border-white/20 pt-2">
          <div className="flex items-center space-x-3 p-2 bg-black/10 rounded-lg">
            <img
              src={`data:image/png;base64,${product.images[0]}` || "/placeholder.svg"}
              alt={product.name}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm leading-tight">{product.name}</p>
              <p className="text-xs opacity-80">${product.priceMin} - ${product.priceMax}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};