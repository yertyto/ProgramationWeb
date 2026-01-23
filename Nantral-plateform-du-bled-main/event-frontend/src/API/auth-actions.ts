// Pour la connexion avec le backend 
// et la gestion des utilisateurs ( signup, login, valiateToken )

const API_BASE_URL = "http://localhost:5000";

export async function apiSignup(username: string, email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Signup failed");
  return data; 
}

// Fonction connexion 
export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/login`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json(); 
  if (!res.ok) throw new Error(data?.error || "Login failed");
  return data; // {token}
}


export async function apiValidate(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/validate`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Validate failed");
  return data; 
}

export async function login(username: string, password: string) {
  const data = await apiLogin(username, password);
  localStorage.setItem("token", data.token);
  

  const userData = await apiValidate(data.token);
  if (userData.user?.id) {
    localStorage.setItem("userId", userData.user.id.toString());
  }
  
  return data;
}

export async function signup(username: string, email: string, password: string) {
  const data = await apiSignup(username, email, password);
  return data;
}


export async function valiateToken() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  const data = await apiValidate(token);
  return data.user;
}
