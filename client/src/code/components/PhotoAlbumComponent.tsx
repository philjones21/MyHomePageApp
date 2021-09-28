import React, { Component } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import PhotoAlbumRow from "./PhotoAlbumRowComponent";
import PaginationControl from "./PaginationComponent";
import { Constants } from "../Constants";

/**
* This is the top level PhotoAlbums component and contains the Add Photo Album dialog popup.
*/
const PhotoAlbums = ({ state }) => {
    let numberOfAlbums: number = 0;

    if (state.photoAlbums.length > 0) {
        numberOfAlbums = state.photoAlbums.length;
    }

    let totalPages: number = numberOfAlbums / Constants.MAX_ALBUMS_PER_PAGE;
    totalPages = Math.ceil(totalPages);

    return (
        <section>
            <section className="contentAlbumContainer" >

                <section id="album_toolbar">
                    <div id="album_toolbar_createdBy">Created By</div>
                    <div id="album_toolbar_numberOfPhotos"># of Photos</div>
                </section>

                {state.photoAlbums.map((row, index) => (
                    index >= state.currentAlbumsStartIndex && index <= state.currentAlbumsEndIndex && <PhotoAlbumRow state={state} row={row} />
                ))}
                <div id="album_toolbar_addButton">{state.loggedIn == true && <div className="button" onClick={() => state.viewAddAlbumPopup(true)}>Add Album</div>}</div>
                <section className="paginationbar">
                    <PaginationControl state={state} totalPages={totalPages} />
                </section>

                <Dialog open={state.viewAddAlbum} onClose={() => state.viewAddAlbumPopup(false)} aria-labelledby="form-dialog-title"
                    disableBackdropClick={true} disableEscapeKeyDown={true}>
                    <DialogTitle id="form-dialog-title">Add Photo Album</DialogTitle>
                    <form>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="albumName"
                                label="Album Name (Required)"
                                type="text"
                                fullWidth
                                required
                                onChange={state.fieldChangeHandler}

                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="albumDescription"
                                label="Description"
                                type="text"
                                fullWidth
                                onChange={state.fieldChangeHandler}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => state.addPhotoAlbum()} color="primary">
                                Save
                            </Button>
                            <Button onClick={() => state.viewAddAlbumPopup(false)} color="primary">
                                Cancel
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </section>
        </section >
    )
}



export default PhotoAlbums;


