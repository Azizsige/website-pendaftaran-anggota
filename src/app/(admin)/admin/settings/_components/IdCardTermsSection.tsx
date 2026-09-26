import React, { useState, useEffect } from 'react';
import { useIdCardSettingStore } from '@/store/useIdCardSettingStore';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Reorder } from 'framer-motion';

export const IdCardTermsSection = () => {
  const { formData, handleChange } = useIdCardSettingStore();
  
  // Local state for terms with stable IDs for framer-motion Reorder
  const [terms, setTerms] = useState<{id: string, text: string}[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      if (formData.kta_terms) {
        const parsed = JSON.parse(formData.kta_terms) as string[];
        // Map to objects with stable ids only if the length or content fundamentally changed from outside
        setTerms((prev) => {
          if (parsed.length !== prev.length || prev.some((p, i) => p.text !== parsed[i])) {
            return parsed.map((t, i) => ({ id: `term-${Date.now()}-${i}`, text: t }));
          }
          return prev;
        });
      }
    } catch (e) {
      console.error("Failed to parse kta_terms", e);
    }
  }, [formData.kta_terms]);

  const updateStore = (newTerms: {id: string, text: string}[]) => {
    setTerms(newTerms);
    handleChange('kta_terms', JSON.stringify(newTerms.map(t => t.text)));
  };

  const handleReorder = (newOrder: {id: string, text: string}[]) => {
    updateStore(newOrder);
  };

  const addTerm = () => {
    if (terms.length >= 5) return;
    updateStore([...terms, { id: `term-${Date.now()}`, text: "" }]);
  };

  const updateTerm = (index: number, value: string) => {
    const newTerms = [...terms];
    newTerms[index].text = value;
    updateStore(newTerms);
  };

  const deleteTerm = (index: number) => {
    const newTerms = terms.filter((_, i) => i !== index);
    updateStore(newTerms);
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-on-surface">Ketentuan Kartu (Sisi Belakang)</h3>
          <p className="text-sm text-on-surface-variant">Atur poin ketentuan di sisi belakang kartu. Maksimal 5 poin. Drag ikon di sebelah kiri untuk mengubah urutan.</p>
        </div>
        <button 
          onClick={addTerm}
          disabled={terms.length >= 5}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

      <div className="mt-2">
        {terms.length === 0 ? (
          <div className="text-sm text-on-surface-variant italic py-4 text-center bg-surface-container-low rounded-lg border border-dashed border-outline-variant/40">
            Belum ada ketentuan. Klik tombol Tambah.
          </div>
        ) : (
          <Reorder.Group axis="y" values={terms} onReorder={handleReorder} className="flex flex-col gap-3">
            {terms.map((term, index) => (
              <Reorder.Item key={term.id} value={term} className="relative bg-surface border border-outline-variant/30 rounded-lg shadow-sm flex items-start gap-2 p-2">
                <div className="pt-2 pl-1 cursor-grab active:cursor-grabbing text-on-surface-variant/50 hover:text-on-surface">
                  <GripVertical size={16} />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-on-surface-variant">Poin {index + 1}</span>
                  <textarea 
                    value={term.text}
                    onChange={(e) => updateTerm(index, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded text-sm text-on-surface focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all outline-none resize-none"
                    placeholder="Masukkan teks ketentuan..."
                  />
                </div>
                <button
                  onClick={() => deleteTerm(index)}
                  className="p-2 mt-4 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
      <p className="text-[11px] text-on-surface-variant/70 mt-1">
        Perubahan urutan dan isi otomatis tersimpan di form preview. Jangan lupa klik Save Changes di bawah untuk menyimpan ke database.
      </p>
    </div>
  );
};
