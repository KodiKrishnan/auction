import { Alert, Snackbar } from "@mui/material";
 
const SuccessAlert = ({ open, message, onClose }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={onClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <Alert
                severity="success"
                variant="filled"
                onClose={onClose}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};
 
export default SuccessAlert;
 
 