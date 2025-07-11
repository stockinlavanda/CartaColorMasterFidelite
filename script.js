console.log("Hola desde JavaScript - Versión 2025-06-25");

const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/4ocgyj44kuqqakelhx4obbna6nbnkt4r'; 

const colorItems = document.querySelectorAll('.color-item'); 
const totalAmount = document.getElementById('total-amount'); 
const totalAmountHidden = document.getElementById('total-amount-hidden'); 

const plataformaCompraSelect = document.getElementById('plataformaCompra'); 
const sucursalSelect = document.getElementById('sucursalSelect'); 


if (plataformaCompraSelect && sucursalSelect) { 
    plataformaCompraSelect.addEventListener('change', () => {
        if (plataformaCompraSelect.value === 'Sucursales') {
            sucursalSelect.style.display = 'block'; 
            sucursalSelect.setAttribute('required', 'required'); 
        } else {
            sucursalSelect.style.display = 'none'; 
            sucursalSelect.removeAttribute('required'); 
            sucursalSelect.value = ''; 
        }
    });
}



colorItems.forEach(item => {
    const quantityInput = item.querySelector('.quantity');
    const price = parseFloat(item.getAttribute('data-price')) || 0; 

    quantityInput.addEventListener('input', updateTotal);

    function updateTotal() {
        let total = 0; 
        
        colorItems.forEach(item => {
            const quantity = parseInt(item.querySelector('.quantity').value) || 0;
            total += quantity * price; 
            
        });
        totalAmount.textContent = Math.round(total); 
        totalAmountHidden.value = Math.round(total); 
    }
    updateTotal(); 
});



function exportarCSV() {
    const data = [];
    colorItems.forEach(item => {
        const cantidad = parseInt(item.querySelector('.quantity').value) || 0;
        if (cantidad > 0) {
            const colorNombre = item.querySelector('.item-name').value;
            data.push([colorNombre, cantidad]);
        }
    });

    const csvContent = "Color,Cantidad\n" + data.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tonos.csv';
    a.click();
    URL.revokeObjectURL(url);
}



const exportButton = document.getElementById('export-button');
if (exportButton) {
    exportButton.addEventListener('click', exportarCSV);
}



const handleSubmit = async (event) => {
    event.preventDefault(); 

    const form = event.target; 
    const nombre = form.querySelector('input[name="Nombre"]').value.trim();
    const apellido = form.querySelector('input[name="Apellido"]').value.trim();
    const telefono = form.querySelector('input[name="numero de telefono"]').value.trim();
    const emailInput = form.querySelector('input[name="Email"]'); 
    const email = emailInput ? emailInput.value.trim() : ''; 
    const plataformaCompra = form.querySelector('select[name="Plataforma de compra"]').value;

    
    let sucursalSeleccionada = '';
    if (plataformaCompra === 'Sucursales' && sucursalSelect) {
        sucursalSeleccionada = sucursalSelect.value.trim();
    }

    
    const selectedTones = [];
    let totalSelectedQuantityUnits = 0; 
    colorItems.forEach(item => {
        const quantity = parseInt(item.querySelector('.quantity').value) || 0;
        if (quantity > 0) {
            const colorNombre = item.querySelector('.item-name').value;
            
            selectedTones.push({ color: colorNombre, quantity: quantity });
            totalSelectedQuantityUnits += quantity; 
        }
    });

    if (!nombre || !apellido || (emailInput && emailInput.hasAttribute('required') && !email) || !plataformaCompra) {
        alert("Por favor, completa todos los campos de cliente obligatorios (Nombre, Apellido, Email, Plataforma de compra).");
        return;
    }

    if (plataformaCompra === 'Sucursales' && !sucursalSeleccionada) {
        alert("Por favor, selecciona una sucursal.");
        sucursalSelect.focus(); 
        return;
    }
    if (selectedTones.length === 0) {
        alert("Por favor, selecciona al menos una tintura antes de enviar.");
        return;
    }


    const dataToSend = {
        fechaPedido: new Date().toISOString(), 
        nombreCliente: `${nombre} ${apellido}`, 
        telefonoCliente: telefono,
        emailCliente: email,
        plataformaCompra: plataformaCompra,
        sucursal: sucursalSeleccionada, 
        cantidadTotalSeleccionada: totalSelectedQuantityUnits, 
        tonosSeleccionadosArray: selectedTones, 
        
        tonosSeleccionadosString: selectedTones.map(tone => `${tone.color} (x${tone.quantity})`).join('\n')
    };

    console.log("Datos que se enviarán a Make.com:", dataToSend);

    try {
        const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataToSend), 
        });

        if (!makeResponse.ok) {
            const errorText = await makeResponse.text();
            throw new Error(`Error de Make.com: ${makeResponse.status} - ${errorText}`);
        }


        alert("Pedido de tinturas enviado correctamente");
        form.reset(); 
        
        if (sucursalSelect) {
            sucursalSelect.style.display = 'none';
            sucursalSelect.removeAttribute('required');
        }


    } catch (error) {
        console.error('Error al enviar el pedido:', error);
        alert(`Ocurrió un error al enviar el pedido: ${error.message || error}. Por favor, inténtalo de nuevo.`);
    }
};


document.querySelector("form").addEventListener("submit", handleSubmit);