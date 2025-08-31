"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "../ui/header";
import { Button } from "@/components/ui/button";
import { MdOutlineCloudUpload } from "react-icons/md";

interface MenuItem {
  menuitem_id?: number;
  name: string;
  category: string;
  price: number;
  status: string;
  thumbnail?: string;
  favorites?: string;
  estimatedTime?: number;
  description?: string;
}

// removed broken line
const categories = ["Meals", "Coffee", "Drinks"];
const statuses = ["Available", "Unavailable"];
const favoritesOptions = ["Yes", "No"];

export default function MenuItemForm({
  item,
  onSaved,
  onCancel,
}: {
  item: MenuItem | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<MenuItem>({
    name: item?.name || "",
    category: item?.category || "",
    price: item?.price || 0,
    status: item?.status || "Available",
    thumbnail: item?.thumbnail || "",
    favorites: item?.favorites || "No",
    estimatedTime: item?.estimatedTime || 0,
    description: item?.description || "",
  });

  const [uploading, setUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Only set form state when item changes, not on every render
  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        category: item.category || "",
        price: item.price || 0,
        status: item.status || "Available",
        thumbnail: item.thumbnail || "",
        favorites: item.favorites || "No",
        estimatedTime: item.estimatedTime || 0,
        description: item.description || "",
      });
    }
    // Do not reset form if item is null (adding new item)
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "price" ? parseFloat(value) : value });
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const filePath = `public/${
      typeof window !== "undefined" ? Date.now() : "ssr"
    }-${file.name}`;
    const { data, error } = await supabase.storage
      .from("thumbnails")
      .upload(filePath, file, { upsert: true });
    if (!error && data) {
      const url = supabase.storage.from("thumbnails").getPublicUrl(filePath)
        .data.publicUrl;
      setForm({ ...form, thumbnail: url });
    }
    setUploading(false);
  };

  const saveItem = async () => {
    setSaving(true);
    setErrorMsg(null);
    const supabase = createClient();
    if (
      isNaN(Number(form.price)) ||
      isNaN(parseInt(String(form.estimatedTime), 10))
    ) {
      setErrorMsg("Price and Estimated Time must be valid numbers.");
      setSaving(false);
      return;
    }
    const dbPayload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      status: form.status,
      thumbnail: form.thumbnail,
      is_favorites: form.favorites === "Yes",
      est_time: parseInt(String(form.estimatedTime), 10) || 0,
      description: form.description || null,
    };
    let error;
    if (item?.menuitem_id && !isNaN(Number(item.menuitem_id))) {
      ({ error } = await supabase
        .from("menuitem")
        .update(dbPayload)
        .eq("menuitem_id", Number(item.menuitem_id)));
    } else {
      ({ error } = await supabase.from("menuitem").insert([dbPayload]));
    }
    setSaving(false);
    if (error) {
      setErrorMsg(error.message || "Failed to save item.");
      return;
    }
    setShowConfirmModal(false);
    onSaved();
  };

  const deleteItem = async () => {
    setSaving(true);
    setErrorMsg(null);
    const supabase = createClient();
    let error;
    if (item?.menuitem_id) {
      ({ error } = await supabase
        .from("menuitem")
        .delete()
        .eq("menuitem_id", item.menuitem_id));
    }
    setSaving(false);
    if (error) {
      setErrorMsg(error.message || "Failed to delete item.");
      return;
    }
    setShowDeleteModal(false);
    onSaved();
  };

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      {saving && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow text-center font-bold text-orange-600">
            Processing...
          </div>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded shadow z-50">
          {errorMsg}
        </div>
      )}
      <DashboardHeader showBack={false} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmModal(true);
        }}
        className={cn("space-y-5")}
      >
        <div className="max-w-2xl mx-auto mt-2 mb-4 px-7">
          <h2 className="text-xl font-bold mb-2 text-black">
            {item ? "Edit Item" : "Add Item"}
          </h2>
        </div>

        <div className="px-7">
          <div>
            <label className="block text-black mb-2 font-bold text-sm">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full py-1 px-2 border-2 border-black bg-white text-black h-8"
              required
            />
          </div>
          <div>
            <label className="block text-black mb-2 font-bold text-sm">
              Description
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full py-1 px-2 border-2 border-black bg-white text-black h-8"
            />
          </div>

          <div className="flex gap-6 mb-4 mt-5">
            <div className="flex-1">
              <label className="block text-black mb-2 font-bold text-sm">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="max-w-xs w-full py-1 px-2 border-2 border-black bg-white text-black h-8"
                required
              >
                <option value=""></option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-black mb-2 font-bold text-sm">
                Price
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                className="max-w-xs w-full py-1 px-2 border-2 border-black bg-white text-black h-8"
                required
              />
            </div>
          </div>

          <div className="flex gap-6 mb-4">
            <div className="flex-1">
              <label className="block text-black mb-2 font-bold text-sm">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="max-w-xs w-full py-1 px-2 border-2 border-black bg-white text-black h-8"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-black mb-2 font-bold text-sm">
                Favorites
              </label>
              <select
                name="favorites"
                value={form.favorites}
                onChange={handleChange}
                className="max-w-xs w-full py-1 px-2 border-2 border-black bg-white text-black h-8"
              >
                {favoritesOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-black mb-4 font-bold text-sm">
              Thumbnail
            </label>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border flex items-center justify-center text-center overflow-hidden border-2 border-black">
                {form.thumbnail ? (
                  <Image
                    src={form.thumbnail}
                    alt="thumbnail preview"
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-[10px] text-gray-500"></span>
                )}
              </div>
              <label
                htmlFor="thumbnailUpload"
                className="cursor-pointer border-2 border-dashed border-gray-400 flex items-center flex-1 py-2 px-4 rounded-xl text-black text-sm font-medium hover:bg-gray-100 transition"
              >
                <MdOutlineCloudUpload className="mr-2 w-6 h-6" />
                Upload Files
              </label>
              <input
                id="thumbnailUpload"
                name="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
            </div>
            {uploading && (
              <div className="mt-2 text-sm text-gray-500">Uploading...</div>
            )}
          </div>

          {/* Estimated Time */}
          <div className="flex flex-col items-center mb-5">
            <label className="block text-black mb-2 font-bold text-sm text-center">
              Est. Time
            </label>
            <div className="flex items-center gap-2">
              <input
                name="estimatedTime"
                type="number"
                value={form.estimatedTime}
                onChange={handleChange}
                className="w-12 text-center py-1 px-2 border-2 border-black bg-white text-black h-8"
                required
              />
              <span className="text-sm text-black">mins</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex justify-center gap-7 w-[90%]">
              <Button type="button" variant="orange" onClick={onCancel}>
                Back
              </Button>
              <Button type="submit" variant="green">
                {item ? "Confirm" : "Add"}
              </Button>
            </div>

            {item && (
              <Button
                className="mt-3"
                type="button"
                variant="red"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Confirm Add / Edit */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-md p-6 w-[250] text-center space-y-4">
            <p className="text-md text-black font-bold mt-3">
              {item ? "Save changes?" : "Add this menu item?"}
            </p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="border-transparent hover:bg-gray-200 w-[90] py-3 rounded-lg"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={saveItem}
                className="border-transparent hover:bg-gray-200 w-[90] py-3 rounded-lg"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[300px] text-center space-y-4">
            <p className="text-sm text-black">Delete this item?</p>
            <div className="flex justify-between">
              <Button
                variant="orange"
                type="button"
                onClick={() => setShowDeleteModal(false)}
              >
                No
              </Button>
              <Button variant="red" type="button" onClick={deleteItem}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
