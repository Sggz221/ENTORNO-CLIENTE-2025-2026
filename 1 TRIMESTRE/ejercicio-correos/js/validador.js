document.addEventListener("DOMContentLoaded", function() {

  // === SELECTORES DE ELEMENTOS ===
  const form = document.getElementById('formCorreos');
  const modalErrores = new bootstrap.Modal(document.getElementById('modalErrores'));
  const modalDatos = new bootstrap.Modal(document.getElementById('modalDatos'));
  const listaErrores = document.getElementById('listaErrores');
  const datosFinales = document.getElementById('datosFinales');

  // Campos
  const nombre = document.getElementById('nombre');
  const empresa = document.getElementById('empresa');
  const email = document.getElementById('email');
  const tipoDocumento = document.getElementById('tipoDocumento');
  const numeroDocumento = document.getElementById('numeroDocumento');
  const telefono = document.getElementById('telefono');
  const tipoVia = document.getElementById('tipoVia');
  const nombreVia = document.getElementById('nombreVia');
  const cp = document.getElementById('cp');
  const provincia = document.getElementById('provincia');
  const peso = document.getElementById('peso');
  const pesoVolumetrico = document.getElementById('pesoVolumetrico');
  const alto = document.getElementById('alto');
  const ancho = document.getElementById('ancho');
  const largo = document.getElementById('largo');
  const btnCalcular = document.getElementById('btnCalcular');
  const comentarios = document.getElementById('comentarios');
  const condiciones = document.getElementById('condiciones');

  // Campos dinámicos
  const checkEnvioVuelta = document.getElementById('checkEnvioVuelta');
  const campoFechaLimite = document.getElementById('campoFechaLimite');
  const fechaLimite = document.getElementById('fechaLimite');
  const checkSeguro = document.getElementById('checkSeguro');
  const campoImporteSeguro = document.getElementById('campoImporteSeguro');
  const importeSeguro = document.getElementById('importeSeguro');
  const checkReembolso = document.getElementById('checkReembolso');
  const campoReembolso = document.getElementById('campoReembolso');
  const importeReembolso = document.getElementById('importeReembolso');
  const ibanReembolso = document.getElementById('ibanReembolso');

  // === MAPAS Y REGEX ===
  
  // Mapa de Provincias
  const mapaProvincias = {
    '01': 'Álava', '02': 'Albacete', '03': 'Alicante', '04': 'Almería', '33': 'Asturias',
    '05': 'Ávila', '06': 'Badajoz', '08': 'Barcelona', '09': 'Burgos', '10': 'Cáceres',
    '11': 'Cádiz', '39': 'Cantabria', '12': 'Castellón', '51': 'Ceuta', '13': 'Ciudad Real',
    '14': 'Córdoba', '15': 'A Coruña', '16': 'Cuenca', '17': 'Girona', '18': 'Granada',
    '19': 'Guadalajara', '20': 'Guipúzcoa', '21': 'Huelva', '22': 'Huesca', '07': 'Illes Balears',
    '23': 'Jaén', '24': 'León', '25': 'Lleida', '27': 'Lugo', '28': 'Madrid',
    '29': 'Málaga', '52': 'Melilla', '30': 'Murcia', '31': 'Navarra', '32': 'Ourense',
    '34': 'Palencia', '35': 'Las Palmas', '36': 'Pontevedra', '26': 'La Rioja', '37': 'Salamanca',
    '38': 'Santa Cruz de Tenerife', '40': 'Segovia', '41': 'Sevilla', '42': 'Soria', '43': 'Tarragona',
    '44': 'Teruel', '45': 'Toledo', '46': 'Valencia', '47': 'Valladolid', '48': 'Vizcaya',
    '49': 'Zamora', '50': 'Zaragoza'
  };
  
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexTelefono = /^[679]\d{8}$/;
  const regexCP = /^\d{5}$/;
  const regexPeso = /^\d+(\.\d{1,2})?$/; 

  // === FUNCIONES AUXILIARES ===
  
  function mostrarError(id, mensaje) {
    const errorDiv = document.getElementById(id);
    if (errorDiv) {
      errorDiv.textContent = mensaje;
      errorDiv.classList.add('d-block');
    }
  }

  function ocultarError(id) {
    const errorDiv = document.getElementById(id);
    if (errorDiv) {
      errorDiv.classList.remove('d-block');
    }
  }

  function validarNIF(nif) {
    if (!/^\d{8}[A-Z]$/i.test(nif)) return false;
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const numero = nif.substring(0, 8);
    const letra = nif.substring(8, 9).toUpperCase();
    return letras[numero % 23] === letra;
  }

  function validarNIE(nie) {
    if (!/^[XYZ]\d{7}[A-Z]$/i.test(nie)) return false;
    let numero = nie.substring(1, 8);
    const letraInicial = nie.substring(0, 1).toUpperCase();
    const letraFinal = nie.substring(8, 9).toUpperCase();
    if (letraInicial === 'X') numero = '0' + numero; 
    if (letraInicial === 'Y') numero = '1' + numero;
    if (letraInicial === 'Z') numero = '2' + numero;
    return validarNIF(numero + letraFinal);
  }
  
  function validarCIF(cif) {
    return /^[A-HJ-NP-SUVW]\d{7}[0-9A-J]$/i.test(cif);
  }

  
  /**
   * Función principal que comprueba formato y llama a la validación de dígitos.
   */
  function validarIBAN(iban) {
    const valor = iban.trim().replace(/\s/g, '').toUpperCase();
    
    // Validar formato IBAN español: ES + 22 dígitos
    const regex = /^ES\d{22}$/;
    if (!regex.test(valor)) return false;

    // Validar dígito de control
    return validarDigitoControlIBAN(valor);
  }

  /**
   * Calcula el Módulo 97 para validar los dígitos de control.
   */
  function validarDigitoControlIBAN(iban) {
    // Mover los 4 primeros caracteres al final
    const reordenado = iban.substring(4) + iban.substring(0, 4);
    
    // Convertir letras a números (A=10, B=11, ..., Z=35)
    let numerico = '';
    for (let char of reordenado) {
        if (char >= 'A' && char <= 'Z') {
            numerico += (char.charCodeAt(0) - 55).toString();
        } else {
            numerico += char;
        }
    }

    // Usamos el método de "bloques" (chunks) para evitar que el número
    // sea demasiado grande para JavaScript (Infinity).
    let remainder = numerico;
    while (remainder.length > 2) {
        const block = remainder.slice(0, 9); // Tomamos bloques de 9
        remainder = (parseInt(block, 10) % 97) + remainder.slice(block.length);
    }

    // El resto final debe ser 1
    return parseInt(remainder, 10) % 97 === 1;
  }


  // --- LÓGICA DE FECHAS (input text) ---
  function parseDateString(dateString) {
      const parts = dateString.split('/');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }

  function isValidDate(dateString) {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
          return false;
      }
      const parts = dateString.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (year < 1900 || year > 2100 || month < 1 || month > 12) {
          return false;
      }
      const date = new Date(year, month - 1, day);
      return (
          date.getFullYear() === year &&
          date.getMonth() === (month - 1) &&
          date.getDate() === day
      );
  }

  function getMinFechaLimite() {
    const hoy = new Date();
    // (Asumiendo que hoy es 05/11/2025, la fecha mínima es 14/11/2025)
    hoy.setDate(hoy.getDate() + 8); 
    hoy.setHours(0, 0, 0, 0); 
    return hoy;
  }
  const fechaMinima = getMinFechaLimite();


  // === VALIDACIONES "INSIDE" (AL PERDER FOCO - BLUR) ===

  function validaNombreEmpresa() {
    if (nombre.value.trim() === '' && empresa.value.trim() === '') {
      mostrarError('errorNombreEmpresa', 'Debe rellenar el Nombre o la Empresa.');
      return false;
    }
    ocultarError('errorNombreEmpresa');
    return true;
  }
  nombre.addEventListener('blur', validaNombreEmpresa);
  empresa.addEventListener('blur', validaNombreEmpresa);

  email.addEventListener('blur', () => {
    if (email.value.trim() !== '' && !regexEmail.test(email.value)) {
      mostrarError('errorEmail', 'El formato del email no es válido.');
    } else {
      ocultarError('errorEmail');
    }
  });
  
  telefono.addEventListener('blur', () => {
    if (telefono.value.trim() !== '' && !regexTelefono.test(telefono.value)) {
      mostrarError('errorTelefono', 'El teléfono debe tener 9 dígitos y empezar por 6, 7 o 9.');
    } else {
      ocultarError('errorTelefono');
    }
  });

  function validaDocumento() {
    const tipo = tipoDocumento.value;
    const num = numeroDocumento.value.toUpperCase();
    if (tipo === '') {
        ocultarError('errorDocumento');
        return true; 
    }
    if (num === '') {
        mostrarError('errorDocumento', 'El número de documento es obligatorio si selecciona un tipo.');
        return false;
    }
    let valido = false;
    if (tipo === 'nif') valido = validarNIF(num);
    else if (tipo === 'nie') valido = validarNIE(num);
    else if (tipo === 'cif') valido = validarCIF(num);
    if (!valido) {
        mostrarError('errorDocumento', `El ${tipo.toUpperCase()} introducido no parece válido.`);
        return false;
    }
    ocultarError('errorDocumento');
    return true;
  }
  tipoDocumento.addEventListener('change', validaDocumento);
  numeroDocumento.addEventListener('blur', validaDocumento);

  function validaRequerido(campo, errorId, msg) {
    if (campo.value.trim() === '') {
      mostrarError(errorId, msg);
      return false;
    }
    ocultarError(errorId);
    return true;
  }
  tipoVia.addEventListener('blur', () => validaRequerido(tipoVia, 'errorTipoVia', 'El tipo de vía es obligatorio.'));
  nombreVia.addEventListener('blur', () => validaRequerido(nombreVia, 'errorNombreVia', 'El nombre de vía es obligatorio.'));
  
  cp.addEventListener('blur', () => {
    if (cp.value.trim() !== '' && !regexCP.test(cp.value)) {
      mostrarError('errorCP', 'El Código Postal debe tener 5 dígitos.');
      provincia.value = '';
    } else if (cp.value.trim() !== '') {
      ocultarError('errorCP');
      const prefijo = cp.value.substring(0, 2);
      // Usamos el mapa completo
      provincia.value = mapaProvincias[prefijo] || 'Provincia no encontrada';
    } else {
       ocultarError('errorCP');
       provincia.value = '';
    }
  });
  
  peso.addEventListener('blur', () => {
    const pesoVal = peso.value.trim();
    if (pesoVal === '' || parseFloat(pesoVal) <= 0) {
        mostrarError('errorPeso', 'El peso es obligatorio y debe ser mayor que 0.');
        return false;
    }
    if (!regexPeso.test(pesoVal)) {
        mostrarError('errorPeso', 'El formato del peso no es válido (ej: 1.50).');
        return false;
    }
    ocultarError('errorPeso');
    return true;
  });

  function validaDimensiones() {
    const a = parseFloat(alto.value);
    const n = parseFloat(ancho.value);
    const l = parseFloat(largo.value);
    if (isNaN(a) || a <= 0 || isNaN(n) || n <= 0 || isNaN(l) || l <= 0) {
        mostrarError('errorDimensiones', 'Alto, ancho y largo son obligatorios y deben ser números positivos.');
        return false;
    }
    ocultarError('errorDimensiones');
    return true;
  }
  alto.addEventListener('blur', validaDimensiones);
  ancho.addEventListener('blur', validaDimensiones);
  largo.addEventListener('blur', validaDimensiones);

  btnCalcular.addEventListener('click', () => {
    if (validaDimensiones()) {
      const a = parseFloat(alto.value);
      const n = parseFloat(ancho.value);
      const l = parseFloat(largo.value);
      const vol = (a * n * l) / 5000;
      pesoVolumetrico.value = vol.toFixed(2) + ' kg';
    } else {
      pesoVolumetrico.value = '';
    }
  });

  function toggleCampo(checkbox, campoDiv, ...inputs) {
      if (checkbox.checked) {
          campoDiv.classList.remove('campo-oculto');
          inputs.forEach(input => input.required = true);
      } else {
          campoDiv.classList.add('campo-oculto');
          inputs.forEach(input => {
              input.required = false;
              input.value = ''; 
          });
          ocultarError(inputs[0].id.replace(inputs[0].id, 'error' + inputs[0].id.charAt(0).toUpperCase() + inputs[0].id.slice(1)));
      }
  }

  checkEnvioVuelta.addEventListener('change', () => toggleCampo(checkEnvioVuelta, campoFechaLimite, fechaLimite));
  checkSeguro.addEventListener('change', () => toggleCampo(checkSeguro, campoImporteSeguro, importeSeguro));
  checkReembolso.addEventListener('change', () => toggleCampo(checkReembolso, campoReembolso, importeReembolso, ibanReembolso));

  fechaLimite.addEventListener('blur', () => {
    if (checkEnvioVuelta.checked) {
        const dateStr = fechaLimite.value.trim();
        if (dateStr === '') {
            mostrarError('errorFechaLimite', 'La fecha es obligatoria.');
        } else if (!isValidDate(dateStr)) {
            mostrarError('errorFechaLimite', 'Formato no válido (dd/mm/aaaa) o fecha inexistente (ej. 30/02).');
        } else {
            const fechaSel = parseDateString(dateStr);
            fechaSel.setHours(0, 0, 0, 0);
            if (fechaSel < fechaMinima) {
                mostrarError('errorFechaLimite', 'La fecha debe ser superior a 7 días desde hoy.');
            } else {
                ocultarError('errorFechaLimite');
            }
        }
    }
  });

  importeSeguro.addEventListener('blur', () => {
    if (checkSeguro.checked && (importeSeguro.value === '' || parseFloat(importeSeguro.value) <= 0)) {
        mostrarError('errorImporteSeguro', 'El importe es obligatorio y debe ser mayor que 0.');
    } else {
        ocultarError('errorImporteSeguro');
    }
  });
  
  importeReembolso.addEventListener('blur', () => {
    if (checkReembolso.checked && (importeReembolso.value === '' || parseFloat(importeReembolso.value) <= 0)) {
        mostrarError('errorImporteReembolso', 'El importe es obligatorio y debe ser mayor que 0.');
    } else {
        ocultarError('errorImporteReembolso');
    }
  });
  
  ibanReembolso.addEventListener('blur', () => {
    if (checkReembolso.checked && !validarIBAN(ibanReembolso.value)) {
        mostrarError('errorIbanReembolso', 'El IBAN no es válido. Compruebe los dígitos.');
    } else {
        ocultarError('errorIbanReembolso');
    }
  });

  condiciones.addEventListener('change', () => {
      if (!condiciones.checked) {
          mostrarError('errorCondiciones', 'Debe aceptar las condiciones.');
      } else {
          ocultarError('errorCondiciones');
      }
  });


  // === VALIDACIÓN FINAL (AL ENVIAR) ===
  
  function validarFormularioCompleto() {
    let esValido = true;
    let errores = [];

    document.querySelectorAll('.alerta-error').forEach(div => div.classList.remove('d-block'));

    if (!validaNombreEmpresa()) {
        esValido = false;
        errores.push('Debe indicar un Nombre o una Empresa.');
    }
    if (email.value.trim() !== '' && !regexEmail.test(email.value)) {
      esValido = false;
      errores.push('El formato del Email no es válido.');
      mostrarError('errorEmail', 'El formato del Email no es válido.');
    }
    if (tipoDocumento.value !== '' && !validaDocumento()) {
      esValido = false;
      errores.push('El Tipo/Número de documento no es válido.');
    }
    if (telefono.value.trim() !== '' && !regexTelefono.test(telefono.value)) {
      esValido = false;
      errores.push('El formato del Teléfono no es válido.');
      mostrarError('errorTelefono', 'El teléfono debe tener 9 dígitos y empezar por 6, 7 o 9.');
    }
    if (!validaRequerido(tipoVia, 'errorTipoVia', 'El tipo de vía es obligatorio.')) {
        esValido = false;
        errores.push('El tipo de vía es obligatorio.');
    }
    if (!validaRequerido(nombreVia, 'errorNombreVia', 'El nombre de vía es obligatorio.')) {
        esValido = false;
        errores.push('El nombre de vía es obligatorio.');
    }
    if (!validaRequerido(cp, 'errorCP', 'El Código Postal es obligatorio.') || !regexCP.test(cp.value)) {
        esValido = false;
        errores.push('El Código Postal es obligatorio y debe tener 5 dígitos.');
        mostrarError('errorCP', 'El Código Postal es obligatorio y debe tener 5 dígitos.');
    }
    const pesoVal = peso.value.trim();
    if (pesoVal === '' || parseFloat(pesoVal) <= 0 || !regexPeso.test(pesoVal)) {
        esValido = false;
        errores.push('El Peso es obligatorio, debe ser positivo y tener máx. 2 decimales.');
        mostrarError('errorPeso', 'El Peso es obligatorio, debe ser positivo y tener máx. 2 decimales.');
    }
    if (!validaDimensiones()) {
        esValido = false;
        errores.push('Alto, Ancho y Largo son obligatorios.');
    }

    if (checkEnvioVuelta.checked) {
        const dateStr = fechaLimite.value.trim();
        if (dateStr === '') {
            esValido = false;
            errores.push('La Fecha Límite de envío de vuelta es obligatoria.');
            mostrarError('errorFechaLimite', 'La Fecha Límite es obligatoria.');
        } else if (!isValidDate(dateStr)) {
            esValido = false;
            errores.push('El formato de la Fecha Límite no es válido (dd/mm/aaaa) o la fecha no existe.');
            mostrarError('errorFechaLimite', 'Formato no válido (dd/mm/aaaa) o fecha inexistente (ej. 29/02/2025).');
        } else {
            const fechaSel = parseDateString(dateStr);
            fechaSel.setHours(0, 0, 0, 0); 
            if (fechaSel < fechaMinima) {
                esValido = false;
                errores.push('La Fecha Límite debe ser superior a 7 días desde hoy.');
                mostrarError('errorFechaLimite', 'La fecha debe ser superior a 7 días desde hoy.');
            }
        }
    }
    if (checkSeguro.checked) {
        if (importeSeguro.value === '' || parseFloat(importeSeguro.value) <= 0) {
            esValido = false;
            errores.push('El Importe a asegurar es obligatorio.');
            mostrarError('errorImporteSeguro', 'El importe es obligatorio y debe ser mayor que 0.');
        }
    }
    if (checkReembolso.checked) {
        if (importeReembolso.value === '' || parseFloat(importeReembolso.value) <= 0) {
            esValido = false;
            errores.push('El Importe a reembolsar es obligatorio.');
            mostrarError('errorImporteReembolso', 'El importe es obligatorio y debe ser mayor que 0.');
        }
        if (!validarIBAN(ibanReembolso.value)) {
            esValido = false;
            errores.push('El IBAN para el reembolso no es válido.');
            mostrarError('errorIbanReembolso', 'El IBAN no es válido. Compruebe los dígitos.');
        }
    }
    if (comentarios.value.length > 150) {
        esValido = false;
        errores.push('Los comentarios no pueden exceder los 150 caracteres.');
        mostrarError('errorComentarios', 'Ha superado el límite de 150 caracteres.');
    }
    if (!condiciones.checked) {
      esValido = false;
      errores.push('Debe aceptar las condiciones de uso.');
      mostrarError('errorCondiciones', 'Debe aceptar las condiciones.');
    }
    
    return { esValido, errores };
  }


  // === GESTOR DEL ENVÍO (SUBMIT) ===
  
  form.addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    const resultado = validarFormularioCompleto();

    if (!resultado.esValido) {
      listaErrores.innerHTML = '<ul>' + 
        resultado.errores.map(e => `<li>${e}</li>`).join('') + 
        '</ul>';
      modalErrores.show();
    } else {
      let resumen = `--- DATOS DEL DESTINATARIO ---\n`;
      resumen += `Nombre: ${nombre.value || 'N/A'}\n`;
      resumen += `Empresa: ${empresa.value || 'N/A'}\n`;
      resumen += `Email: ${email.value || 'N/A'}\n`;
      resumen += `Teléfono: ${telefono.value || 'N/A'}\n`;
      if(tipoDocumento.value) {
        resumen += `Documento: ${tipoDocumento.value.toUpperCase()} - ${numeroDocumento.value.toUpperCase()}\n`;
      }
      resumen += `\n--- DIRECCIÓN ---\n`;
      resumen += `Vía: ${tipoVia.value} ${nombreVia.value}\n`;
      resumen += `Detalles: ${document.getElementById('numeroVia').value || ''} ${document.getElementById('bloque').value || ''} ${document.getElementById('portal').value || ''} ${document.getElementById('piso').value || ''} ${document.getElementById('escalera').value || ''} ${document.getElementById('puerta').value || ''}\n`;
      resumen += `CP: ${cp.value}\n`;
      resumen += `Provincia: ${provincia.value}\n`;
      resumen += `\n--- PAQUETE ---\n`;
      resumen += `Peso Real: ${peso.value} kg\n`;
      resumen += `Dimensiones: ${alto.value}x${ancho.value}x${largo.value} cm\n`;
      resumen += `Peso Volumétrico: ${pesoVolumetrico.value || '(No calculado)'}\n`;
      resumen += `\n--- SERVICIOS ADICIONALES ---\n`;
      resumen += `Envío de vuelta: ${checkEnvioVuelta.checked ? `SÍ (Fecha límite: ${fechaLimite.value})` : 'NO'}\n`;
      resumen += `Seguro: ${checkSeguro.checked ? `SÍ (Importe: ${importeSeguro.value} €)` : 'NO'}\n`;
      resumen += `Reembolso: ${checkReembolso.checked ? `SÍ (Importe: ${importeReembolso.value} €, IBAN: ${ibanReembolso.value})` : 'NO'}\n`;
      resumen += `\n--- OTROS ---\n`;
      resumen += `Comentarios: ${comentarios.value || 'Sin comentarios'}\n`;

      datosFinales.textContent = resumen;
      modalDatos.show();
    }
  });
  
  // Limpiar errores en Reset
  form.addEventListener('reset', () => {
      document.querySelectorAll('.alerta-error').forEach(div => div.classList.remove('d-block'));
      provincia.value = '';
      pesoVolumetrico.value = '';
      if (checkEnvioVuelta.checked) toggleCampo(checkEnvioVuelta, campoFechaLimite, fechaLimite);
      if (checkSeguro.checked) toggleCampo(checkSeguro, campoImporteSeguro, importeSeguro);
      if (checkReembolso.checked) toggleCampo(checkReembolso, campoReembolso, importeReembolso, ibanReembolso);
  });

});