
function validarString(cadena, min, max){

	var res= false;

	if(min == 0 && max != null){
		if((isNaN(cadena) && cadena.length <= max) || cadena == "")
			res = true;		
	}

	if(min > 0 && max == null){
		if(isNaN(cadena) && cadena.length >= min)
			res = true;
	}

	if(min > 0 && max != null){
		if(isNaN(cadena) && cadena.length >= min && cadena.length <= max)
			res = true;
	}
	return res;
} 

function validarDni(dni) {
    var regex = /^[0-9]{8}[A-Z]$/;
    var letrasArray = "TRWAGMYFPDXBNJZSQVHLCKE";
    
    if (!regex.test(dni)) {
        return false;
    }

    var numeroDni = parseInt(dni.substring(0, 8), 10);
    var letraDni = letrasArray[numeroDni % 23];
    
    return letraDni === dni.substring(8); // la última letra
}

function validarFecha(fecha) {
    // Formato correcto dd/mm/yyyy
    var regex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
    if (!regex.test(fecha)) {
        return false;
    }

    // Extraer partes de la fecha
    var dia = parseInt(fecha.substring(0, 2), 10); // Indicando base decimal
    var mes = parseInt(fecha.substring(3, 5), 10);
    var year = parseInt(fecha.substring(6, 10), 10);

    // Validar mes
    if (mes < 1 || mes > 12) return false;

    // Validar días segun el mes
    if (mes === 2) { // Febrero
		
        if (dia < 1 || dia > 29) {
			return false
		};
    } else if ([4, 6, 9, 11].includes(mes)) { 
        if (dia < 1 || dia > 30) {
			return false
		};
    } else {
        if (dia < 1 || dia > 31) {
			return false
		};
    }

    // Validar que no sea superior a la fecha actual
	var miFecha = new Date(year, mes-1, dia)
    var fechaActual = new Date();

 	if (miFecha > fechaActual) {
		return false
	};

    return true;
}


function validarEdad(cadena){
	window.alert("pepe")
	if(!isNaN(cadena) && cadena >= 16 && cadena <=32) {
		return true;
	}
	else{
		return false;
	}
}

function validarNumero(cadena,min,max){
	if(!isNaN(cadena) && cadena.length >= min && cadena.length <= max){
		return true;
	}else{
		return false;
	}
}

function validarBotones(nombre){  //indica que hay uno chekeado
	var array = document.getElementsByName(nombre);
	var ok = false;
	for(var i = 0; i < array.length ; i++){
		if(array[i].checked)
			ok = true;
	}
	return ok;
}

function validarListas(nombre){ //indica que hay uno chekeado
	var lista = document.getElementById(nombre);
	if(lista.selectedIndex < 0)
		return false;
	else
		return true;
}


function validarCP(cadena){
	if(!isNaN(cadena) && cadena.length == 5 && parseInt(cadena.substr(0, 2)) > 0 && parseInt(cadena.substr(0, 2)) < 53){
		return true;
	}else{
		return false;
	}
}

function validarTelefono(cadena){ //formato de telefono [679]99999999 /primer digito 6, 7 o 9 y 8 digitos mas 
		if((cadena.length == 0) || (validarNumero(cadena,9,9) && (cadena.charAt(0) == '9' || cadena.charAt(0) == '7' || cadena.charAt(0) == '6')))
		{ 
			return true;
		} else {
			return false;
		}
} 

function validarContrasena(contrasena){ //contraseña con formato: 
	var res = true;
	var ConRegex = /^[A-Za-z0-9]{8,16}$/;
	var regexMayus = /[A-Z]+/;
	var regexMinus = /[a-z]+/;
	var regexNum = /[0-9]+/;

	if (!ConRegex.test(contrasena.value)) 
		res = false;
	if(!regexMayus.test(contrasena.value))
		res = false
	if(!regexMinus.test(contrasena.value))
		res = false;
	if(!regexNum.test(contrasena.value))
		res = false;

	return res;
}