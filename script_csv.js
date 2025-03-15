async function parseCSV() {
    try {
        const csv_file = await fetch("datos_personas.csv");
        if (!csv_file.ok) throw new Error("No se encontró el archivo .csv!");
        
        const csvText = await csv_file.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => {
                    return header
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-zA-Z0-9]/g, "")
                        .toLowerCase();
                },
                complete: (results) => resolve(results.data),
                error: (error) => reject(error)
            });
        });
    } catch (error) {
        console.error("Error en parseCSV:", error);
        throw error;
    }
}

const createTable = async () => {
    try {
        const table_data = await parseCSV();
        
        const containers = document.querySelectorAll('.names-container');
        const [container1, container2] = containers;
        const btn_mostrar_mas = document.getElementById('btn_mostrar_mas');
        const searchInput = document.getElementById('searchInput');
        let slide_data = 50;
        let filteredData = [...table_data];

        const renderNames = (data) => {
            if (data.length === 0) {
                container1.innerHTML = '<div class="no-results-message">No se encontraron resultados...</div>';
                container2.style.display = 'none'
                container1.classList.add('empty');
                btn_mostrar_mas.style.display = 'none';
            } else {
                container1.classList.remove('empty');
                container2.style.display = '';
                if (data.length < 50) {
                    // Mostrar solo en container1 si hay pocos resultados
                    container1.innerHTML = data.map((persona, index) => `
                        <div class="name-item" data-id="${index}">
                            ${persona.nombrecompleto}
                            <div class="details">${generateDetails(persona)}</div>
                        </div>
                    `).join('');
                    container2.innerHTML = ''; // Vaciar el segundo contenedor
                } else {
                    // Dividir en dos contenedores si hay muchos resultados
                    const middle = Math.ceil(data.length / 2);
                    const dataPart1 = data.slice(0, middle);
                    const dataPart2 = data.slice(middle);
        
                    container1.innerHTML = dataPart1.slice(0, slide_data).map((persona, index) => `
                        <div class="name-item" data-id="${index}">
                            ${persona.nombrecompleto}
                            <div class="details">${generateDetails(persona)}</div>
                        </div>
                    `).join('');
        
                    container2.innerHTML = dataPart2.slice(0, slide_data).map((persona, index) => `
                        <div class="name-item" data-id="${index + middle}">
                            ${persona.nombrecompleto}
                            <div class="details">${generateDetails(persona)}</div>
                        </div>
                    `).join('');
                }
        
                // Mostrar o esconder el botón de "Mostrar más"
                const totalMostrados = (slide_data * 2);
                btn_mostrar_mas.style.display = totalMostrados >= data.length ? 'none' : 'block';
            }
        };

        // Función auxiliar para generar detalles
        const generateDetails = (persona) => `
            <div class="detail-row"><strong>Nombre completo:</strong> ${persona.nombrecompleto}</div>
            <div class="detail-row"><strong>Edad:</strong> ${persona.edad}</div>
            <div class="detail-row"><strong>Sexo:</strong> ${persona.sexo}</div>
            <div class="detail-row"><strong>Ocupación:</strong> ${persona.ocupacion}</div>
            <div class="detail-row"><strong>Nivel de estudios:</strong> ${persona.niveldeestudios}</div>
        `;

        // Event listeners para ambos contenedores
        
        containers.forEach(container => {
            container.addEventListener('click', (e) => {
                const nameItem = e.target.closest('.name-item');
                if (nameItem) {
                    document.querySelectorAll('.name-item.active').forEach(activeItem => {
                        if (activeItem !== nameItem) activeItem.classList.remove('active');
                    });
                    nameItem.classList.toggle('active');
                    if (nameItem.classList.contains('active')) {
                        nameItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            });
        });

        btn_mostrar_mas.addEventListener('click', () => {
            slide_data += 50;
            renderNames(filteredData);
        });

        searchInput.addEventListener('input', (e) => {
            const searchTerm = removeAccents(e.target.value.trim().toLowerCase());
            filteredData = table_data.filter(persona => 
                removeAccents(persona.nombrecompleto.toLowerCase()).includes(searchTerm)
            );
            slide_data = 50; 
            renderNames(filteredData);
        });

        const removeAccents = (str) => {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };

        renderNames(table_data);

    } catch (error) {
        console.error("Error:", error);
    }
};
createTable();