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
        
        const container = document.querySelector('.names-container');
        const btn_mostrar_mas = document.getElementById('btn_mostrar_mas');
        const searchInput = document.getElementById('searchInput');
        let slide_data = 50;
        let filteredData = [...table_data];

        const renderNames = (data) => {
            if (data.length === 0) {
                container.innerHTML = '<div class="no-results-message">No se encontraron resultados...</div>';
                container.classList.add('empty');
                btn_mostrar_mas.style.display = 'none';
            } else {
                container.innerHTML = data.slice(0, slide_data).map((persona, index) => `
                    <div class="name-item" data-id="${index}">
                        ${persona.nombrecompleto}
                        
                        <div class="details" id="details-${index}">
                            <div class="detail-row"><strong>Nombre completo:</strong> ${persona.nombrecompleto}</div>
                            <div class="detail-row"><strong>Edad:</strong> ${persona.edad}</div>
                            <div class="detail-row"><strong>Sexo:</strong> ${persona.sexo}</div>
                            <div class="detail-row"><strong>Ocupación:</strong> ${persona.ocupacion}</div>
                            <div class="detail-row"><strong>Nivel de estudios:</strong> ${persona.niveldeestudios}</div>
                        </div>
                    </div>
                `).join('');
            }
            container.classList.remove('empty');
            if (slide_data >= data.length) {
                btn_mostrar_mas.style.display = 'none';
            } else {
                btn_mostrar_mas.style.display = 'block';
            }
        };

        searchInput.addEventListener('input', (e) => {
            const searchTerm = removeAccents(e.target.value.trim().toLowerCase());
        
            filteredData = table_data.filter(persona => 
                removeAccents(persona.nombrecompleto.toLowerCase()).includes(searchTerm)
            );
        
            slide_data = 50;
            renderNames(filteredData);
        });

        function removeAccents(str) {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }

        btn_mostrar_mas.addEventListener('click', () => {
            slide_data += 50;
            renderNames(filteredData);
        });

        container.addEventListener('click', (e) => {
            const nameItem = e.target.closest('.name-item');
            
            if (nameItem) {
                document.querySelectorAll('.name-item.active').forEach(activeItem => {
                    if (activeItem !== nameItem) {
                        activeItem.classList.remove('active');
                    }
                });
                
                nameItem.classList.toggle('active');
                
                if (nameItem.classList.contains('active')) {
                    nameItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });

        renderNames(table_data);

    } catch (error) {
        console.error("Error:", error);
    }
};

createTable();