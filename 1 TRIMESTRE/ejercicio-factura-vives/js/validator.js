document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABLES GLOBALES ---
    const mainForm = document.getElementById('factura-form');
    const btnAnadirFila = document.getElementById('anadir-fila');
    const tablaBody = document.getElementById('detalle-factura-body');
    
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    const summaryModal = new bootstrap.Modal(document.getElementById('summaryModal'));
    const tableErrorModal = new bootstrap.Modal(document.getElementById('tableErrorModal'));

    // Elementos del resumen
    const resumen = {
        base21: document.getElementById('resumen-base-21'),
        iva21: document.getElementById('resumen-iva-21'),
        base10: document.getElementById('resumen-base-10'),
        iva10: document.getElementById('resumen-iva-10'),
        base4: document.getElementById('resumen-base-4'),
        iva4: document.getElementById('resumen-iva-4'),
        total: document.getElementById('resumen-total')
    };

    const captchaDisplay = document.getElementById('captchaOperation');
    let captchaAnswer = 0;

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

    // --- INICIALIZACIÓN ---
    generarCaptcha();
    anadirFila();
    setupOnBlurValidation();
    setupProvinceLookup();

    // --- LÓGICA DEL CAPTCHA ---
    function generarCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        captchaAnswer = num1 + num2;
        captchaDisplay.textContent = `${num1} + ${num2} = ?`;
    }
    
    // --- LÓGICA DE PROVINCIA ---
    function setupProvinceLookup() {
        const cpInput = document.getElementById('cp');
        const provinciaInput = document.getElementById('provincia');
        
        cpInput.addEventListener('input', () => {
            const prefix = cpInput.value.substring(0, 2);
            provinciaInput.value = mapaProvincias[prefix] || '';
        });
    }

    // --- LÓGICA DE VALIDACIÓN DE FECHA REAL ---
    function isValidDate(dateString) {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(dateString)) return false;

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

    // --- FUNCIONES DE VALIDACIÓN NIF/CIF ---

    /**
     * Valida un NIF o NIE español.
     */
    function isValidNif(nif) {
        if (typeof nif !== 'string') return false;
        nif = nif.toUpperCase();

        const nifRegex = /^((\d{8})|([XYZ]\d{7}))[A-Z]$/;
        if (!nifRegex.test(nif)) return false;

        const letterMap = "TRWAGMYFPDXBNJZSQVHLCKE";
        let numPart = nif.substring(0, 8);

        numPart = numPart.replace('X', '0').replace('Y', '1').replace('Z', '2');

        const num = parseInt(numPart, 10);
        if (isNaN(num)) return false;

        const calculatedLetter = letterMap.charAt(num % 23);
        const suppliedLetter = nif.charAt(8);

        return calculatedLetter === suppliedLetter;
    }

    /**
     * Valida un CIF español.
     */
    function isValidCif(cif) {
        if (typeof cif !== 'string') return false;
        cif = cif.toUpperCase();

        const cifRegex = /^[A-HJ-NP-SUVW]\d{7}[0-9A-J]$/;
        if (!cifRegex.test(cif)) return false;

        const letters = cif.substring(0, 1);
        const digits = cif.substring(1, 8);
        const control = cif.substring(8);

        let sumEven = 0;
        let sumOdd = 0;

        for (let i = 0; i < digits.length; i++) {
            const digit = parseInt(digits.charAt(i), 10);
            if (i % 2 === 0) {
                let double = digit * 2;
                sumOdd += double < 10 ? double : Math.floor(double / 10) + (double % 10);
            } else {
                sumEven += digit;
            }
        }

        const totalSum = sumEven + sumOdd;
        let lastDigit = totalSum % 10;
        let controlDigit = (lastDigit === 0) ? 0 : (10 - lastDigit);

        const controlMap = "JABCDEFGHI";
        const isLetterControl = "PQRSW".includes(letters);
        
        if (isLetterControl) {
            return control === controlMap.charAt(controlDigit);
        } else {
            return control === String(controlDigit);
        }
    }

    /**
     * Validador principal que delega en NIF o CIF.
     */
    function isValidDocumento(docType, docNum) {
        if (docType === 'NIF') {
            return isValidNif(docNum);
        } else if (docType === 'CIF') {
            return isValidCif(docNum);
        }
        return false;
    }


    // --- LÓGICA DE VALIDACIÓN ON-BLUR ---
    function setupOnBlurValidation() {
        const camposParaValidar = ['factura', 'nombre', 'direccion', 'cp', 'ciudad', 'telefono', 'email', 'captcha'];
        
        camposParaValidar.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('blur', () => {
                    if (!input.checkValidity()) {
                        input.classList.add('is-invalid');
                    } else {
                        input.classList.remove('is-invalid');
                    }
                });
            }
        });

        // Validación on-blur específica para la fecha
        const fechaInput = document.getElementById('fecha');
        fechaInput.addEventListener('blur', () => {
            if (!isValidDate(fechaInput.value)) {
                fechaInput.classList.add('is-invalid');
            } else {
                fechaInput.classList.remove('is-invalid');
            }
        });

        // Validación on-blur específica para NIF/CIF
        const numDocInput = document.getElementById('numDocumento');
        const tipoDocInput = document.getElementById('tipoDocumento');

        const validateDocBlur = () => {
            const docType = tipoDocInput.value;
            const docNum = numDocInput.value;
            if (docNum.length > 0) {
                if (!isValidDocumento(docType, docNum)) {
                    numDocInput.classList.add('is-invalid');
                } else {
                    numDocInput.classList.remove('is-invalid');
                }
            } else {
                    numDocInput.classList.remove('is-invalid');
            }
        };

        numDocInput.addEventListener('blur', validateDocBlur);
        tipoDocInput.addEventListener('change', validateDocBlur);
    }


    // --- LÓGICA DE LA TABLA DE FACTURA ---
    function anadirFila() {
        const ultimaFila = tablaBody.lastElementChild;
        if (ultimaFila) {
            const descInput = ultimaFila.querySelector('.input-descripcion');
            const precioInput = ultimaFila.querySelector('.precio');
            const desc = descInput.value.trim();
            const precio = parseFloat(precioInput.value) || 0;

            descInput.classList.remove('is-invalid');
            precioInput.classList.remove('is-invalid');

            if (desc === "" || precio <= 0) {
                tableErrorModal.show();
                if (desc === "") descInput.classList.add('is-invalid');
                if (precio <= 0) precioInput.classList.add('is-invalid');
                return;
            }
        }

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><input type="number" class="form-control form-control-sm calc-input cantidad" value="1" min="1"></td>
            <td><input type="text" class="form-control form-control-sm input-descripcion"></td>
            <td><input type="number" class="form-control form-control-sm calc-input precio" value="0" min="0" step="0.01"></td>
            <td>
                <select class="form-select form-select-sm calc-input iva-pct">
                    <option value="21">21%</option>
                    <option value="10">10%</option>
                    <option value="4">4%</option>
                    <option value="0">0%</option>
                </select>
            </td>
            <td><input type="text" class="form-control form-control-sm iva-calculado" readonly value="0.00"></td>
            <td><input type="text" class="form-control form-control-sm importe-calculado" readonly value="0.00"></td>
            <td><input type="text" class="form-control form-control-sm total-calculado" readonly value="0.00"></td>
            <td><button type="button" class="btn btn-danger btn-sm btn-borrar">Borrar</button></td>
        `;
        tablaBody.appendChild(fila);
    }

    function calcularFila(fila) {
        const cantidad = parseFloat(fila.querySelector('.cantidad').value) || 0;
        const precio = parseFloat(fila.querySelector('.precio').value) || 0;
        const ivaPct = parseFloat(fila.querySelector('.iva-pct').value) || 0;

        if (precio > 0) fila.querySelector('.precio').classList.remove('is-invalid');
        if (fila.querySelector('.input-descripcion').value.trim() !== "") {
            fila.querySelector('.input-descripcion').classList.remove('is-invalid');
        }

        const importe = cantidad * precio;
        const iva = importe * (ivaPct / 100);
        const total = importe + iva;

        fila.querySelector('.importe-calculado').value = importe.toFixed(2);
        fila.querySelector('.iva-calculado').value = iva.toFixed(2);
        fila.querySelector('.total-calculado').value = total.toFixed(2);
        
        calcularTotalGeneral();
    }

    function calcularTotalGeneral() {
        let base21 = 0, iva21 = 0, base10 = 0, iva10 = 0, base4 = 0, iva4 = 0, totalGeneral = 0;
        const filas = tablaBody.querySelectorAll('tr');

        filas.forEach(fila => {
            const ivaPct = parseInt(fila.querySelector('.iva-pct').value);
            const importe = parseFloat(fila.querySelector('.importe-calculado').value) || 0;
            const iva = parseFloat(fila.querySelector('.iva-calculado').value) || 0;
            const totalFila = parseFloat(fila.querySelector('.total-calculado').value) || 0;

            switch (ivaPct) {
                case 21: base21 += importe; iva21 += iva; break;
                case 10: base10 += importe; iva10 += iva; break;
                case 4: base4 += importe; iva4 += iva; break;
            }
            totalGeneral += totalFila;
        });

        resumen.base21.value = base21.toFixed(2);
        resumen.iva21.value = iva21.toFixed(2);
        resumen.base10.value = base10.toFixed(2);
        resumen.iva10.value = iva10.toFixed(2);
        resumen.base4.value = base4.toFixed(2);
        resumen.iva4.value = iva4.toFixed(2);
        resumen.total.value = totalGeneral.toFixed(2);
    }

    // --- EVENT LISTENERS TABLA ---
    btnAnadirFila.addEventListener('click', anadirFila);

    tablaBody.addEventListener('input', (event) => {
        if (event.target.classList.contains('calc-input') || event.target.classList.contains('input-descripcion')) {
            const fila = event.target.closest('tr');
            calcularFila(fila);
        }
    });
    
    tablaBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-borrar')) {
            const fila = event.target.closest('tr');
            if (fila === tablaBody.firstElementChild) {
                alert("La primera fila no se puede borrar.");
                return;
            }
            fila.remove();
            calcularTotalGeneral();
        }
    });


    // --- LÓGICA DE VALIDACIÓN Y ENVÍO (SUBMIT) ---
    mainForm.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();

        mainForm.classList.remove('was-validated');
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        
        let errors = [];
        const errorList = document.getElementById('error-list');
        errorList.innerHTML = '';

        // 3. VALIDAR CAMPOS DEL CLIENTE
        const camposRequeridos = ['factura', 'nombre', 'direccion', 'cp', 'ciudad', 'email', 'captcha'];
        camposRequeridos.forEach(id => {
            const input = document.getElementById(id);
            if (!input.checkValidity()) {
                const label = input.closest('.input-group, .has-validation').querySelector('label, .input-group-text');
                const labelText = label ? label.textContent.replace('*', '').trim() : id;
                errors.push(`El campo "${labelText}" es incorrecto o está vacío.`);
                input.classList.add('is-invalid');
            }
        });

        // Validación específica de fecha en el submit
        const fechaInput = document.getElementById('fecha');
        if (!isValidDate(fechaInput.value)) {
            errors.push('El campo "Fecha" no es una fecha válida y real (dd/mm/aaaa).');
            fechaInput.classList.add('is-invalid');
        }

        // Validación teléfono
        const tel = document.getElementById('telefono');
        if (tel.value !== '' && !tel.checkValidity()) {
                errors.push('El formato del "Teléfono" no es válido (9 dígitos).');
                tel.classList.add('is-invalid');
        }
        
        // Validación NIF/CIF en el submit
        const tipoDoc = document.getElementById('tipoDocumento').value;
        const numDoc = document.getElementById('numDocumento').value;
        const numDocInputEl = document.getElementById('numDocumento');

        if (numDoc.length === 0) {
                errors.push('El campo "Nº Doc." es obligatorio.');
                numDocInputEl.classList.add('is-invalid');
        } else if (!isValidDocumento(tipoDoc, numDoc)) {
            errors.push(`El "Nº Doc." (${tipoDoc}) no es válido. Compruebe el formato y la letra/dígito de control.`);
            numDocInputEl.classList.add('is-invalid');
        }


        // 4. VALIDAR CAPTCHA
        const captchaInput = document.getElementById('captcha');
        if (parseInt(captchaInput.value) !== captchaAnswer) {
            if (!errors.some(e => e.includes("Captcha"))) {
                    errors.push('El resultado del "Captcha" es incorrecto.');
            }
            captchaInput.classList.add('is-invalid');
        }
        
        // 5. VALIDACIÓN ESPECÍFICA DEL CP
        const cpInput = document.getElementById('cp');
        if (cpInput.checkValidity()) {
            const cpPrefix = cpInput.value.substring(0, 2);
            if (!mapaProvincias[cpPrefix]) {
                errors.push('El "CP" no corresponde a una provincia válida.');
                cpInput.classList.add('is-invalid');
            }
        }

        // 6. VALIDAR LÍNEAS DE FACTURA
        const filas = tablaBody.querySelectorAll('tr');
        let filasInvalidas = false;
        if (filas.length === 0) {
            errors.push('Debe añadir al menos un producto a la factura.');
        } else {
            filas.forEach((fila, index) => {
                const descInput = fila.querySelector('.input-descripcion');
                const precioInput = fila.querySelector('.precio');
                const desc = descInput.value.trim();
                const precio = parseFloat(precioInput.value) || 0;

                if (desc === "" || precio <= 0) {
                    filasInvalidas = true;
                    if (desc === "") descInput.classList.add('is-invalid');
                    if (precio <= 0) precioInput.classList.add('is-invalid');
                }
            });
            if (filasInvalidas) {
                    errors.push('Una o más líneas de la factura tienen descripción vacía o precio cero.');
            }
        }
        
        // 7. MOSTRAR MODAL DE ERROR O DE RESUMEN
        if (errors.length > 0) {
            mainForm.classList.add('was-validated'); 
            errors.forEach(error => {
                const li = document.createElement('li');
                li.className = 'list-group-item list-group-item-danger';
                li.textContent = error;
                errorList.appendChild(li);
            });
            errorModal.show();
        } else {
            // ÉXITO: Rellenar y mostrar la modal de resumen.
            // El formulario NO se envía, la modal es el paso final.
            mainForm.classList.add('was-validated'); 
            rellenarModalResumen();
            summaryModal.show();
        }
    });


    // --- FUNCIÓN PARA RELLENAR LA MODAL DE RESUMEN ---
    function rellenarModalResumen() {
        document.getElementById('summary-factura').textContent = document.getElementById('factura').value;
        document.getElementById('summary-fecha').textContent = document.getElementById('fecha').value;
        document.getElementById('summary-nombre').textContent = document.getElementById('nombre').value;
        document.getElementById('summary-doc').textContent = `${document.getElementById('tipoDocumento').value} ${document.getElementById('numDocumento').value}`;
        document.getElementById('summary-email').textContent = document.getElementById('email').value;
        document.getElementById('summary-direccion').textContent = document.getElementById('direccion').value;
        document.getElementById('summary-cp-ciudad').textContent = `${document.getElementById('cp').value} / ${document.getElementById('ciudad').value} (${document.getElementById('provincia').value})`;
        document.getElementById('summary-telefono').textContent = document.getElementById('telefono').value || 'N/A';
        document.getElementById('summary-observaciones').textContent = document.getElementById('observaciones').value || 'Ninguna.';

        const summaryTableBody = document.getElementById('summary-table-body');
        summaryTableBody.innerHTML = '';
        tablaBody.querySelectorAll('tr').forEach(fila => {
            const cantidad = fila.querySelector('.cantidad').value;
            const desc = fila.querySelector('.input-descripcion').value;
            const precio = parseFloat(fila.querySelector('.precio').value).toFixed(2);
            const totalFila = parseFloat(fila.querySelector('.total-calculado').value).toFixed(2);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cantidad}</td>
                <td>${desc}</td>
                <td>${precio} €</td>
                <td>${totalFila} €</td>
            `;
            summaryTableBody.appendChild(tr);
        });

        document.getElementById('summary-base-21').textContent = `${resumen.base21.value} €`;
        document.getElementById('summary-iva-21').textContent = `${resumen.iva21.value} €`;
        document.getElementById('summary-base-10').textContent = `${resumen.base10.value} €`;
        document.getElementById('summary-iva-10').textContent = `${resumen.iva10.value} €`;
        document.getElementById('summary-base-4').textContent = `${resumen.base4.value} €`;
        document.getElementById('summary-iva-4').textContent = `${resumen.iva4.value} €`;
        document.getElementById('summary-total').textContent = resumen.total.value;
    }

});