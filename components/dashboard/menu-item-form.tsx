"use client";
interface MenuItem {
  id?: number;
  name: string;
  category: string;
  price: number;
  status: string;
  thumbnail?: string;
  description?: string;
}
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
// removed broken line
const categories = ['Main', 'Drinks', 'Dessert'];
const statuses = ['Available', 'Unavailable'];

// removed stray code

export default function MenuItemForm({ item, onSaved, onCancel }: { item: MenuItem | null; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<MenuItem>({
    name: item?.name || '',
    category: item?.category || '',
    price: item?.price || 0,
    status: item?.status || 'Available',
    thumbnail: item?.thumbnail || '',
    description: item?.description || '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm({
      name: item?.name || '',
      category: item?.category || '',
      price: item?.price || 0,
      status: item?.status || 'Available',
      thumbnail: item?.thumbnail || '',
      description: item?.description || '',
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold mb-2 -mt-10">{item ? 'Edit Item' : 'Add Item'}</h2>
      <div>
        <label className="block">Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="border rounded w-full p-2" required />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="border rounded w-full p-2" required>
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block">Price</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} className="border rounded w-full p-2" required />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="block">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="border rounded w-full p-2">
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex-[2]">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="border rounded w-full p-2 min-h-[60px]" rows={3} />
        </div>
      </div>
      <div className="mb-4">
        <label className="block">Thumbnail</label>
        <input name="thumbnail" type="file" accept="image/*" onChange={handleImage} className="border rounded w-full p-2" />
        {uploading && <div>Uploading...</div>}
        {form.thumbnail && (
          <div className="w-full h-48 mt-2 relative">
            <Image src={form.thumbnail} alt="thumbnail" width={400} height={192} className="rounded object-cover w-full h-full" style={{objectFit:'cover'}} />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" className="bg-gray-300 text-black px-4 py-2 rounded" onClick={onCancel}>Back</button>
        <button type="submit" className="bg-green-500 text-black px-4 py-2 rounded">{item ? 'Update' : 'Add'}</button>
      </div>
    </form>
  );
}
