import React, { Component } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';

/**
* This is a MaterialUI Modal popup Component for Registering a new user.
*/
const Register = ({ state }) => {

    return (
        <Dialog open={state.viewRegister} onClose={() => {state.viewRegisterPopup(false); state.resetRegisterFields();}} aria-labelledby="form-dialog-title"
            disableBackdropClick={true} disableEscapeKeyDown={true}>
            <DialogTitle id="form-dialog-title">Create New Account</DialogTitle>
            <form>
                <DialogContent>
                <DialogContentText>{state.loginErrorMessage}</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="registerUserName"
                        label="User Name (Required)"
                        type="text"
                        fullWidth
                        required
                        onChange={state.fieldChangeHandler}
                        helperText = "User name must be at least 2 characters"

                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="registerUserEmail"
                        label="Email (Required)"
                        type="email"
                        fullWidth
                        required
                        onChange={state.fieldChangeHandler}

                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="registerPassword"
                        label="Password (Required)"
                        type="password"
                        fullWidth
                        onChange={state.fieldChangeHandler}
                        required
                        helperText = "Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"

                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {state.register();}} color="primary">
                        Submit
                    </Button>
                    <Button onClick={() => {state.viewRegisterPopup(false); state.resetRegisterFields();}} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>

    )
}

export default Register;