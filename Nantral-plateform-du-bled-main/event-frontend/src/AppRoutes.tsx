// Ce fichier gère les routes de l'application en fonction de l'authentification de l'utilisateur
// et redirige vers les pages appropriées 
import {useMemo} from "react";
import {Navigate,Route,Routes} from "react-router-dom"
import type {User} from "./utils/types"
import LoginPage from "./Page/LoginPage.tsx";
import SignupPage from "./Page/SignupPage.tsx";
import EventsPage from "./Page/EventsPage.tsx";

type AppRoutesProgs={
    user:User |null;
};

export default function AppRoutes({ user }: AppRoutesProgs){

    const token = localStorage.getItem("token");
    const isAuthenticated = useMemo(()=>Boolean(token && user),[token, user]) // Vérifie si l'utilisateur est authentifié SINON redirection vers la page de connexion
    
    return(
        <Routes>
            <Route 
                path="/"
                element={
                    isAuthenticated ?(
                        <Navigate to="/events" replace/>
                    ): (
                        <LoginPage/>
                    )
                }
            />
            <Route 
                path="/login"
                element={
                    isAuthenticated ?( // Si l'utilisateur est déjà connecté, redirige vers la page des événements
                        <Navigate to="/events" replace/>
                    ): ( // Sinon, affiche la page de connexion
                        <LoginPage/>
                    )
                }
            />
            <Route 
                path="/signup"
                element={
                    isAuthenticated ?(
                        <Navigate to="/events" replace/>
                    ): ( // Sinon, affiche la page d'inscription
                        <SignupPage/>
                    )
                }
            />
            <Route 
                path="/events"
                element={
                    isAuthenticated ?(
                        <EventsPage/>
                    ): (
                        <Navigate to="/login" replace/>
                    )
                }
            />
        </Routes>
    );
}