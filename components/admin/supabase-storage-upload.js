// Alternative handleImage function using Supabase Storage
// Replace the handleImage function in menu-item-form.tsx with this if you want to use Supabase Storage

const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  setUploading(true);
  setErrorMsg(null);

  try {
    const supabase = createClient();
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      setUploading(false);
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image must be smaller than 5MB');
      setUploading(false);
      return;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `menu-items/${fileName}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file, { 
        cacheControl: '3600',
        upsert: false 
      });
      
    if (error) {
      console.error('Storage upload error:', error);
      setErrorMsg(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }
    
    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);
      setForm({ ...form, thumbnail: publicUrl });
    }
    
  } catch (error) {
    console.error('Image upload error:', error);
    setErrorMsg('Failed to process image');
  } finally {
    setUploading(false);
  }
};