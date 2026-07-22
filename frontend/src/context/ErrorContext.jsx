import { createContext, useContext, useState } from "react";

import GlobalError from "../components/GlobalError";

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {

    const [open, setOpen] = useState(false);

    const [message, setMessage] = useState("");

    const showError = (msg) => {
        setMessage(msg);
        setOpen(true);
    };

    const closeError = () => {
        setOpen(false);
        setMessage("");
    };

    return (
        <ErrorContext.Provider value={{ showError }}>

            {children}

            <GlobalError
                open={open}
                message={message}
                onClose={closeError}
            />

        </ErrorContext.Provider>
    );
};

export const useError = () => useContext(ErrorContext);