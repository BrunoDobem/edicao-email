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

    // Variáveis globais
    let currentTemplate = null;
    let templates = [];

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
            
            // Verifica se temos um template selecionado
            if (!currentTemplate) {
                console.log('Nenhum template selecionado, pulando atualização do preview');
                return;
            }

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
                return;
            }

            console.log('Enviando dados para o servidor:', data);
            const response = await fetch('/api/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    template_id: currentTemplate.id,
                    variables: data
                })
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

    // Carregar templates e variáveis ao iniciar
    console.log('Iniciando editor...');
    carregarTemplates().then(() => {
        // Após carregar os templates, carrega as variáveis
        carregarVariaveis();
    });

    // Funções de manipulação de templates
    async function carregarTemplates() {
        try {
            const response = await fetch('/api/templates');
            const data = await response.json();
            templates = data.templates;
            
            // Atualiza o select de templates
            const select = document.getElementById('templateSelect');
            select.innerHTML = '<option value="">Selecione um template</option>';
            
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = template.name;
                select.appendChild(option);
            });
            
            // Se houver templates, seleciona o primeiro
            if (templates.length > 0) {
                select.value = templates[0].id;
                await carregarTemplate(templates[0].id);
            }
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
            alert('Erro ao carregar templates. Por favor, tente novamente.');
        }
    }

    async function carregarTemplate(templateId) {
        try {
            currentTemplate = templates.find(t => t.id === templateId);
            if (!currentTemplate) return;
            
            // Carrega as variáveis do template
            const response = await fetch('/api/variables');
            const variaveis = await response.json();
            
            // Preenche o formulário com as variáveis
            preencherFormulario(variaveis);
            
            // Gera o preview
            await gerarPreview();
        } catch (error) {
            console.error('Erro ao carregar template:', error);
            alert('Erro ao carregar template. Por favor, tente novamente.');
        }
    }

    async function adicionarTemplate() {
        const form = document.getElementById('addTemplateForm');
        const name = document.getElementById('templateName').value;
        const description = document.getElementById('templateDescription').value;
        const code = document.getElementById('templateCode').value;
        
        if (!name || !code) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description,
                    html: code
                })
            });
            
            if (!response.ok) throw new Error('Erro ao adicionar template');
            
            const novoTemplate = await response.json();
            templates.push(novoTemplate);
            
            // Atualiza o select
            const select = document.getElementById('templateSelect');
            const option = document.createElement('option');
            option.value = novoTemplate.id;
            option.textContent = novoTemplate.name;
            select.appendChild(option);
            select.value = novoTemplate.id;
            
            // Esconde o formulário e limpa os campos
            form.style.display = 'none';
            document.getElementById('templateName').value = '';
            document.getElementById('templateDescription').value = '';
            document.getElementById('templateCode').value = '';
            
            // Carrega o novo template
            await carregarTemplate(novoTemplate.id);
        } catch (error) {
            console.error('Erro ao adicionar template:', error);
            alert('Erro ao adicionar template. Por favor, tente novamente.');
        }
    }

    async function gerarPreview() {
        if (!currentTemplate) return;
        
        try {
            const form = document.getElementById('editorForm');
            const variaveis = {};
            
            // Coleta as variáveis do formulário
            for (const element of form.elements) {
                if (element.name) {
                    const [key, subKey] = element.name.split('.');
                    if (subKey) {
                        if (!variaveis[key]) variaveis[key] = {};
                        variaveis[key][subKey] = element.value;
                    } else {
                        variaveis[key] = element.value;
                    }
                }
            }
            
            // Gera o preview
            const response = await fetch('/api/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    template_id: currentTemplate.id,
                    variables: variaveis
                })
            });
            
            if (!response.ok) throw new Error('Erro ao gerar preview');
            
            const html = await response.text();
            
            // Atualiza o iframe
            const iframe = document.getElementById('previewFrame');
            iframe.srcdoc = html;
            
            // Atualiza o código HTML
            document.getElementById('codigoHTML').textContent = html;
        } catch (error) {
            console.error('Erro ao gerar preview:', error);
            alert('Erro ao gerar preview. Por favor, tente novamente.');
        }
    }

    // Event listeners para o seletor de templates
    document.getElementById('templateSelect').addEventListener('change', (e) => {
        if (e.target.value) {
            carregarTemplate(e.target.value);
        }
    });
    
    // Event listeners para o formulário de novo template
    document.getElementById('addTemplateBtn').addEventListener('click', () => {
        document.getElementById('addTemplateForm').style.display = 'block';
    });
    
    document.getElementById('cancelTemplateBtn').addEventListener('click', () => {
        document.getElementById('addTemplateForm').style.display = 'none';
    });
    
    document.getElementById('saveTemplateBtn').addEventListener('click', adicionarTemplate);
    
    // Event listeners para atualização automática do preview
    document.getElementById('editorForm').addEventListener('input', debounce(gerarPreview, 500));
});

// Função de debounce para limitar a frequência de atualizações
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 