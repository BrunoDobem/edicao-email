document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('editorForm');
    const previewFrame = document.getElementById('previewFrame');
    const salvarBtn = document.getElementById('salvar');
    const previewBtn = document.getElementById('preview');
    const codigoBtn = document.getElementById('codigo');
    const previewContainer = document.getElementById('previewContainer');
    const codigoContainer = document.getElementById('codigoContainer');
    const codigoHTML = document.getElementById('codigoHTML');
    const copiarBtn = document.getElementById('copiarCodigo');
    const copiadoMensagem = document.getElementById('copiadoMensagem');

    // Carregar variáveis do servidor
    async function carregarVariaveis() {
        try {
            console.log('Carregando variáveis do servidor...');
            const response = await fetch('/api/variables');
            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Erro ao carregar variáveis (${response.status}): ${responseText}`);
            }
            const data = await response.json();
            console.log('Variáveis carregadas com sucesso:', data);
            preencherFormulario(data);
            
            // Atualizar preview após carregar as variáveis
            setTimeout(atualizarPreview, 500);
        } catch (error) {
            console.error('Erro ao carregar variáveis:', error);
            alert('Erro ao carregar as variáveis. Por favor, tente novamente.');
        }
    }

    // Preencher formulário com as variáveis
    function preencherFormulario(data) {
        console.log('Preenchendo formulário com variáveis...');
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object') {
                for (const [subKey, subValue] of Object.entries(value)) {
                    const input = document.querySelector(`[name="${key}.${subKey}"]`);
                    if (input) {
                        input.value = subValue;
                        console.log(`Preenchendo: ${key}.${subKey} = ${subValue}`);
                    } else {
                        console.warn(`Campo não encontrado: ${key}.${subKey}`);
                    }
                }
            } else {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                    console.log(`Preenchendo: ${key} = ${value}`);
                } else {
                    console.warn(`Campo não encontrado: ${key}`);
                }
            }
        }
    }

    // Alternar entre preview e código
    function alternarVisualizacao() {
        if (previewContainer.style.display !== 'none') {
            previewContainer.style.display = 'none';
            codigoContainer.style.display = 'block';
            codigoBtn.textContent = 'Ver Preview';
            copiarBtn.style.display = 'flex';
        } else {
            previewContainer.style.display = 'block';
            codigoContainer.style.display = 'none';
            codigoBtn.textContent = 'Ver Código';
            copiarBtn.style.display = 'none';
        }
    }

    // Ajustar tamanho do preview
    function ajustarPreview() {
        const previewFrame = document.getElementById('previewFrame');
        if (previewFrame.contentDocument) {
            const body = previewFrame.contentDocument.body;
            if (body) {
                body.style.margin = '0';
                body.style.padding = '0';
                body.style.width = '100%';
                body.style.height = '100%';
            }
        }
    }

    // Atualizar preview
    async function atualizarPreview() {
        try {
            console.log('Atualizando preview...');
            const formData = new FormData(form);
            const data = {};
            
            for (const [key, value] of formData.entries()) {
                if (key.includes('.')) {
                    const [parent, child] = key.split('.');
                    if (!data[parent]) {
                        data[parent] = {};
                    }
                    data[parent][child] = value;
                    console.log(`Coletando dado: ${parent}.${child} = ${value}`);
                } else {
                    data[key] = value;
                    console.log(`Coletando dado: ${key} = ${value}`);
                }
            }

            // Verificar se há dados a serem enviados
            if (Object.keys(data).length === 0) {
                console.warn('Nenhum dado coletado do formulário!');
                alert('Erro: Nenhum dado disponível para atualizar o preview.');
                return;
            }

            console.log('Enviando dados para o servidor:', data);
            const response = await fetch('/api/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Erro ao gerar preview (${response.status}): ${responseText}`);
            }

            const html = await response.text();
            console.log('Preview gerado com sucesso!');
            
            previewFrame.srcdoc = html;
            codigoHTML.textContent = html;

            // Ajustar o preview após carregar o conteúdo
            previewFrame.onload = ajustarPreview;
        } catch (error) {
            console.error('Erro ao atualizar preview:', error);
            alert('Erro ao atualizar o preview: ' + error.message);
        }
    }

    // Salvar alterações
    async function salvarAlteracoes() {
        try {
            console.log('Salvando alterações...');
            const formData = new FormData(form);
            const data = {};
            
            for (const [key, value] of formData.entries()) {
                if (key.includes('.')) {
                    const [parent, child] = key.split('.');
                    if (!data[parent]) {
                        data[parent] = {};
                    }
                    data[parent][child] = value;
                } else {
                    data[key] = value;
                }
            }

            // Verificar se há dados a serem enviados
            if (Object.keys(data).length === 0) {
                console.warn('Nenhum dado coletado do formulário para salvar!');
                alert('Erro: Nenhum dado disponível para salvar.');
                return;
            }

            console.log('Enviando dados para salvar:', data);
            const response = await fetch('/api/variables', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Erro ao salvar alterações (${response.status}): ${responseText}`);
            }

            console.log('Alterações salvas com sucesso!');
            alert('Alterações salvas com sucesso!');
            
            // Atualizar preview após salvar
            atualizarPreview();
        } catch (error) {
            console.error('Erro ao salvar alterações:', error);
            alert('Erro ao salvar as alterações: ' + error.message);
        }
    }

    // Copiar código para a área de transferência
    async function copiarCodigo() {
        try {
            console.log('Copiando código para área de transferência...');
            if (!codigoHTML.textContent) {
                alert('Nenhum código disponível para copiar.');
                return;
            }
            
            await navigator.clipboard.writeText(codigoHTML.textContent);
            console.log('Código copiado com sucesso!');
            mostrarMensagemCopiado();
        } catch (error) {
            console.error('Erro ao copiar código:', error);
            alert('Erro ao copiar o código: ' + error.message);
        }
    }

    // Mostrar mensagem de código copiado
    function mostrarMensagemCopiado() {
        copiadoMensagem.classList.add('ativo');
        setTimeout(() => {
            copiadoMensagem.classList.remove('ativo');
        }, 2000);
    }

    // Event Listeners
    previewBtn.addEventListener('click', atualizarPreview);
    salvarBtn.addEventListener('click', salvarAlteracoes);
    codigoBtn.addEventListener('click', alternarVisualizacao);
    copiarBtn.addEventListener('click', copiarCodigo);

    // Inicialização: configurar visibilidade padrão
    previewContainer.style.display = 'block';
    codigoContainer.style.display = 'none';
    copiarBtn.style.display = 'none';

    // Carregar variáveis ao iniciar
    console.log('Iniciando editor...');
    carregarVariaveis();
}); 