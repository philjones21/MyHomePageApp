import { IPhotoAlbum } from "./PhotoAlbum";
import * as PhotoAlbum from "./PhotoAlbum";
import { IBlogs } from "./Blogs";
import * as Blogs from "./Blogs";
import * as Photo from "./Photo";
import { Constants } from "./Constants";
import { IPhoto } from "./Photo";


/**
 * The client app should only call createState() once in the top level component.
 * This function will return State data and mutator functions that can be 
 * passed down to child components that need state data.
 * @param inParentComponent top level react component
 * @returns a State Object
 */
export function createState(inParentComponent) {

    return {

        //blog state data
        viewAddBlog: false,
        blogEntries: [],
        blogTitle: null,
        blogArticle: null,
        blogEmbedURL: null,
        currentBlogsStartIndex: 0,
        currentBlogsEndIndex: Constants.MAX_BLOG_ENTRIES_PER_PAGE - 1,

        //album state data
        currentPhotoAlbumId: null,
        currentPhotoAlbumName: null,
        currentAlbumsStartIndex: 0,
        currentAlbumsEndIndex: Constants.MAX_ALBUMS_PER_PAGE - 1,
        viewAddAlbum: false,
        photoAlbums: [],
        albumName: null,
        albumDescription: null,

        //photo state data
        currentSelectedPhoto: null,
        currentImageUploadedByUser: null,
        currentPhotoPage: 1,//default to 1 first time page loads
        currentPhotoStartIndex: 0,
        currentPhotoEndIndex: Constants.MAX_PHOTOS_PER_PAGE - 1,
        paginationPage: 1,
        photoName: null,
        photoFileName: null,
        photoDescription: null,
        photoParentAlbumId: null,
        viewAddPhoto: null,
        viewImageViewer: null,
        uploadedFile: null,

        //misc state data
        pleaseWaitVisible: false,
        currentView: Constants.BLOG_VIEW, //initialize to Blogs view when page first renders.

        viewLogin: null,
        viewRegister: null,

        registerPassword: null,
        registerUserName: null,
        loginPassword: null,
        loginUserName: null,
        loginUserEmail: null,

        loginErrorMessage: null,
        loggedIn: false,
        userName: null,

        alertMessageText: null,
        viewInformationalAlertMessage: null,
        tabIndex: 0,

        /**
        * This function is used whenever a server call is made and the user should be 
        * prevented from performing multiple actions at the same time.
        * @param inVisible 
        */
        showHidePleaseWait: function (inVisible: boolean): void {
            this.setState({ pleaseWaitVisible: inVisible });
        }.bind(inParentComponent),

        /**
        * Enforce max length for UI fields. Most fields in app should 
        * never be greater than 250 chars.
        * @param inEvent     
        */
        fieldChangeHandler: function (inEvent: any): void {
            if (inEvent.target.value.length > 250) {
                inEvent.target.value = inEvent.target.value.substring(0, 250)
            }
            this.setState({ [inEvent.target.id]: inEvent.target.value });
        }.bind(inParentComponent),

        /**
        * Enforce max length for Blog Article field.
        * @param inEvent
        */
        fieldChangeHandlerForBlogArticle: function (inEvent: any): void {
            if (inEvent.target.value.length > Constants.MAX_BLOG_ARTICLE_CHARS) {
                inEvent.target.value = inEvent.target.value.substring(0, Constants.MAX_BLOG_ARTICLE_CHARS)
            }
            this.setState({ [inEvent.target.id]: inEvent.target.value });
        }.bind(inParentComponent),

        /**
        * Set the selected Tab in the UI.
        * @param inTabIndex  
        */
        setTabIndex: function(inTabIndex: number): void{
            this.setState({ tabIndex: inTabIndex });
        }.bind(inParentComponent),

        /**
        * Used to display info/error messages on some of the dialog popups
        * @param inText     
        */
        informationalAlertMessage: function (inText: string): void {
            this.setState({ alertMessageText: inText });
            this.state.viewInformationalAlertMessagePopup(true);
        }.bind(inParentComponent),

        /**
        * Used to display/hide error message popup
        * @param inVisible
        */
        viewInformationalAlertMessagePopup: function (inVisible: boolean): void {
            this.setState({ viewInformationalAlertMessage: inVisible });
        }.bind(inParentComponent),

        /**
        * Used to display/hide the ImageViewer popup
        * @param inVisible    
        */
        viewImageViewerModal: function (inVisible: boolean): void {
            if (inVisible == false) {
                this.setState({
                    viewImageViewer: inVisible,
                    currentImageUploadedByUser: null,
                });
            } else {
                this.setState({ viewImageViewer: inVisible });
            }
        }.bind(inParentComponent),
        
        /**
        * Used to display/hide the AddAlbum popup
        * @param inVisible      
        */
        viewAddAlbumPopup: function (inVisible: boolean): void {
            this.setState({ viewAddAlbum: inVisible });
        }.bind(inParentComponent),

        /**
        * Used to display/hide the AddBlog popup
        * @param inVisible 
        */
        viewAddBlogPopup: function (inVisible: boolean): void {
            this.setState({ viewAddBlog: inVisible });
        }.bind(inParentComponent),


        /**
        * Call to server for list of PhotoAlbums      
        */
        listPhotoAlbums: async function (): Promise<void> {
            const photoAlbumWorker: PhotoAlbum.Worker = new PhotoAlbum.Worker();
            this.state.showHidePleaseWait(true);
            try {
                const photoAlbums: PhotoAlbum.IPhotoAlbum[] = await photoAlbumWorker.listPhotoAlbums();
                this.state.addMultiPhotoAlbumsArray(photoAlbums);
            } catch (e) {

            }
            this.state.showHidePleaseWait(false);
        }.bind(inParentComponent),


        /**
         * Call to server for list of BlogEntries
        */
        listBlogs: async function (): Promise<void> {
            const blogsWorker: Blogs.Worker = new Blogs.Worker();
            this.state.showHidePleaseWait(true);
            try {
                const blogs: Blogs.IBlogs[] = await blogsWorker.listBlogs();
                this.state.addMultiBlogsArray(blogs);
            } catch (e) {

            }
            this.state.showHidePleaseWait(false);
        }.bind(inParentComponent),


        /**
         * Call to server to add a BlogEntry
        */
        addBlog: async function (): Promise<void> {
            if (this.state.blogTitle.length < 1) { return; }
            if (!this.state.loggedIn) {
                this.state.informationalAlertMessage("User must be logged in");
                return;
            }

            this.state.viewAddBlogPopup(false);

            // Save to server.
            this.state.showHidePleaseWait(true);
            try {
                const blogsWorker: Blogs.Worker = new Blogs.Worker();
                const blog: Blogs.IBlogs =
                    await blogsWorker.addBlog({
                        blogTitle: this.state.blogTitle,
                        originalAuthor: this.state.userName,
                        blogArticle: this.state.blogArticle,
                        blogEmbedURL: this.state.blogEmbedURL,
                    });
                // Add to list.
                if (blog != null) {
                    const newBlogArray: IBlogs[] = [blog];
                    for (let i: number = 0; i < this.state.blogEntries.length; i++) {
                        newBlogArray.push(this.state.blogEntries[i]);
                    }
                    // Update state.
                    this.setState({ blogEntries: newBlogArray});
                }
            } catch (e) {
                if (e.response && e.response.data) {
                    if (e.response.data.indexOf("error: logged out") > -1) {
                        this.setState({ loggedIn: false });
                        this.state.informationalAlertMessage("User must log in");
                    } else if (e.response.data.indexOf("error:") > -1) {
                        this.state.informationalAlertMessage(e.response.data);
                    }
                }
            }
            this.setState({blogTitle: "", blogArticle: "", blogEmbedURL: "" });
            this.state.showHidePleaseWait(false);
        }.bind(inParentComponent),


        /**
         * Call to server to add PhotoAlbum
        */
        addPhotoAlbum: async function (): Promise<void> {

            if (this.state.albumName.length < 1) { return; }
            if (!this.state.loggedIn) {
                this.state.informationalAlertMessage("User must be logged in");
                return;
            }

            this.state.viewAddAlbumPopup(false);

            // Save to server.
            this.state.showHidePleaseWait(true);
            try {
                const photoAlbumWorker: PhotoAlbum.Worker = new PhotoAlbum.Worker();
                const photoAlbum: PhotoAlbum.IPhotoAlbum =
                    await photoAlbumWorker.addPhotoAlbum({
                        albumName: this.state.albumName,
                        originalAuthor: this.state.userName,
                        albumDescription: this.state.albumDescription,
                        numberOfFiles: 0,
                        photos: [],
                    });
                // Add to list.
                if (photoAlbum != null) {
                    const newPhotoAlbumArray: IPhotoAlbum[] = [photoAlbum];
                    for (let i: number = 0; i < this.state.photoAlbums.length; i++) {
                        newPhotoAlbumArray.push(this.state.photoAlbums[i]);
                    }
                    // Update state.
                    this.setState({ photoAlbums: newPhotoAlbumArray, albumName: "", albumDescription: "" });
                }
            } catch (e) {
                if (e.response && e.response.data) {
                    if (e.response.data.indexOf("error: logged out") > -1) {
                        this.setState({ loggedIn: false });
                        this.state.informationalAlertMessage("User must log in");
                    } else if (e.response.data.indexOf("error:") > -1) {
                        this.state.informationalAlertMessage(e.response.data);
                    }
                }
            }
            this.state.showHidePleaseWait(false);
        }.bind(inParentComponent),


        /**
         * Call to server to delete a Photo
         * @param inAlbumId
         * @param inPhotoName
         * @param inUploadedByUser
         */
        deletePhoto: async function (inAlbumId, inPhotoName, inUploadedByUser): Promise<void> {
            if (!confirm("Are you sure you want to delete this Photo?")) {
                return;
            }
            this.state.viewImageViewerModal(false);

            if (!this.state.loggedIn) {
                this.state.informationalAlertMessage("User must be logged in");
                return;
            }

            if (inUploadedByUser !== this.state.userName.toString()) {
                this.state.informationalAlertMessage("Users can only delete Photos they originally uploaded");
                return;
            }

            this.state.showHidePleaseWait(true);
            let message: string = "";

            try {
                const photoWorker: Photo.Worker = new Photo.Worker();
                message = await photoWorker.deletePhoto(inAlbumId, inPhotoName);
                if (message !== "ok") {
                    this.state.informationalAlertMessage("Error encountered during delete operation");
                } else {
                    const photoAlbumArrayCopy: PhotoAlbum.IPhotoAlbum[] = this.state.photoAlbums.slice(0);

                    for (let i: number = 0; i < photoAlbumArrayCopy.length; i++) {
                        if (photoAlbumArrayCopy[i]._id == this.state.currentPhotoAlbumId) {
                            const newPhotosArray: IPhoto[] = [];
                            for (let j: number = 0; j < photoAlbumArrayCopy[i].photos.length; j++) {
                                if (photoAlbumArrayCopy[i].photos[j].photoFileName !== inPhotoName) {
                                    newPhotosArray.push(photoAlbumArrayCopy[i].photos[j]);
                                }
                            }
                            photoAlbumArrayCopy[i].photos = newPhotosArray;
                            photoAlbumArrayCopy[i].numberOfFiles = newPhotosArray.length;
                            break;
                        }
                    }
                    this.setState({ photoAlbums: photoAlbumArrayCopy });

                }
            } catch (e) {
                if (e.response && e.response.data) {
                    if (e.response.data.indexOf("error: logged out") > -1) {
                        this.setState({ loggedIn: false });
                        this.state.informationalAlertMessage("User must log in");
                    } else {
                        this.state.informationalAlertMessage("Error encountered during delete operation");
                    }
                } else {
                    this.state.informationalAlertMessage("Error encountered during delete operation");
                }
            }
            this.state.showHidePleaseWait(false);

        }.bind(inParentComponent),

        /**
        * Call to server to delete a PhotoAlbum
        * @param inId albumId
        * @param inOriginalAuthor     
        */
        deletePhotoAlbum: async function (inId, inOriginalAuthor): Promise<void> {
            if (!confirm("Are you sure you want to delete the Album and all the contained Photos?")) {
                return;
            }
            const id: string = inId.albumId;
            const originalAuthor = inOriginalAuthor.originalAuthor;
            if (!this.state.loggedIn) {
                this.state.informationalAlertMessage("User must be logged in");
                return;
            }

            if (originalAuthor.localeCompare(this.state.userName.toString())) {
                this.state.informationalAlertMessage("Users can only delete albums they originally authored");
                return;
            }

            this.state.showHidePleaseWait(true);
            let message: string = "";

            try {
                const photoAlbumWorker: PhotoAlbum.Worker = new PhotoAlbum.Worker();
                message = await photoAlbumWorker.deletePhotoAlbum(id);
                if (message !== "ok") {
                    this.state.informationalAlertMessage("Error encountered during delete operation");
                } else {
                    const newPhotoAlbums: IPhotoAlbum[] = [];
                    for (let i = 0; i < this.state.photoAlbums.length; i++) {
                        if (this.state.photoAlbums[i]._id != id) {
                            newPhotoAlbums.push(this.state.photoAlbums[i]);
                        }
                    }
                    this.setState({ photoAlbums: newPhotoAlbums });
                }
            } catch (e) {
                if (e.response && e.response.data) {
                    if (e.response.data.indexOf("error: logged out") > -1) {
                        this.setState({ loggedIn: false });
                        this.state.informationalAlertMessage("User must log in");
                    } else if (e.response.data.indexOf("error message:") > -1) {
                        this.state.informationalAlertMessage(e.response.data);
                    } else {
                        this.state.informationalAlertMessage("Error encountered during delete operation");
                    }
                } else {
                    this.state.informationalAlertMessage("Error encountered during delete operation");
                }
            }
            this.state.showHidePleaseWait(false);
        }.bind(inParentComponent),


        /**
        * Call to server to delete a BlogEntry
        * @param inId blogId
        * @param inOriginalAuthor     
        */
        deleteBlog: async function (inId, inOriginalAuthor): Promise<void> {
            if (!confirm("Are you sure you want to delete this Blog Post?")) {
                return;
            }
            const id: string = inId.blogId;
            const originalAuthor = inOriginalAuthor.originalAuthor;
            if (!this.state.loggedIn) {
                this.state.informationalAlertMessage("User must be logged in");
                return;
            }

            if (originalAuthor.localeCompare(this.state.userName.toString())) {
                this.state.informationalAlertMessage("Users can only delete albums they originally authored");
                return;
            }

            this.state.showHidePleaseWait(true);
            let message: string = "";

            try {
                const blogWorker: Blogs.Worker = new Blogs.Worker();
                message = await blogWorker.deleteBlog(id);
                if (message !== "ok") {
                    this.state.informationalAlertMessage("Error encountered during delete operation");
                } else {
                    const newBlogEntries: IBlogs[] = [];
                    for (let i = 0; i < this.state.blogEntries.length; i++) {
                        if (this.state.blogEntries[i]._id != id) {
                            newBlogEntries.push(this.state.blogEntries[i]);
                        }
                    }
                    this.setState({ blogEntries: newBlogEntries });
                }
            } catch (e) {
                if (e.response && e.response.data) {
                    if (e.response.data.indexOf("error: logged out") > -1) {
                        this.setState({ loggedIn: false });
                        this.state.informationalAlertMessage("User must log in");
                    } else if (e.response.data.indexOf("error message:") > -1) {
                        this.state.informationalAlertMessage(e.response.data);
                    } else {
                        this.state.informationalAlertMessage("Error encountered during delete operation");
                    }
                } else {
                    this.state.informationalAlertMessage("Error encountered during delete operation");
                }
            }
            this.state.showHidePleaseWait(false);
        }.bind(inParentComponent),

        /**
        * Used to add a new PhotoAlbum to the photoAlbums[] array. This function
        * makes a copy of the existing array using slice() and then saves it back to State.
        * @param inPhotoAlbum     
        */
        addPhotoAlbumToArray: function (inPhotoAlbum: PhotoAlbum.IPhotoAlbum): void {
            // Copy list.
            const photoAlbumArrayCopy: PhotoAlbum.IPhotoAlbum[] = this.state.photoAlbums.slice(0);
            // Add new element.
            photoAlbumArrayCopy.push(inPhotoAlbum);
            // Update list in state.
            this.setState({ photoAlbums: photoAlbumArrayCopy });
        }.bind(inParentComponent),

        /**
        * This function replaces all the PhotoAlbums in the state.photoAlbums[] array.
        * @param inPhotoAlbums
        */
        addMultiPhotoAlbumsArray: function (inPhotoAlbums: IPhotoAlbum[]): void {
            this.setState({ photoAlbums: inPhotoAlbums });
        }.bind(inParentComponent),

        /**
        * This function replaces all the Blogs in the state.blogs[] array.
        * @param inBlogs     
        */
        addMultiBlogsArray: function (inBlogs: IBlogs[]): void {
            this.setState({ blogEntries: inBlogs });
        }.bind(inParentComponent),

        /**
        * sets the currentView which is how the Blog, PhotoAlbums, and Photos components
        * get displayed in the UI
        * @param inView     
        */
        setCurrentView: function (inView: string): void {
            this.setState({ currentView: inView });
        }.bind(inParentComponent),


        /**
        * sets the currentView and other fields needed in order to view Photos UI
        * @param inId albumId
        * @param inAlbumName     
        */
        viewPhotos: function (inId: string, inAlbumName: string): void {
            this.setState({
                currentPhotoAlbumId: inId,
                currentPhotoAlbumName: inAlbumName,
                currentView: Constants.PHOTOS_VIEW,
            });
            this.state.resetPhotosPaginationIndex();
            window.scrollTo(0, 0);
        }.bind(inParentComponent),

        /*
        * sets the currentView and other fields needed in order to view PhotoAlbums UI       
        */
        viewPhotoAlbums: function () {
            this.state.listPhotoAlbums();
            this.setState({
                currentPhotoAlbumId: null,
                currentPhotoAlbumName: null,
                currentView: Constants.ALBUMS_VIEW
            });
            this.state.resetPhotoAlbumsPaginationIndex();
            window.scrollTo(0, 0);

        }.bind(inParentComponent),

        /**
        * sets the currentView and other fields needed in order to view Blogs UI
        */
        viewBlog: function () {
            this.state.listBlogs();
            this.setState({
                currentView: Constants.BLOG_VIEW
            });
            this.state.resetBlogPaginationIndex();
            window.scrollTo(0, 0);

        }.bind(inParentComponent),

        /**
         * sets Pagination fields for PhotoAlbums UI
        */
        resetPhotoAlbumsPaginationIndex: function () {
            this.setState({
                currentAlbumsStartIndex: 0,
                currentAlbumsEndIndex: Constants.MAX_ALBUMS_PER_PAGE - 1,
            });
            this.state.setPaginationPage(1);
        }.bind(inParentComponent),

        /**
         * sets Pagination fields for Photos UI
        */
        resetPhotosPaginationIndex: function () {
            this.setState({
                currentPhotoStartIndex: 0,
                currentPhotoEndIndex: Constants.MAX_PHOTOS_PER_PAGE - 1,
            });
            this.state.setPaginationPage(1);
        }.bind(inParentComponent),

        /**
         * sets Pagination fields for Blog UI
        */
        resetBlogPaginationIndex: function () {
            this.setState({
                currentBlogsStartIndex: 0,
                currentBlogsEndIndex: Constants.MAX_BLOG_ENTRIES_PER_PAGE - 1,
            });
            this.state.setPaginationPage(1);
        }.bind(inParentComponent),

        /**
         * Used by Pagination Component so the correct page is selected in UI
         * @param inPage
        */
        setPaginationPage: function (inPage: number): void {
            this.setState({ paginationPage: inPage });
        }.bind(inParentComponent),

        /**
         *  sets the current selected PhotoAlbum
         * @param currentPhotoAlbumId
        */
        setCurrentPhotoAlbum: function (inCurrentPhotoAlbumId: string): void {
            this.setState({ currentPhotoAlbumId: inCurrentPhotoAlbumId });
        }.bind(inParentComponent),

        /**
        * Sets the current selected Image Name and original upload User
        * @param inCurrentImageFileName
        * @param inCurrentImageUploadedByUser     
        */
        setCurrentImage: function (inCurrentImageFileName: string, inCurrentImageUploadedByUser): void {
            this.setState({
                currentSelectedPhoto: inCurrentImageFileName,
                currentImageUploadedByUser: inCurrentImageUploadedByUser
            });
        }.bind(inParentComponent),

        /**
         * hide/show Add Photo popup
         * @param inVisible    
        */
        viewAddPhotoPopup: function (inVisible: boolean): void {
            this.setState({ viewAddPhoto: inVisible });
        }.bind(inParentComponent),

        /**
         * hide/show ImageViewer popup
         * @param inVisible
        */
        viewImagePopup: function (inVisible: boolean): void {
            this.setState({ viewImage: inVisible });
        }.bind(inParentComponent),

        /**
         * hide/show Login popup
         * @param inVisible     
        */
        viewLoginPopup: function (inVisible: boolean): void {
            this.setState({ viewLogin: inVisible });
        }.bind(inParentComponent),

        /**
         * hide/show Register User popup
         * @param inVisible      
        */
        viewRegisterPopup: function (inVisible: boolean): void {
            this.setState({ viewRegister: inVisible });
        }.bind(inParentComponent),

        /**
         * set error message that displays on Login popup
        */
        resetLoginMessage: function (): void {
            this.setState({ loginErrorMessage: null });
        }.bind(inParentComponent),

        /**
         * reset the text fields on the Login Popup
        */
        resetLoginFields: function (): void {
            this.setState({
                loginUserEmail: null,
                loginPassword: null,
                loginErrorMessage: null,
            });
        }.bind(inParentComponent),

        /**
         * reset the text fields on the Register Popup
        */
        resetRegisterFields: function (): void {
            this.setState({
                registerUserName: null,
                registerUserEmail: null,
                registerPassword: null,
                loginErrorMessage: null,
            });
        }.bind(inParentComponent),

        /**
         * Call to server to add a Photo
        */
        addPhoto: async function (): Promise<void> {
            if (this.state.uploadedFile == null) { return; }

            if (!this.state.loggedIn) {
                this.state.informationalAlertMessage("User must be logged in");
                return;
            }

            if (!this.state.validateFile(this.state.uploadedFile)) { return; }

            this.state.viewAddPhotoPopup(false);

            this.state.showHidePleaseWait(true);

            const photoFileAndInfo = new FormData();
            photoFileAndInfo.append("imageFile", this.state.uploadedFile);
            photoFileAndInfo.append("_id", this.state.currentPhotoAlbumId);
            photoFileAndInfo.append("albumName", this.state.currentPhotoAlbumName);

            if (this.state.photoDescription != null) {
                photoFileAndInfo.append("photoDescription", this.state.photoDescription);
            } else {
                photoFileAndInfo.append("photoDescription", "");
            }
            try {
                const photoWorker: Photo.Worker = new Photo.Worker();
                const photo: IPhoto = await photoWorker.addPhoto(photoFileAndInfo);
                if (photo != null && photo != undefined) {
                    const photoAlbumArrayCopy: PhotoAlbum.IPhotoAlbum[] = this.state.photoAlbums.slice(0);

                    for (let i: number = 0; i < photoAlbumArrayCopy.length; i++) {
                        if (photoAlbumArrayCopy[i]._id == this.state.currentPhotoAlbumId) {
                            if (photoAlbumArrayCopy[i].photos == null || photoAlbumArrayCopy[i].photos == undefined) {
                                photoAlbumArrayCopy[i].photos = [];
                            }
                            photoAlbumArrayCopy[i].photos.push(photo);
                            photoAlbumArrayCopy[i].numberOfFiles += 1;
                            break;
                        }
                    }
                    this.setState({ photoAlbums: photoAlbumArrayCopy });

                }
            } catch (e) {
                if (e.response && e.response.data) {
                    if (e.response.data.indexOf("error: logged out") > -1) {
                        this.setState({ loggedIn: false });
                        this.state.informationalAlertMessage("User must log in");
                    } else {
                        this.state.informationalAlertMessage("Error encountered during add photo operation");
                    }
                } else {
                    this.state.informationalAlertMessage("Error encountered during add photo operation");
                }
            }
            this.state.showHidePleaseWait(false);
        }.bind(inParentComponent),

        /**
         * updates the uploaded photo file onChange
         * @param inEvent  
        */
        fileOnChangeHandler: function (inEvent: any): void {
            const file: File = inEvent.target.files[0];

            if (this.state.validateFile(file)) {
                this.setState({
                    uploadedFile: file,
                });
            } else {
                this.setState({
                    uploadedFile: null,
                });
                inEvent.target.value = null;
            }
        }.bind(inParentComponent),

        /**
         * resets/nulls the uploaded photo file
        */
        resetUploadedFile: function (): void {
            this.setState({
                uploadedFile: null
            });
        }.bind(inParentComponent),

        /**
        * Does some photo file validation on client side.  Server side also 
        * validates, but this attempts to catch a problem before making a 
        * server call.
        * @param inFile      
        * @returns boolean
        */
        validateFile: function (inFile: any): boolean {
            if (inFile.size > Constants.MAX_PHOTO_FILE_SIZE) {
                this.state.informationalAlertMessage("File is too large, please pick a smaller file");
                return false;
            }

            if (Constants.VALID_MIME_TYPES.indexOf(inFile.type) < 0) {
                this.state.informationalAlertMessage("File type is not allowed for upload");
                return false;
            }

            return true;

        }.bind(inParentComponent),


        /**
        * sets the start and end indexes so the UI displays the correct
        * indexes for the photos, photoAlbums, and Blogs arrays for the 
        * implementation of pagination.
        * @param pageNumber     
        */
        setDisplayForPagination: function (pageNumber): void {
            if (this.state.currentView === Constants.PHOTOS_VIEW) {
                this.setState({
                    currentPhotoStartIndex: ((pageNumber * Constants.MAX_PHOTOS_PER_PAGE) - Constants.MAX_PHOTOS_PER_PAGE),
                    currentPhotoEndIndex: ((pageNumber * Constants.MAX_PHOTOS_PER_PAGE) - 1)
                });
            } else if (this.state.currentView === Constants.ALBUMS_VIEW) {
                this.setState({
                    currentAlbumsStartIndex: ((pageNumber * Constants.MAX_ALBUMS_PER_PAGE) - Constants.MAX_ALBUMS_PER_PAGE),
                    currentAlbumsEndIndex: ((pageNumber * Constants.MAX_ALBUMS_PER_PAGE) - 1)
                });
            } else if (this.state.currentView === Constants.BLOG_VIEW) {
                this.setState({
                    currentBlogsStartIndex: ((pageNumber * Constants.MAX_BLOG_ENTRIES_PER_PAGE) - Constants.MAX_BLOG_ENTRIES_PER_PAGE),
                    currentBlogsEndIndex: ((pageNumber * Constants.MAX_BLOG_ENTRIES_PER_PAGE) - 1)
                });
            }
        }.bind(inParentComponent),

        /**
         * Call to server to register a User
        */
        register: async function (): Promise<void> {
            if (this.state.validateRegisterInputFields()) {

                this.state.showHidePleaseWait(true);
                try {
                    const photoAlbumWorker: PhotoAlbum.Worker = new PhotoAlbum.Worker();
                    const message: string = await photoAlbumWorker.register({
                        name: this.state.registerUserName,
                        password: this.state.registerPassword,
                        email: this.state.registerUserEmail,
                    });
                    this.state.resetRegisterFields();
                    this.setState({
                        loginErrorMessage: "New user successfully created. Please login.",
                    });
                    this.state.viewRegisterPopup(false);
                    this.state.viewLoginPopup(true);
                } catch (e) {
                    if (e.response && e.response.data) {
                        this.setState({
                            loginErrorMessage: e.response.data,
                        });
                    }
                }
                this.state.showHidePleaseWait(false);
            }
        }.bind(inParentComponent),

        /**
        * Validate input fields for registering a user on the client side
        * Server side also validated, but this attempts to catch problems
        * before making the server call.          
        * @returns boolean     
        */
        validateRegisterInputFields: function (): boolean {
            let error: string = "";
            let valid: boolean = true;

            if (this.state.registerPassword == null || this.state.registerUserEmail == null ||
                this.state.registerUserName == null) {
                error = "Registration info is incomplete.";
                this.setState({
                    loginErrorMessage: error,
                });
                return false;
            }

            if (this.state.registerUserName.length < Constants.MIN_USER_NAME_CHARS) {
                error += "User name is less than " + Constants.MIN_USER_NAME_CHARS + " characters. ";
                valid = false;
            }

            if (this.state.registerUserName.length > Constants.MAX_USER_NAME_CHARS) {
                error += "User name is greater than " + Constants.MAX_USER_NAME_CHARS + " characters. ";
                valid = false;
            }

            this.setState({
                loginErrorMessage: error,
            });

            return valid;
        }.bind(inParentComponent),

        /**
         * Call to server to login a User
        */
        login: async function (): Promise<void> {
            try {
                this.state.showHidePleaseWait(true);
                const photoAlbumWorker: PhotoAlbum.Worker = new PhotoAlbum.Worker();
                const user: PhotoAlbum.IUserInfo = await photoAlbumWorker.login({
                    email: this.state.loginUserEmail,
                    password: this.state.loginPassword,
                });
                this.state.resetLoginFields();
                if (user != null) {
                    this.setState({
                        loggedIn: true,
                        userName: user.name,
                    });
                }
                this.state.viewLoginPopup(false);
            } catch (e) {
                if (e.response && e.response.data) {
                    this.setState({
                        loginErrorMessage: e.response.data,
                    });
                }
            }
            this.state.showHidePleaseWait(false);
        }.bind(inParentComponent),

        /**
         * Call to server to logout a User
        */
        logout: async function (): Promise<void> {
            try {
                this.state.showHidePleaseWait(true);
                const photoAlbumWorker: PhotoAlbum.Worker = new PhotoAlbum.Worker();
                const message: string = await photoAlbumWorker.logout();

                if (message === "ok") {
                    this.setState({
                        loggedIn: false,
                        userName: null
                    });
                }

            } catch (e) {

            }
            this.state.showHidePleaseWait(false);
        }.bind(inParentComponent),
    }
}