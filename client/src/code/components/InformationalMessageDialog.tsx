import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Constants } from "../Constants";


/**
* This is a MaterialUI component that can be re-used to display Informational Messages.
*/

export default function InformationalMessageDialog({state}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
      <Dialog
        open={state.viewInformationalAlertMessage}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{state.alertMessageTitle !== null ? state.alertMessageTitle : "Info"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {state.alertMessageText}
            {state.alertMessageTitle === Constants.CONTACT && <a id="contacts_email" href="mailto:philjones21@yahoo.com">philjones21@yahoo.com</a>}
          </DialogContentText>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{handleClose;state.viewInformationalAlertMessagePopup(false);}} color="primary" autoFocus>
            ok
          </Button>
        </DialogActions>
      </Dialog>
  );
}