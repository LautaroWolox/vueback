import { EncryptStorage } from 'encrypt-storage';
const clave = import.meta.env.VITE_PARAMETER1;

console.log(import.meta.env);

export const storageAutenticado = new EncryptStorage(clave, { storageType: 'sessionStorage' });
export const storageUsuario = new EncryptStorage(clave, { storageType: 'sessionStorage' });
export const storageRutas = new EncryptStorage(clave, { storageType: 'sessionStorage' });
export const storageToken = new EncryptStorage(clave, { storageType: 'sessionStorage' });
export const auth = new EncryptStorage(clave,{ storageType: 'sessionStorage' });
