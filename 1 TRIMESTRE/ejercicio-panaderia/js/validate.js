function validarNumeros(valorCampo) {
    // Primero, revisamos si está vacío o solo espacios, !valorCampo devuelve true si valorCampo === ""
    if (!valorCampo || valorCampo.trim() === "") {
        return false;
    }
    // Luego, verificamos que sea un número válido
    return !isNaN(valorCampo);
}
