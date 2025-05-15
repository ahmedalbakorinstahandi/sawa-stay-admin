import { api } from "./api"

export interface UploadResponse {
    success: boolean
    message?: string
    url?: string
}

export async function uploadImage(
    file: File,
    folder: string
): Promise<UploadResponse> {
    folder = folder || "listings"
    try {
        // console.log("Uploading image to folder:", folder)
        // console.log("File to upload:", file);
        
        const formData = new FormData()
        formData.append("image", file)
        formData.append("folder", folder)

        const responseR = await api.post(
            "/general/images/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        )
        const response = responseR.data
        console.log(response);

        if (!response.success) {
            return {
                success: false,
                message: response.message || "Failed to upload image",
            }
        }

        return {
            success: true,
            url: response.data,
        }
    } catch (error) {
        console.error("Upload error:", error)
        return {
            success: false,
            message: "An error occurred during upload",
        }
    }
}

// Example usage:
// const fileInput = document.getElementById('file-input') as HTMLInputElement
// const file = fileInput.files?.[0]
// if (file) {
//   const result = await uploadImage(file, 'listings')
//   if (result.success) {
//     console.log('Image uploaded:', result.url)
//   } else {
//     console.error('Upload failed:', result.message)
//   }
// }