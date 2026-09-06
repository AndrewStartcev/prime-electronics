import { apiClient } from "./client";

export interface UploadImageResponse {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}

export async function uploadImage(
  file: File,
  options?: { withWatermark?: boolean },
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.withWatermark) {
    formData.append("withWatermark", "true");
  }

  const response = await apiClient.post<UploadImageResponse>(
    "/upload/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}
