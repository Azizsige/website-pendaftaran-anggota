"use server";

export async function verifyKtpWithVision(base64Image: string) {
  try {
    const apiKey = process.env.OCR_SPACE_API_KEY;
    
    if (!apiKey) {
      return { 
        success: false, 
        error: "OCR.Space API Key belum diatur di .env (OCR_SPACE_API_KEY)" 
      };
    }

    // OCR.space membutuhkan form data
    const formData = new FormData();
    formData.append("base64image", base64Image); // Gambar utuh beserta prefix "data:image/..."
    formData.append("language", "eng");
    // Engine 2 sangat bagus untuk angka/dokumen
    formData.append("OCREngine", "2");
    formData.append("scale", "true"); // Auto upscale untuk gambar kecil

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "apikey": apiKey,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      console.error("OCR.Space Error:", data.ErrorMessage);
      return { 
        success: false, 
        error: Array.isArray(data.ErrorMessage) ? data.ErrorMessage[0] : data.ErrorMessage 
      };
    }

    const rawText = data.ParsedResults?.[0]?.ParsedText || "";
    if (!rawText.trim()) {
      return { 
        success: false, 
        error: "Tidak ada teks yang terdeteksi pada gambar KTP." 
      };
    }
    
    return {
      success: true,
      text: rawText,
    };
  } catch (error: any) {
    console.error("Error in verifyKtpWithOCRSpace:", error);
    return { 
      success: false, 
      error: error.message || "Terjadi kesalahan internal saat menghubungi OCR Server" 
    };
  }
}
