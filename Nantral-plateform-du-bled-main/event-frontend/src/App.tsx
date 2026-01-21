// Quand on ouvre localhost:5173 Ce fichier sert a la racine de l'application React et gère l'authentification de l'utilisateur

import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css'
import type {User} from "./utils/types";
import { valiateToken } from './API/auth-actions';
import AppRoutes from './AppRoutes';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => { 
    const token = localStorage.getItem("token");
    // localStorage = mémoire du navigateur
    // Au premier lancement: localStorage est vide
    // token = null
    if (!token) {
      return;   
    }
    
    valiateToken() // Vérifie la validité du token stocké
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, []);

  return (// Passe l'utilisateur authentifié a AppRoutes
    <BrowserRouter>
      <AppRoutes  user={user}/> 
    </BrowserRouter>
  );
  
}
