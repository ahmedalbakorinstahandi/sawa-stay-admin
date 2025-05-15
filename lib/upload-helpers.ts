
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
        const formData = new FormData()
        formData.append("image", file)
        formData.append("folder", folder)

        // const response = await api.post("/general/images/upload", formData)
        const responseR = await fetch(
            process.env.NEXT_PUBLIC_BASE_API +
            "/general/images/upload", {
            method: "POST",
            body: formData,
        })
        const response = await responseR.json()
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