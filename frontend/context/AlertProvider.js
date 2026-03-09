import { useState, createContext } from "react";

export const AlertContext = createContext()

export const AlertProvider = ({children}) => {
    const [modal, setModal] = useState({
        visible: false,
        message: "",
        type:null
    })

    const showModal = (message,type) => {
        setModal({
            visible: true,
             message,
             type
        })
    }

    const hideModal = () => {
        setModal({
            visible: false,
            message: "",
            type:null
        })
    }

    return(
        <AlertContext.Provider value = {{modal, showModal, hideModal}}>
            {children}
        </AlertContext.Provider>
    )
    
}
