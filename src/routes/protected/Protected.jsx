import { Navigate } from "react-router-dom";

const Protected = ({children}) => {
    const token = localStorage.getItem('token');
    if(!token){
        return<Navigate to="/login" replace />;
    } else return children;
}

export default Protected;