import { ResponseType } from '@/types'
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET
} from '@/constants'
import axios from 'axios'

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

export const uploadFileToCloudinary = async (
  file: {uri?: string} | string,
  folderName: string,
): Promise<ResponseType> => {
  try {
    if (!file) return {success: true, data: null}
    if (typeof file == 'string') {
      return {
        success: true,
        data: file,
      }
    }

    if (file && file.uri) {
      const formData = new FormData()
      formData.append('file', {
        uri: file?.uri,
        type: 'image/jpeg',
        name: file?.uri?.split("/").pop() || 'file.jpg'
      } as any)

      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      formData.append('folder', folderName)

      const res = await axios.post(CLOUDINARY_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      return {
        success: true,
        data: res?.data?.secure_url,
      }
    }

    return {
      success: true
    }
  } catch(error: any) {
    console.log("got error uploading the file: ", error)
    return {
      success: false,
      msg: error.mesage || 'Could not upload the file.'
    }
  }
}

export const getProfileImage = (file: unknown) => {
  if (file && typeof file == 'string') return file
  if (file && typeof file == 'object') return file.uri

  return require('../assets/images/defaultAvatar.png')
}

export const getFilePath = (file: unknown) => {
  if (file && typeof file == 'string') return file
  if (file && typeof file == 'object') return file.uri

  return null
}