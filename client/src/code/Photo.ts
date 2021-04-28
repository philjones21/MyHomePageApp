import axios, { AxiosResponse } from "axios";

//Interface to define Photo data format for client/server communication.
export interface IPhoto {
    photoName?: string,
    photoFileName: string,
    photoThumbnailFileName: string,
    photoDescription?: string,
    fileSize?: number,
    uploadDate?: Date,
    uploadedByUser?: string, 
}

/**
* Interface to define Photo data format when adding Photo for client to server communication.
* Client doesn't know the Thumbnail or Photo name when adding a Photo which is the reason for 
* multiple Interfaces.
*/
export interface IAddPhotoData {
    _id: string,
    photoDescription?: string,
    fileSize?: number,
    uploadDate?: Date,
    uploadedByUser: string,
}

/**
* Worker class for calling RESTful API's on the server
*/
export class Worker {

    /**
     * Posts new Photo info and File
     * @param formData 
     * @returns Promise of type IPhoto
     */
    public async addPhoto(formData: FormData): Promise<IPhoto> {
        const response: AxiosResponse = await axios.post('photos', formData);
        return response.data;
    } 

    /**
     * Deletes a Photo from album in database and Image Repository
     * @param inAlbumId 
     * @param inPhotoName 
     * @returns Promise of type string
     */
    public async deletePhoto(inAlbumId: string, inPhotoName: string): Promise<string> {
        const response: AxiosResponse = await axios.delete(`photoalbums/${inAlbumId}/photos/${inPhotoName}`);
        return response.data;
    } 
}