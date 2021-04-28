import React, { Component } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';

/**
* This is a MaterialUI Modal popup Component for logging in a user.
*/
const Login = ({ state }) => {

    return (
        <Dialog open={state.viewLogin} onClose={() => { state.viewLoginPopup(false); state.resetLoginFields(); }} aria-labelledby="form-dialog-title"
            disableBackdropClick={true} disableEscapeKeyDown={true}>
            <DialogTitle id="form-dialog-title">Login</DialogTitle>
            <form>
                <DialogContent>
                    <DialogContentText>{state.loginErrorMessage}</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="loginUserEmail"
                        label="Email (Required)"
                        type="email"
                        fullWidth
                        required
                        onChange={state.fieldChangeHandler}

                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="loginPassword"
                        label="Password (Required)*"
                        type="password"
                        fullWidth
                        onChange={state.fieldChangeHandler}
                    />
                    <a onClick={() => { state.viewLoginPopup(false); { state.viewRegisterPopup(true) }; state.resetLoginFields(); }}>
                        <DialogContentText>
                            <br/>Create new account
                        </DialogContentText>
                    </a>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {state.login();}} color="primary">
                        Submit
                    </Button>
                    <Button onClick={() => { state.viewLoginPopup(false); state.resetLoginFields(); }} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </form>

        </Dialog>

    )
}

export default Login;