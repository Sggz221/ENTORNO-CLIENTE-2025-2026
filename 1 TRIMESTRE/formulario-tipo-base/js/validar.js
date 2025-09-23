
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

