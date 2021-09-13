import path from "path";
import sharp from "sharp";
import * as fs from "fs";
import { Request } from "express";
import { Constants } from "./Constants";
import { v4 as uuidv4 } from "uuid";
import { IPhotoAlbums } from "./PhotoAlbums";
import * as PhotoAlbums from "./PhotoAlbums";
import validator from 'validator';
import {logger} from "./Logger";

//Interface to define Photo data format for consumers of this class.
export interface IPhoto {
    photoName?: string,
    photoFileName: string,
    photoThumbnailFileName: string,
    photoDescription?: string,
    fileSize?: number,
    uploadDate?: Date,
    uploadedByUser: string,
}

//Interface to define Photo data format for add functionality for consumers of this class.
export interface IAddPhotoData {
    _id: string,
    photoDescription?: string,
    fileSize?: number,
    uploadDate?: Date,
    uploadedByUser: string,
}

//Interface to define Parsed data format
interface IParsedRequest {
    imageFile: any,
    oldPath: string,
    newPath: string,
    newFullPath: string,
    newFullThumbnailPath: string,
    newFileName: string,
    newThumbnailFileName: string,
    photoDescription: string,
    albumId: string,
    albumName: string,
}

//formidable used to retrieve Image File and fields from the IRequest body.
const { IncomingForm } = require('formidable');

/**
* This class is used to work with the image file. It renames, resizes, validates,
* and creates a thumbnail version of the image.  It saves the images to the
* image file repository and also performs delete operations.
*/
export class Worker {

    /**
    * This function orchestrates the calling of other functions needed
    * for adding a Photo.
    * @param inRequest
    * @param userName
    * @return Promise of type IPhoto or null if the photo wasn't added
    */
    public async addPhoto(inRequest: Request, userName: string): Promise<IPhoto | null> {
        let newPhoto: IPhoto;
        const parsedRequest: IParsedRequest | null = await this.parseRequest(inRequest);

        if (parsedRequest != null) {
            newPhoto = {
                photoFileName: parsedRequest.newFileName,
                photoThumbnailFileName: parsedRequest.newThumbnailFileName,
                photoDescription: parsedRequest.photoDescription,
                fileSize: parsedRequest.imageFile.size,
                uploadDate: new Date(),
                uploadedByUser: userName,
            }

            const photoAlbumWorker: PhotoAlbums.Worker = new PhotoAlbums.Worker();

            const photoAlbum: IPhotoAlbums[] = await photoAlbumWorker.getPhotoAlbumById(parsedRequest.albumId);
            if (photoAlbum != null) {
                if (photoAlbum.length > 0) {
                    let numberOfPhotos: number;
                    if (photoAlbum[0].numberOfFiles == undefined || photoAlbum[0].numberOfFiles == null) {
                        numberOfPhotos = 1;
                    } else {
                        numberOfPhotos = photoAlbum[0].numberOfFiles + 1;
                    }
                    const numberUpdated = await photoAlbumWorker.addPhotoToPhotoAlbumById(parsedRequest.albumId, numberOfPhotos, newPhoto);
                    if (numberUpdated > 0) {
                        const saveToFileResult: boolean = await this.saveFileToFolder(parsedRequest);
                        return (newPhoto);
                    }
                }
            }
        }
        return null;
    }

    /**
    * Calls modifyAndSavePhotoToRepository() and createThumbnail() functions.
    * @param parseResult
    * @return Promise of type boolean
    */
    private async saveFileToFolder(parseResult: IParsedRequest): Promise<boolean> {
        let renameResult: boolean = false;
        let makeDirResult: boolean = false;
        let thumbnailResult: boolean = false;
   
        //renameResult = await this.moveAndSavePhotoToRepository(parseResult);
        renameResult = await this.modifyAndSavePhotoToRepository(parseResult);
        if (renameResult) {
            thumbnailResult = await this.createThumbnail(parseResult);
            if (thumbnailResult) { return true; }
        }
        if (renameResult && thumbnailResult) { return true; }
        return false;//if execution gets to this point then saving the Photo to repository failed.
    }

    /**
    * Validates data and populates the IParsedRequest object based on 
    * data from the inRequest.
    * @param inRequest
    * @return Promise of type IParsedRequest   
    */
    private parseRequest(inRequest: Request): Promise<IParsedRequest> {
        return (new Promise((inResolve, inReject) => {
            const options = {
                maxFileSize: Constants.MAX_PHOTO_FILE_SIZE,
                maxFields: 3,
                maxFieldsSize: 1024,
                filter: function (mimetype: string) {
                    return mimetype && mimetype.includes("image");
                }
            };

            const form = new IncomingForm(options);

            form.parse(inRequest, function (inError: Error, fields: any, files: any) {
                if (inError) {
                    logger.info("Photo parseRequest()", inError);
                    inReject(inError);
                    return;
                } else if (fields.length < 1 || files.length < 1) {
                    inReject("Missing Fields or Files in Request.");
                    return;
                } else {
                    let extension: string = "";
                    let newUniqueFileName: string = "";
                    let newUniqueThumbnailFileName: string = "";
                    let inPhotoDescription: string = "";
                    let albumName: string = "";
                    let albumId: string = "";

                    //validate and sanitize fields
                    if (
                        !validator.isLength(fields.photoDescription, { max: Constants.MAX_PHOTO_DESC_CHARS }) ||
                        !validator.isLength(fields._id, { min: 1, max: 100 }) || !validator.isAlphanumeric(fields._id) ||
                        !validator.isLength(fields.albumName, {
                            min: Constants.MIN_ALBUM_TITLE_CHARS,
                            max: Constants.MAX_ALBUM_TITLE_CHARS
                        })
                    ) {
                        inReject("Invalid input data");
                        return;
                    } else {
                        //fields passed validation so sanitize
                        //React will sanitize HTML for JSX so no need to escape here.
                        albumId = fields._id.toString();
                        albumName = fields.albumName.toString();
                        if (fields.photoDescription != null) {
                            inPhotoDescription = fields.photoDescription.toString();
                            inPhotoDescription = validator.trim(inPhotoDescription);
                        }
                        albumName = validator.trim(albumName);
                    }

                    const extensionStart: number = files.imageFile.name.lastIndexOf(".");
                    if (extensionStart > 0) {
                        extension = files.imageFile.name.substring(extensionStart, files.imageFile.name.length);
                    }

                    //Formidable filter option didn't seem to be catching invalid types so
                    //adding addtional validation here.
                    if (Constants.VALID_MIME_TYPES.indexOf(files.imageFile.type.toLowerCase()) < 0) {
                        inReject("Incorrect Mime Type.");
                        return;
                    }
                    if (Constants.VALID_FILE_TYPES.indexOf(extension.toLowerCase()) < 0) {
                        inReject("Incorrect File Type.");
                        return;
                    }

                    newUniqueFileName = uuidv4();

                    if (extension.length > 0 && newUniqueFileName.length > 0) {
                        newUniqueThumbnailFileName = newUniqueFileName + "_tn.jpg";
                        newUniqueFileName += ".jpg";//all files will be converted to jpg format.
                    } else {
                        inReject("Invalid file name.");
                        return;
                    }
                    const tempPath = files.imageFile.path;
                    const finalPath: string = path.join(Constants.IMAGE_REPOSITORY_BASE_DIR, albumId);
                    const finalFullPath: string = path.join(Constants.IMAGE_REPOSITORY_BASE_DIR, albumId, newUniqueFileName);
                    const finalFullThumbnailPath: string = path.join(Constants.IMAGE_REPOSITORY_BASE_DIR, albumId, newUniqueThumbnailFileName);
                    inResolve({
                        imageFile: files.imageFile,
                        oldPath: tempPath,
                        newPath: finalPath,
                        newFullPath: finalFullPath,
                        newFullThumbnailPath: finalFullThumbnailPath,
                        newFileName: newUniqueFileName,
                        newThumbnailFileName: newUniqueThumbnailFileName,
                        photoDescription: inPhotoDescription,
                        albumId: albumId,
                        albumName: albumName,
                    });
                }
            });
        })
        );
    }

    /**
    * Creates a new folder per the newFolderPath param and returns
    * true to indicate success.
    * @param newFolderPath
    * @returns  Promise of type boolean      
    */
    private createFolder(newFolderPath: string): Promise<boolean> {
        return (
            new Promise((inResolve, inReject) => {
                if (newFolderPath != null) {
                    fs.mkdir(newFolderPath, (inError) => {
                        if (inError) {
                            logger.error("Photo createFolder()", inError);
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

    /**
    * Creates a folder at the parseResult.newFullPath and moves the image file there.
    * @param parseResult
    * @returns Promise of type boolean or error string
    */
    private moveAndSavePhotoToRepository(parseResult: IParsedRequest): Promise<boolean> {
        return (
            new Promise((inResolve, inReject) => {
                fs.rename(parseResult.oldPath, parseResult.newFullPath, function (inError) {
                    if (inError) {
                        logger.error("Photo moveAndSavePhotoToRepository()", inError);
                        inReject("Error moving file to Image Repository.");
                    } else {
                        inResolve(true);
                    }
                });
            })
        )
    }

    /**
    * Creates a folder at the parseResult.newFullPath, modifies the photo 
    * and moves the photo file there.
    * @param parseResult
    * @returns Promise of type boolean or error string     
    */
    private modifyAndSavePhotoToRepository(parseResult: IParsedRequest): Promise<boolean> {
        return (
            new Promise((inResolve, inReject) => {
                sharp(parseResult.oldPath)
                    .resize(1200, 1200, { fit: 'inside' })
                    .withMetadata()
                    .toFile(parseResult.newFullPath, function (inError: Error) {
                        if (inError) {
                            logger.error("Photo modifyAndSavePhotoToRepository()", inError);
                            inReject("Error resizing image file.");
                        } else {
                            inResolve(true);
                        }
                    });
            })
        )
    }

    /**
    * Creates a thumbnail version of the Photo file.
    * @param parseResult
    * @return Promise of type boolean or error string
    */
    private createThumbnail(parseResult: IParsedRequest): Promise<boolean> {
        return (
            new Promise((inResolve, inReject) => {
                sharp(parseResult.newFullPath)
                    .resize(300, 300)
                    .withMetadata()
                    .toFile(parseResult.newFullThumbnailPath, function (inError: Error) {
                        if (inError) {
                            logger.error("Photo createThumbnail()", inError);
                            inReject("Error creating image thumbnail.");
                        } else {
                            inResolve(true);
                        }
                    });
            })
        )
    }

    /**
    * Deletes photo and thumbnail from repository
    * @param inID albumId
    * @param inPhotoFileName file name stored in database
    * @returns Promise of type boolean     
    */
    public deletePhotoFileFromRepository(inID: string, inPhotoFileName: string,): Promise<boolean> {
        return new Promise((inResolve, inReject) => {
            let extension: string = "";
            let fileNameWithoutExtension = "";

            const fullFilePath: string = path.join(Constants.IMAGE_REPOSITORY_BASE_DIR, inID, inPhotoFileName);

            const extensionStart: number = inPhotoFileName.lastIndexOf(".");
            if (extensionStart > 0) {
                extension = inPhotoFileName.substring(extensionStart, inPhotoFileName.length);
                fileNameWithoutExtension = inPhotoFileName.substring(0, extensionStart);
            }

            const fullFileThumbnailPath = path.join(Constants.IMAGE_REPOSITORY_BASE_DIR,
                inID, fileNameWithoutExtension + "_tn" + extension);

            fs.unlink(fullFilePath, (inError) => {
                if (inError) {
                    logger.error("Photo deletePhotoFileFromRepository()", inError);
                    inReject(false);
                }

            });

            fs.unlink(fullFileThumbnailPath, (inError) => {
                if (inError) {
                    logger.error("Photo deletePhotoFileFromRepository()", inError);
                    inReject(false);
                }

            });

            inResolve(true);
        });
    }

    /**
    * Validate photo file requests coming from the browser client.
    * images are renamed with UUID so incoming request shoule have that format.
    * @param inFileName
    * @return boolean for valid or invalid     
    */
    public validatePhotoFileName(inFileName: string): boolean {
        let fileNamePart: string = "";
        let extensionPart: string = "";
        const extensionStart: number = inFileName.lastIndexOf(".");
        if (extensionStart > 0) {
            fileNamePart = inFileName.substring(0, extensionStart);
            extensionPart = inFileName.substring(extensionStart, inFileName.length);
        }

        if (fileNamePart.length >= 3) {
            //check if filename ends in '_tn' and exclude from uuid file name so we can validate uuid.
            if (fileNamePart.substring(fileNamePart.length - 3, fileNamePart.length) == "_tn") {
                fileNamePart = fileNamePart.substring(0, fileNamePart.length - 3)
            }
        }

        //validate UUID filename and extension.
        if (!validator.isUUID(fileNamePart) || Constants.VALID_FILE_TYPES.indexOf(extensionPart.toLowerCase()) < 0) {
            return false;
        }
        return true;
    }
}