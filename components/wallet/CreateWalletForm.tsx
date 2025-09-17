"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateWalletFormProps {
  onSubmit: (name: string, type: "purchaser" | "seller" | "custom") => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function CreateWalletForm({ onSubmit, onCancel, isLoading }: CreateWalletFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"purchaser" | "seller" | "custom">("purchaser");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Wallet name is required");
      return;
    }

    if (name.length > 50) {
      setError("Wallet name must be 50 characters or less");
      return;
    }

    if (!type) {
      setError("Please select a wallet type");
      return;
    }

    onSubmit(name.trim(), type);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium mb-4">Create New Wallet</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="wallet-name" className="block text-sm font-medium text-gray-700 mb-1">
            Wallet Name
          </label>
          <Input
            id="wallet-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter wallet name..."
            disabled={isLoading}
            maxLength={50}
          />
        </div>

        <div>
          <label htmlFor="wallet-type" className="block text-sm font-medium text-gray-700 mb-1">
            Wallet Type
          </label>
          <Select value={type} onValueChange={(value: "purchaser" | "seller" | "custom") => setType(value)}>
            <SelectTrigger disabled={isLoading}>
              <SelectValue placeholder="Select wallet type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchaser">
                <div>
                  <div className="font-medium">Purchaser</div>
                  <div className="text-sm text-gray-500">For making payments and buying services</div>
                </div>
              </SelectItem>
              <SelectItem value="seller">
                <div>
                  <div className="font-medium">Seller</div>
                  <div className="text-sm text-gray-500">For receiving payments and providing services</div>
                </div>
              </SelectItem>
              <SelectItem value="custom">
                <div>
                  <div className="font-medium">Custom</div>
                  <div className="text-sm text-gray-500">General purpose wallet with custom name</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Creating..." : "Create Wallet"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Testnet Safety:</strong> All wallets are created on Base Sepolia testnet with no real money.</p>
        <p><strong>Auto-funding:</strong> Purchaser wallets automatically receive test USDC when balance is low.</p>
      </div>
    </div>
  );
}
