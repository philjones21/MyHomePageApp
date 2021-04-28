import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
//Add secret to config.json if downloading and running project from public source control
import { configInfo } from "./ConfigInfo";
import * as PhotoAlbums from "./PhotoAlbums";
import * as Photo from "./Photo";
import { IPhotoAlbums } from "./PhotoAlbums";
import { IPhoto } from "./Photo";
import * as Blogs from "./Blogs";
import {IBlogs} from "./Blogs";
import { Constants } from "./Constants";
import { Authentication, IErrorMessage, IUserInfo } from "./Authentication";
import session from "express-session";
import { check, validationResult } from 'express-validator';
import validator from 'validator';
import { logger } from "./Logger";

const Datastore = require('express-nedb-session')(session);

const app: Express = express();

app.use(express.json());

//Add secret to config.json if downloading and running project from public source control
app.use(session({
    secret: configInfo.config.secret,
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,//change in future
        sameSite: true,
        maxAge: configInfo.config.timeout
    },
    store: new Datastore({ filename: path.join(Constants.DATABASE_DIR, "sessions.db") })
}));



//location of static resources used by client.
app.use("/", express.static(path.join(__dirname, ".." + path.sep + ".." + path.sep + "client" + path.sep + "dist")));

app.use((inRequest: Request, inResponse: Response, inNext: NextFunction) => {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    inNext();
});

//End point for getting list of PhotoAlbums
app.get("/photoalbums",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const photoAlbumWorker: PhotoAlbums.Worker = new PhotoAlbums.Worker();
            const photoAlbums: IPhotoAlbums[] = await photoAlbumWorker.listPhotoAlbums();
            inResponse.send(photoAlbums);
        } catch (inError) {
            logger.error("SessionId: " + inRequest.session.id + " main get /photoalbums ", inError);
            inResponse.status(404).send("error");
        }
    }

);

//End point for getting list of Blog Entries
app.get("/blogs",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const blogsWorker: Blogs.Worker = new Blogs.Worker();
            const blogs: IBlogs[] = await blogsWorker.listBlogs();
            inResponse.send(blogs);
        } catch (inError) {
            logger.error("SessionId: " + inRequest.session.id + " main get /blogs ", inError);
            inResponse.status(404).send("error");
        }
    }

);

//End point for adding a new PhotoAlbum.
app.post("/photoalbums",
    [
        check('albumName').isLength({ min: Constants.MIN_ALBUM_TITLE_CHARS, max: Constants.MAX_ALBUM_TITLE_CHARS })
            .trim(),
        check('originalAuthor').isLength({ min: Constants.MIN_USER_NAME_CHARS, max: Constants.MAX_USER_NAME_CHARS })
            .trim(),
        check('albumDescription').isLength({ max: Constants.MAX_ALBUM_DESC_CHARS }).trim(),

        check('numberOfFiles').isLength({ max: 1 }).trim().escape().isInt({ max: 0 }),

        check('photos').isEmpty(),
    ],
    async (inRequest: any, inResponse: Response) => {
        try {
            validationResult(inRequest).throw();
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main post /photoalbums", e);
            inResponse.status(400).send("error: Invalid data entered");
            return;
        }

        if (!inRequest.session.loggedIn) {
            inResponse.status(401).send("error: logged out");
            return;
        }

        try {
            const photoAlbumWorker: PhotoAlbums.Worker = new PhotoAlbums.Worker();
            const photoAlbum: IPhotoAlbums = await photoAlbumWorker.addPhotoAlbum(inRequest.body);
            logger.info("SessionId: " + inRequest.session.id + " main post /photoalbums. Album added.");
            inResponse.send(photoAlbum);
        } catch (inError) {
            logger.error("SessionId: " + inRequest.session.id + " main post /photoalbums", inError);
            inResponse.status(400).send("error");
        }
    }

);

//End point for adding a new Blog.
app.post("/blog",
    [
        check('blogTitle').isLength({ min: Constants.MIN_BLOG_TITLE_CHARS, max: Constants.MAX_BLOG_TITLE_CHARS })
            .trim(),
        check('originalAuthor').isLength({ min: Constants.MIN_USER_NAME_CHARS, max: Constants.MAX_USER_NAME_CHARS })
            .trim(),
        check('blogArticle').isLength({ max: Constants.MAX_BLOG_ARTICLE_CHARS }).trim(),

        check('blogEmbedURL').isLength({ max: 100 })

    ],
    async (inRequest: any, inResponse: Response) => {
        try {
            validationResult(inRequest).throw();
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main post /blog", e);
            inResponse.status(400).send("error: Invalid data entered");
            return;
        }

        if (!inRequest.session.loggedIn) {
            inResponse.status(401).send("error: logged out");
            return;
        }

        //Validate embedURL if passed in.
        if(inRequest.body.blogEmbedURL){
            let validEmbedURL: boolean = false;

            for(let i: number = 0; i < Constants.VALID_EMBED_URLS.length; i++){
                if(inRequest.body.blogEmbedURL.indexOf(Constants.VALID_EMBED_URLS[i]) > -1){
                    validEmbedURL = true;
                }
            }

            if(!validator.isURL(inRequest.body.blogEmbedURL) || !validEmbedURL){
                logger.error("SessionId: " + inRequest.session.id + " main post /blog invalid embedURL.");
                inResponse.status(400).send("error: Invalid data entered");
                return;
            }
        }

        try {
            const blogsWorker: Blogs.Worker = new Blogs.Worker();
            const blog: IBlogs = await blogsWorker.addBlog(inRequest.body);
            logger.info("SessionId: " + inRequest.session.id + " main post /blog. Blog Article added.");
            inResponse.send(blog);
        } catch (inError) {
            logger.error("SessionId: " + inRequest.session.id + " main post /blog", inError);
            inResponse.status(400).send("error");
        }
    }

);

//End point for Deleting a PhotoAlbum by ID.
app.delete("/photoalbums/:id",

    [check('id').isLength({ min: 1, max: 100 }).isAlphanumeric()],

    async (inRequest: any, inResponse: Response) => {
        try {
            validationResult(inRequest).throw();
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main delete /photoalbums/id", e);
            inResponse.status(400);
            return;
        }
        if (!inRequest.session.loggedIn) {
            inResponse.status(401).send("error: logged out");
            return;
        }
        try {
            const photoAlbumWorker: PhotoAlbums.Worker = new PhotoAlbums.Worker();
            const photoAlbumToDelete: IPhotoAlbums[] = await photoAlbumWorker.getPhotoAlbumById(inRequest.params.id);
            if (photoAlbumToDelete.length == 1) {
                for (let i: number = 0; i < photoAlbumToDelete[0].photos.length; i++) {
                    if (photoAlbumToDelete[0].photos[i].uploadedByUser != inRequest.session.userName) {
                        inResponse.status(400).send("error message: Album contains other user's photos and can't be deleted.");
                        return;
                    }
                }
            } else {
                inResponse.status(400).send("error");
                return;
            }

            const totalDeleted: number = await photoAlbumWorker.deletePhotoAlbum(inRequest.params.id, inRequest.session.userName);
            if (totalDeleted > 0) {
                logger.info("SessionId: " + inRequest.session.id + 
                            " main delete /photoalbums/:id. Album deleted.");
                const folderDeleted: boolean = await photoAlbumWorker.deletePhotoAlbumFolderFromRepository(inRequest.params.id);
            }
            inResponse.send("ok");
        } catch (inError) {
            logger.error("SessionId: " + inRequest.session.id + " main delete /photoalbums/id", inError);
            inResponse.status(400).send("error");
        }
    }

);

//End point for Deleting a Blog Entry by ID.
app.delete("/blog/:id",

    [check('id').isLength({ min: 1, max: 100 }).isAlphanumeric()],

    async (inRequest: any, inResponse: Response) => {
        try {
            validationResult(inRequest).throw();
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main delete /blog/id", e);
            inResponse.status(400);
            return;
        }
        if (!inRequest.session.loggedIn) {
            inResponse.status(401).send("error: logged out");
            return;
        }
        try {
            const blogsWorker: Blogs.Worker = new Blogs.Worker();
            const totalDeleted: number = await blogsWorker.deleteBlog(inRequest.params.id, inRequest.session.userName);
            if (totalDeleted > 0) {
                logger.info("SessionId: " + inRequest.session.id + 
                            " main delete /blog/:id. Blog article deleted.");
            }
            inResponse.send("ok");
        } catch (inError) {
            logger.error("SessionId: " + inRequest.session.id + " main delete /blog/id", inError);
            inResponse.status(400).send("error");
        }
    }

);

//End point for Deleting a Photo per AlbumId and Photo FileName.
app.delete("/photoalbums/:id/photos/:filename",
    [
        check('id').isLength({ min: 1, max: 100 }).isAlphanumeric(),
        check('filename').isLength({ min: 5, max: 100 })
    ],
    async (inRequest: any, inResponse: Response) => {
        try {
            validationResult(inRequest).throw();
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main delete /photoalbums/id/photos/filename", e);
            inResponse.status(400);
            return;
        }

        if (!inRequest.session.loggedIn) {
            inResponse.status(401).send("error: logged out");
            return;
        }
        try {
            const photoWorker: Photo.Worker = new Photo.Worker();
            if (!photoWorker.validatePhotoFileName(inRequest.params.filename)) {
                inResponse.status(400).send("error");
                return;
            }

            let numberOfPhotos: number = 0;
            const photoAlbumsWorker: PhotoAlbums.Worker = new PhotoAlbums.Worker();

            const photoAlbum: IPhotoAlbums[] = await photoAlbumsWorker.getPhotoAlbumById(inRequest.params.id);
            if (photoAlbum != null) {
                if (photoAlbum[0].photos == undefined || photoAlbum[0].photos == null) {
                    numberOfPhotos = 0;
                } else if (photoAlbum[0].photos.length > 0) {
                    numberOfPhotos = photoAlbum[0].photos.length - 1;
                }
            }

            const totalDeleted: number = await photoAlbumsWorker.deletePhotoDataFromDB(inRequest.params.id, inRequest.params.filename, inRequest.session.userName);
            const totalUpdated: number = await photoAlbumsWorker.updatePhotoCountById(inRequest.params.id, numberOfPhotos);
            if (totalDeleted > 0) {
                logger.info("SessionId: " + inRequest.session.id + 
                " main delete /photoalbums/:id/photos/:filename. photo deleted." +
                "albumId: " + inRequest.params.id + " photo: " + inRequest.params.filename);
                const message: boolean = await photoWorker.deletePhotoFileFromRepository(inRequest.params.id, inRequest.params.filename);
            }
            inResponse.send("ok");
        } catch (inError) {
            logger.error("SessionId: " + inRequest.session.id + " main delete /photoalbums/id/photos/filename", inError);
            inResponse.status(400).send("error");
        }
    }

);


//End point for adding a new Photo.
app.post("/photos",
    async (inRequest: any, inResponse: Response) => {
        if (!inRequest.session.loggedIn) {
            inResponse.status(401).send("error: logged out");
            return;
        }
        try {
            const photoWorker: Photo.Worker = new Photo.Worker();
            //input validation and sanitation is done in photoWorker.
            const photo: IPhoto | null = await photoWorker.addPhoto(inRequest, inRequest.session.userName);
            if (photo) {
                logger.info("SessionId: " + inRequest.session.id + 
                " main post /photos. photo added.");
                inResponse.send(photo);
            } else {
                inResponse.status(400).send("error");
            }
        } catch (inError) {
            logger.error("SessionId: " + inRequest.session.id + " main.ts post /photos", inError);
            inResponse.status(400).send("error");
        }
    }

);

//End point for getting a photo per AlbumId and PhotoFile name.
app.get('/albumid/:id/photofilename/:filename',
    [
        check('id').isLength({ min: 1, max: 100 }).isAlphanumeric(),
        check('filename').isLength({ min: 5, max: 100 })
    ],
    async (inRequest: Request, inResponse: Response) => {
        try {
            validationResult(inRequest).throw();
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main.ts get /albumid/:id/photofilename/:filename", e);
            inResponse.status(400);
            return;
        }
        const id = inRequest.params.id;
        const filename = inRequest.params.filename;

        const photoWorker: Photo.Worker = new Photo.Worker();
        if (!photoWorker.validatePhotoFileName(inRequest.params.filename)) {
            inResponse.status(400);
            return;
        }

        try {
            const fileSender = function (): Promise<boolean> {
                return new Promise((inResolve, inReject) => {
                    inResponse.sendFile(path.join(Constants.IMAGE_REPOSITORY_BASE_DIR, id, filename),
                        (inError) => {
                            if (inError) {
                                inReject(false);
                            } else {
                                inResolve(true);
                            }
                        }
                    );
                });
            }
            logger.info("SessionId: " + inRequest.session.id + 
                " main get /albumid/:id/photofilename/:filename. request for albumId: " +
                id + " photo: " + filename);
            await fileSender();
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main.ts get /albumid/:id/photofilename/:filename", e);
            inResponse.status(400);
        }
    }
);

//End point for Registering a new User.
app.post("/register",
    [
        check('name').isLength({ min: Constants.MIN_USER_NAME_CHARS, max: Constants.MAX_USER_NAME_CHARS }).trim(),
        check('email').isLength({ min: 5, max: 100 }).isEmail().normalizeEmail()
        //password validation is implemented in Authentication class.
    ],
    async (inRequest: any, inResponse: Response) => {
        if (!configInfo.config.allowNewUsers) {
            inResponse.status(404).send("New users not currently accepted");
            return;
        }
        try {
            validationResult(inRequest).throw();
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main.ts post /register", e);
            inResponse.status(400).send("Invalid data entered");
            return;
        }

        if (!inRequest.session.loggedIn) {
            inRequest.session.loggedIn = false;
        } else {
            inResponse.status(403).send("You are already logged in");
            return;
        }

        try {
            const authentication: Authentication = new Authentication();
            let errorMessage: IErrorMessage = { message: "" };
            if (await authentication.register(inRequest.body, errorMessage)) {
                inResponse.status(200).send("ok");
            } else {
                inResponse.status(400).send(errorMessage.message);
            }
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main.ts post /register", e);
            inResponse.status(400).send("Error registering user");
        }
    }
);

//End point for Logging in a User.
app.post("/login",
    [
        check('email').isLength({ min: 5, max: 100 }).isEmail().normalizeEmail()
        //password validation is implemented in Authentication class.
    ],
    async (inRequest: any, inResponse: Response) => {
        try {
            validationResult(inRequest).throw();
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main.ts post /login", e);
            inResponse.status(400).send("Invalid email data entered");
            return;
        }

        try {
            const authentication: Authentication = new Authentication();
            let errorMessage: IErrorMessage = { message: "" };
            const user: IUserInfo | null = await authentication.authenticateUser(inRequest.body, errorMessage);
            if (user != null) {
                const regenSession = function (): Promise<boolean> {
                    return new Promise((inResolve, inReject) => {
                        inRequest.session.regenerate((inError: Error) => {
                            if (inError) {
                                inReject(inError);
                            } else {
                                inResolve(true);
                            }
                        });
                    });
                }
                //regen the session when a user logs in.
                logger.info("Old SessionId: " + inRequest.session.id + " main.ts post /login");
                await regenSession();
                logger.info("New SessionId: " + inRequest.session.id + " main.ts post /login");

                inRequest.session.loggedIn = true;
                inRequest.session.userEmail = inRequest.body.email;
                inRequest.session.userName = user.name;
                logger.info("SessionId: " + inRequest.session.id +
                    " main.ts post /login. User: " + inRequest.body.email +
                    " authenticated.");
                inResponse.status(200).send(user);
            } else {
                inRequest.session.loggedIn = false;
                logger.info("SessionId: " + inRequest.session.id +
                    " main.ts post /login. Login failed for request : " + inRequest.body.email);
                inResponse.status(400).send(errorMessage.message);
            }
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main.ts post /login", e);
            inRequest.session.loggedIn = false;
            inResponse.status(400).send("error");
        }
    }
);

//End point for Logging out a User.
app.post("/logout",
    async (inRequest: any, inResponse: Response) => {
        try {
            const authentication: Authentication = new Authentication();
            if (await authentication.destroySession(inRequest)) {
                inResponse.status(200).send("ok");
            } else {
                inResponse.status(500);
            }
        } catch (e) {
            logger.error("SessionId: " + inRequest.session.id + " main.ts post /logout", e);
            inResponse.status(500);
        }
    }
);


app.listen(80, function () {
    logger.info("PhilsHomePageWebApp listening for requests.")
});



