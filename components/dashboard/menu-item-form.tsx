"use client";
interface MenuItem {
  id?: number;
  name: string;
  category: string;
  price: number;
  status: string;
  thumbnail?: string;
  favorites?: string;
  estimatedTime?: number;
}
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import DashboardHeader from './header';
import { Button } from "@/components/ui/button" 

// removed broken line
const categories = ['Main', 'Drinks', 'Dessert'];
const statuses = ['Available', 'Unavailable'];
const favoritesOptions = ['Yes', 'No'];


// removed stray code

export default function MenuItemForm({ item, onSaved, onCancel }: { item: MenuItem | null; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<MenuItem>({
    name: item?.name || '',
    category: item?.category || '',
    price: item?.price || 0,
    status: item?.status || 'Available',
    thumbnail: item?.thumbnail || '',
    favorites: item?.favorites || 'No',
    estimatedTime: item?.estimatedTime || 0,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm({
      name: item?.name || '',
      category: item?.category || '',
      price: item?.price || 0,
      status: item?.status || 'Available',
      thumbnail: item?.thumbnail || '',
      favorites: item?.favorites || 'No',
      estimatedTime: item?.estimatedTime || 0,
    });
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'price' ? parseFloat(value) : value,
    });
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const filePath = `public/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('thumbnails').upload(filePath, file, { upsert: true });
    if (!error && data) {
      const url = supabase.storage.from('thumbnails').getPublicUrl(filePath).data.publicUrl;
      setForm({ ...form, thumbnail: url });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (item?.id) {
      await supabase.from('menu_items').update(form).eq('id', item.id);
    } else {
      await supabase.from('menu_items').insert([form]);
    }
    onSaved();
  };

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader showBack={false}/>
      <form onSubmit={handleSubmit} className="space-y-5">
      <div className="max-w-2xl mx-auto mt-2 mb-4 px-7">
  <h2 className="text-xl font-bold mb-2 text-black">
    {item ? "Edit Item" : "Add Item"}
  </h2>
</div>
  <div className="px-7">
    <div>
            <label className="block text-black mb-2 font-bold text-sm">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full py-1 px-2 border-2 border-black bg-white text-black justify-center h-8"
              required
            />
          </div>
      <div className="flex gap-6 mb-4 mt-5">
            <div className="flex-1">
              <label className="block text-black mb-2 font-bold text-sm">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="max-w-xs w-full py-1 px-2 border-2 border-black bg-white text-black h-8"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-black mb-2 font-bold text-sm">Price</label>
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
              <label className="block text-black mb-2 font-bold text-sm">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="max-w-xs w-full py-1 px-2 border-2 border-black bg-white text-black h-8"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-black mb-2 font-bold text-sm">Favorites</label>
              <select
                name="favorites"
                value={form.favorites}
                onChange={handleChange}
                className="max-w-xs w-full py-1 px-2 border-2 border-black bg-white text-black h-8"
              >
                {favoritesOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
  <label className="block text-black mb-4 font-bold text-sm">Thumbnail</label>
  
  <div className="flex items-center gap-4">
    {/* preview box */}
    <div className="w-10 h-10 border flex items-center justify-center overflow-hidden bg-white border-2 border-black">
      {form.thumbnail ? (
        <Image
          src={form.thumbnail}
          alt="thumbnail preview"
          width={56}
          height={56}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="text-[10px] text-gray-500 text-center">No Image</span>
      )}
    </div>
{/* upload box */}
    <label
      htmlFor="thumbnailUpload"
      className="cursor-pointer border-2 border-dashed border-gray-400 flex  flex-1 py-2 px-4 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-100 transition"
    >
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

  {uploading && <div className="mt-2 text-sm text-gray-500">Uploading...</div>}
</div>

          <div className="flex-1 flex flex-col items-center mb-5">
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
          <div className="flex flex-col items-center gap-3">
  
  <div className="flex justify-center gap-7 w-[90%]">
    <Button type="button" variant="orange" onClick={onCancel}>
      Back
    </Button>
    <Button type="submit" variant="green">
      {item ? 'Confirm' : 'Add'}
    </Button>
  </div>

  {item && (
    <Button className="mt-3"
      type="button"
      variant="red"
      onClick={() => (item.id)}
    >
      Delete
    </Button>
  )}
</div>

          </div>
    </form>
    </div>
  );
}