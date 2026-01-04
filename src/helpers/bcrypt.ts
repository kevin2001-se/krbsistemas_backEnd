import bcrypt from 'bcrypt'

export const hashPassword = async (password: string) => {
    // Salt: es una cadena de caracteres aleatorias, si la contraseña es igual el hash sera diferentes
    // Rondas: las numero de veces que se aplicara el salt
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export const checkPassword = async (enteredPassword: string, hash: string) => {
    return await bcrypt.compare(enteredPassword, hash);
} 