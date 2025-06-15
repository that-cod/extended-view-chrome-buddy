
import { ApiResponse } from '@/types/trading';

const API_BASE_URL = 'https://server-production-2cd5d.up.railway.app';
const API_KEY = 'F3B9z2H0Yg8LmW7pXqT6s5nRd4KJc3vS1aQwZuIoPyExMhDtGkVfArCbNeUlSiOj';

export async function uploadTradesFile(file: File): Promise<ApiResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Logging for debug
    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('POSTing to endpoint:', `${API_BASE_URL}/trades/uploadTrades`);

    const response = await fetch(`${API_BASE_URL}/trades/uploadTrades`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed with status:', response.status, 'Error:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
