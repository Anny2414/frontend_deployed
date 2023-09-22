import axios from "axios";
import CryptoJS from "crypto-js";

const apiUrl = "https://yourburger.onrender.com/yourburger";

export const Login = async (username, password) => {
  try {
    const response = await axios.post(`${apiUrl}/login/`, { username, password });
    const userData = response.data; // Objeto con los datos que deseas encriptar

    // Clave de encriptación (cambia esta clave por una segura)
    const encryptionKey = 'Yourburger';

    // Convierte el objeto en una cadena JSON
    const userDataJSON = JSON.stringify(userData);

    // Encripta la cadena JSON utilizando CryptoJS
    const encryptedUserData = CryptoJS.AES.encrypt(userDataJSON, encryptionKey).toString();

    // Guarda los datos encriptados en localStorage como una cadena JSON
    localStorage.setItem('Token', encryptedUserData);

    console.log(userData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
