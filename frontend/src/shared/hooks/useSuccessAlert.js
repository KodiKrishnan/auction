import { useState } from "react";
 
const useSuccessAlert = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
 
    const showSuccess = (msg) => {
        setMessage(msg);
        setOpen(true);
    };
 
    const closeSuccess = () => {
        setOpen(false);
        setMessage("");
    };
 
    return {
        open,
        message,
        showSuccess,
        closeSuccess,
    };
};
 
export default useSuccessAlert;