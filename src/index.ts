import colors from 'colors';
import server from "./server";

// Asignar puerto
const port = process.env.PORT || 4000;

// Crear servidor
server.listen(port, () => {
    console.log(colors.blue.italic.bold(`Servidor Funcionando en el puerto: ${port}`))
})