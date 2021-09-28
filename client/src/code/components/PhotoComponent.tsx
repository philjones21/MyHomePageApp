import React, { Component } from "react";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import Image from 'material-ui-image'
import PaginationControl from "./PaginationComponent";
import { Constants } from "../Constants";
import InformationalMessageDialog from "./InformationalMessageDialog";
import ImageViewer from "./ImageViewerComponent";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            padding: theme.spacing(1),
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },
        input: {
            display: 'none',
        },
    }),
);

/**
* This is the top level Photos component that displays the PhotoAlbums thumbnails
* and Add New Photo and Image Viewer modal popups.
*/
const Photos = ({ state }) => {
    const classes = useStyles();
    let numberOfPhotos: number = 0;
    let selectedAlbumIndex: number = 0;
    let photosExist: boolean = false;

    for (let i = 0; i < state.photoAlbums.length; i++) {
        if (state.photoAlbums[i]._id === state.currentPhotoAlbumId) {
            selectedAlbumIndex = i;
            if (state.photoAlbums[i].photos != null) {
                numberOfPhotos = state.photoAlbums[i].photos.length;
            }
            break;
        }
    }

    let totalPages: number = numberOfPhotos / Constants.MAX_PHOTOS_PER_PAGE;
    totalPages = Math.ceil(totalPages);

    return (
        <section className="contentPhotoContainer">
            <section id="photoThumbnailsContainer">
                {state.photoAlbums[selectedAlbumIndex].photos != undefined && state.photoAlbums[selectedAlbumIndex].photos.map((photo, index) => (
                    index >= state.currentPhotoStartIndex && index <= state.currentPhotoEndIndex &&
                    <section className="photoThumbnails">

                        <Image src={"/albumid/" +
                            `${state.currentPhotoAlbumId}` + "/photofilename/" +
                            `${photo.photoThumbnailFileName}`}
                            onClick={() => { state.setCurrentImage(photo.photoFileName, photo.uploadedByUser); state.viewImageViewerModal(true); }} />

                    </section>))}
            </section>
            <section id="photo_toolbar">
                <div id="photo_toolbar_homeButton"><div className="button" onClick={() => { state.viewPhotoAlbums(); state.setPaginationPage(1); }}>Back</div></div>
                <div id="photo_toolbar_addButton">{state.loggedIn === true &&<div className="button" onClick={() => state.viewAddPhotoPopup(true)}>Add Photo</div>}</div>
            </section>
            <section className="paginationbar">
                <PaginationControl state={state} totalPages={totalPages} />
            </section>
            {createNewPhotoDialog(state, classes)}
            {state.viewImageViewer == true && <ImageViewer state={state} />}
            <InformationalMessageDialog state={state} />
        </section>


    );
}

function createNewPhotoDialog(state, classes) {
    return (
        <Dialog open={state.viewAddPhoto} onClose={() => state.viewAddPhotoPopup(false)} aria-labelledby="form-dialog-title"
            disableBackdropClick={true} disableEscapeKeyDown={true}>
            <DialogTitle id="form-dialog-title">Add Photo</DialogTitle>
            <form>
                <DialogContent>
                    <input name="imageFile" accept="image/*" className={classes.input} id="icon-button-file" type="file" onChange={state.fileOnChangeHandler} />
                    <label htmlFor="icon-button-file">
                        <IconButton color="primary" aria-label="upload picture" component="span">
                            <PhotoCamera />
                            <DialogContentText>(Required*)</DialogContentText>
                        </IconButton>

                    </label>

                    <TextField
                        autoFocus
                        margin="dense"
                        id="photoDescription"
                        label="Description"
                        type="text"
                        fullWidth
                        onChange={state.fieldChangeHandler}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => state.addPhoto()} color="primary">
                        Save
                    </Button>
                    <Button onClick={() => { state.resetUploadedFile; state.viewAddPhotoPopup(false); }} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default Photos;


