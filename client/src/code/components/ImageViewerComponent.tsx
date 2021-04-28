import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Chip from '@material-ui/core/Chip';
import ImageViewerMenu from "./PhotoImageViewerMenu";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

        },
        paper: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
        },

    }),
);

/**
* This is a mostly MaterialUI component used for displaying Photos in a Modal popup.
*/
export default function ImageViewer({ state }) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={state.viewImageViewer}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={state.viewImageViewer}>
                    <div className={classes.paper}>
                        <div id="imageModalContainer">
                        {state.userName != null && state.userName != "" &&
                            state.userName == state.currentImageUploadedByUser && 
                            <ImageViewerMenu    state={state} albumId={state.currentPhotoAlbumId} 
                                                photoName={state.currentSelectedPhoto} 
                                                uploadedByUser={state.currentImageUploadedByUser}/>}
                            <a href={"/albumid/" +
                                `${state.currentPhotoAlbumId}` + "/photofilename/" +
                                `${state.currentSelectedPhoto}`}
                                target="_blank">

                                <img id="imageViewerImage" src={"/albumid/" +
                                    `${state.currentPhotoAlbumId}` + "/photofilename/" +
                                    `${state.currentSelectedPhoto}`}
                                    onClick={() => { state.viewImageViewerModal(false); }} />
                            </a>

                        </div>
                        <div className="imageModalButtonContainer">
                            <Chip id="closeImageViewerButton" label="Close" variant="outlined" onClick={() => { state.viewImageViewerModal(false); }} />
                        </div>
                    </div>
                </Fade>
            </Modal>
        </div>
    );
}