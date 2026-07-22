import { Snackbar, Alert } from "@mui/material";

const GlobalError = ({ open, message, onClose }) => {

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{
                vertical: "top",
                horizontal: "center"
            }}
        >
            <Alert
                severity="error"
                variant="filled"
                onClose={onClose}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default GlobalError;