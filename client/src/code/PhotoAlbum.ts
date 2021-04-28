import axios, { AxiosResponse } from "axios";
import { IPhoto } from "./Photo";

//Interface to define PhotoAlbum data format for client/server communication.
export interface IPhotoAlbum {
    _id?: string,
    originalAuthor: string,
    albumName: string,
    albumDescription?: string,
    numberOfFiles?: number,
    createdDate?: string,
    photos: IPhoto[],
}

//Interface to define User data format for client/server communication.
export interface IUserInfo {
    _id?: string,
    name: string,
    email: string,
    password?: string,
}

//Interface to define User Register data format for client/server communication.
export interface IUserRegisterInfo {
    _id?: string,
    name: string,
    email: string,
    password: string,
}

//Interface to define User Login data format for client/server communication.
export interface IUserLoginInfo {
    _id?: string,
    name?: string,
    email: string,
    password: string,
}

/**
 * Worker class for calling RESTful API's on the server.
*/
export class Worker {

    /**
     * Get list of albums
     * @returns Promise of type IPhotoAlbum[]
     */
    public async listPhotoAlbums(): Promise<IPhotoAlbum[]> {
        const response: AxiosResponse = await axios.get('photoalbums')
        return response.data;
    } 

    /**
     * Post to retrieve list of albums by UserName
     * @param inUserName 
     * @returns Promise of type IPhotoAlbum[]
     */
    public async listPhotoAlbumsByUser(inUserName: string): Promise<IPhotoAlbum[]> {
        const response: AxiosResponse = await axios.post('photoalbums', inUserName);
        return response.data;
    } 

    /**
     * Posts to add new Album
     * @param inPhotoAlbum conforms to IPhotoAlbum format
     * @returns Promise of type IPhotoAlbum[]
     */
    public async addPhotoAlbum(inPhotoAlbum: IPhotoAlbum): Promise<IPhotoAlbum> {
        const response: AxiosResponse = await axios.post('photoalbums', inPhotoAlbum);
        return response.data;
    } 

    /**
     * Delete an Album
     * @param inId albumId
     * @returns Promise of type string
     */
    public async deletePhotoAlbum(inId: string): Promise<string> {
        const response: AxiosResponse = await axios.delete(`photoalbums/${inId}`);
        return response.data;
    } 

    /**
     * Posts to register new user
     * @param inUserInfo conforms to IUserRegisterInfo format
     * @returns Promise of type string
     */
    public async register(inUserInfo: IUserRegisterInfo): Promise<string> {
        const response: AxiosResponse = await axios.post('register', inUserInfo);
        return response.data;
    } 

    /**
     * Posts to login user
     * @param inUserInfo conforms to IUserLoginInfo format
     * @returns Promise of type IUserInfo
     */
    public async login(inUserInfo: IUserLoginInfo): Promise<IUserInfo> {
        const response: AxiosResponse = await axios.post('login', inUserInfo);
        return response.data;
    } 

    /**
     * Posts to logout user
     * @returns Promise of type string
     */
    public async logout(): Promise<string> {
        const response: AxiosResponse = await axios.post('logout');
        return response.data;
    } 

} 