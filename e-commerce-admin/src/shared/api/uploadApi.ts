import { apiClient } from "./client";

export interface UploadResponse {
  url: string;
  filename: string;
}

export const uploadApi = {
  uploadImage: async (
    file: File,
    options?: { withWatermark?: boolean }
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.withWatermark) {
      formData.append("withWatermark", "true");
    }

    const response = await apiClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  uploadImages: async (
    files: File[],
    options?: { withWatermark?: boolean }
  ): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    if (options?.withWatermark) {
      formData.append("withWatermark", "true");
    }

    const response = await apiClient.post("/upload/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteImage: async (filename: string): Promise<void> => {
    await apiClient.delete(`/upload/image/${filename}`);
  },
};
