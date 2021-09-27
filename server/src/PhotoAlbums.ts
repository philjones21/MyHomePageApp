import * as path from "path";
import { IPhoto } from "./Photo";
import { Constants } from "./Constants";
import * as fs from "fs";
import { logger } from "./Logger";
import { SanitationUtil } from "./SanitationUtil";

const Datastore = require("nedb");

//Interface to define PhotoAlbums data format for consumers of this class.
export interface IPhotoAlbums {
    _id?: string,
    originalAuthor: string,
    albumName: string,
    albumDescription?: string,
    numberOfFiles?: number,
    createdDate?: Date,
    photos: IPhoto[],
}

/**
* Worker class to perform list, add, delete operations on database for PhotoAlbums.
*/
export class Worker {
    private db: Nedb;
    private sanitizationUtil: SanitationUtil = new SanitationUtil(Constants.BLACKLIST2);

    constructor() {
        this.db = new Datastore({ filename: path.join(Constants.DATABASE_DIR, "photoalbums.db"), autoload: true });
    }

    /**
    * Return a list of all the PhotoAlbums for a given user
    * @param inUserName
    * @return Promise of IPhotoAlbums[]  
    */
    public listPhotoAlbumsByUser(inUserName: String): Promise<IPhotoAlbums[]> {
        return new Promise((inResolve, inReject) => {
            this.db.find({ originalAuthor: inUserName },
                (inError: Error, inDocs: IPhotoAlbums[]) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inDocs);
                    }
                }
            );
        });
    }

    /**
    * Return PhotoAlbum info for a given AlbumId
    * @param inId albumId
    * @return Promise of IPhotoAlbums[] or error    
    */
    public getPhotoAlbumById(inId: string): Promise<IPhotoAlbums[]> {
        inId = this.sanitizationUtil.sanitizeWithBlackList(inId);
        return new Promise((inResolve, inReject) => {
            this.db.find({ _id: inId },
                (inError: Error, inDocs: IPhotoAlbums[]) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inDocs);
                    }
                }
            );
        });
    }

    /**
    * Add Photo info to the parent Album in the database and return number of records
    * updated.
    * @param inId albumId
    * @param numberOfPhotos
    * @param inPhoto conforms to IPhoto
    * @returns Promise of number type or error     
    */
    public addPhotoToPhotoAlbumById(inId: string, numberOfPhotos: number, inPhoto: IPhoto): Promise<number> {
        inId = this.sanitizationUtil.sanitizeWithBlackList(inId);
        this.sanitizationUtil.sanitizeObjectWithBlackList(inPhoto);
        return new Promise((inResolve, inReject) => {
            this.db.update({ _id: inId }, { $set: { numberOfFiles: numberOfPhotos }, $push: { photos: inPhoto } }, {},
                (inError: Error | null, inNumberReplaced: number, upsert: boolean) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inNumberReplaced);
                    }
                }
            );
        });
    }

    /**
    * Return a list of all the PhotoAlbums  
    * @returns Promise of type IPhotoAlbums[] or error    
    */
    public listPhotoAlbums(): Promise<IPhotoAlbums[]> {
        return new Promise((inResolve, inReject) => {
            this.db.find({}).sort({ createdDate: -1 }).exec(
                (inError: Error | null, inDocs: IPhotoAlbums[]) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inDocs);
                    }
                }
            );
        });
    }

    /**
    * Add a photoAlbum to the database
    * @param inPhotoAlbum photoAlbum Object
    * @returns Promise of IPhotoAlbums or error     
    */
    public addPhotoAlbum(inPhotoAlbum: IPhotoAlbums): Promise<IPhotoAlbums> {
        this.sanitizationUtil.sanitizeObjectWithBlackList(inPhotoAlbum);
        inPhotoAlbum.numberOfFiles = 0;
        inPhotoAlbum.createdDate = new Date();
        
        return new Promise((inResolve, inReject) => {
            this.db.insert(inPhotoAlbum, async (inError: Error | null, inNewDoc: IPhotoAlbums) => {
                if (inError) {
                    inReject(inError);
                } else {
                    if (inNewDoc != null) {
                        const id: string | undefined = inNewDoc._id;
                        if (id != undefined) {
                            try {
                                const makeDirResult: boolean = await this.createFolder(path.join(Constants.IMAGE_REPOSITORY_BASE_DIR, id));
                            } catch (e) {
                                logger.error("PhotoAlbum addPhotoAlbum() ", e);
                                inReject(e);
                            }
                        }
                    }
                    inResolve(inNewDoc);
                }
            });
        });
    }

    /**
    * Delete a photoAlbum per the ID and return number of records deleted
    * @param inID albumId
    * @param inUserName
    * @returns Promise of number type. Number records deleted   
    */
    public deletePhotoAlbum(inID: string, inUserName: string): Promise<number> {
        inID = this.sanitizationUtil.sanitizeWithBlackList(inID);
        inUserName = this.sanitizationUtil.sanitizeWithBlackList(inUserName);
        return new Promise((inResolve, inReject) => {
            this.db.remove({ _id: inID, originalAuthor: inUserName }, {}, (inError: Error | null, inNumberRemoved: number) => {
                if (inError) {
                    inReject(inError);
                } else {
                    inResolve(inNumberRemoved);
                }
            });
        });
    }

    /**
    * Delete a photo per the albumId and return number of records deleted.
    * the inUserName must match the orginal user that uploaded the photo.
    * @param inID albumId
    * @param inPhotoFileName fileName stored in DB
    * @param inUserName  
    * @returns Promise of number type. Number deleted or error
    */
    public deletePhotoDataFromDB(inID: string, inPhotoFileName: string, inUserName: string): Promise<number> {
        inID = this.sanitizationUtil.sanitizeWithBlackList(inID);
        inPhotoFileName = this.sanitizationUtil.sanitizeWithBlackList(inPhotoFileName);
        inUserName = this.sanitizationUtil.sanitizeWithBlackList(inUserName);
        return new Promise((inResolve, inReject) => {
            this.db.update({ _id: inID, }, {
                $pull:
                {
                    photos:
                    {
                        photoFileName: inPhotoFileName,
                        uploadedByUser: inUserName,
                    }
                }
            }, {},
                (inError: Error | null, inNumberReplaced: number, upsert: boolean) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inNumberReplaced);
                    }
                }
            );
        });
    }

    /**
    * Update the number of files for a given album
    * @param inId albumId
    * @param numberOfPhotos new number of Photos
    * @returns Promise of number type. Number of records updated     
    */
    public updatePhotoCountById(inId: string, numberOfPhotos: number): Promise<number> {
        inId = this.sanitizationUtil.sanitizeWithBlackList(inId);
        return new Promise((inResolve, inReject) => {
            this.db.update({ _id: inId }, { $set: { numberOfFiles: numberOfPhotos } }, {},
                (inError: Error | null, inNumberReplaced: number, upsert: boolean) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inNumberReplaced);
                    }
                }
            );
        });
    }

    /**
    * Delete the PhotoAlbum folder from image repository
    * @param inID photoAlbumId
    * @returns Promise of boolean type. True or false for success or fail
    */
    public deletePhotoAlbumFolderFromRepository(inID: string): Promise<boolean> {
        inID = this.sanitizationUtil.sanitizeWithBlackList(inID);
        return new Promise((inResolve, inReject) => {

            const fullFolderPath: string = path.join(Constants.IMAGE_REPOSITORY_BASE_DIR, inID);

            fs.rmdir(fullFolderPath, { recursive: true }, (inError) => {
                if (inError) {
                    inReject(false);
                }
            });
            inResolve(true);
        });
    }

    /**
    * Create a folder for the PhotoAlbum in the image repository when an album is added.
    * @param newFolderPath specify path for folder
    * @returns Promise of boolean type. True or false for success or fail    
    */
    public createFolder(newFolderPath: string): Promise<boolean> {
        return (
            new Promise((inResolve, inReject) => {
                if (newFolderPath != null) {
                    fs.mkdir(newFolderPath, (inError) => {
                        if (inError) {
                            inReject(false);
                        }
                    });
                    inResolve(true);
                } else {
                    inReject(false);
                }
            })
        )
    }
}