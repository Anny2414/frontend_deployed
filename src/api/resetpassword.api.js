import axios from "axios";

const apiUrl = "https://yourburger.onrender.com/yourburger";

export const Reset = async (email) => {
  try {
    const response = await axios.post(`${apiUrl}/enviar-correo/`, { email: email });
    const Data = response.data; // Objeto con los datos que deseas encriptar
    console.log(Data);
    return Data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
