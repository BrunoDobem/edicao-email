// Estado global para armazenar as variáveis do template atual
let currentTemplateVariables = [];

// Dados de exemplo para preencher os campos
const exampleData = {
    h1: "Promoção Imperdível: Destinos Internacionais com Preços Especiais! ✈️",
    destino1: {
        titulo: "Paris - França",
        descricao: "Conheça a cidade luz com os melhores preços! Passeie pela Torre Eiffel, visite o Museu do Louvre e aproveite a culinária francesa.",
        link: "https://exemplo.com/paris",
        imagem_url: "https://exemplo.com/paris.jpg",
        imagem_alt: "Torre Eiffel ao pôr do sol",
        preco: "R$ 5.999",
        dias: "7"
    },
    destino2: {
        titulo: "Roma - Itália",
        descricao: "Explore a cidade eterna com roteiros exclusivos! Visite o Coliseu, o Vaticano e saboreie a autêntica pizza italiana.",
        link: "https://exemplo.com/roma",
        imagem_url: "https://exemplo.com/roma.jpg",
        imagem_alt: "Coliseu em Roma",
        preco: "R$ 6.499",
        dias: "8"
    },
    destino3: {
        titulo: "Londres - Inglaterra",
        descricao: "Descubra a magia da capital britânica! Conheça o Big Ben, o Palácio de Buckingham e passeie pelo Rio Tâmisa.",
        link: "https://exemplo.com/londres",
        imagem_url: "https://exemplo.com/londres.jpg",
        imagem_alt: "Big Ben e Ponte de Londres",
        preco: "R$ 6.299",
        dias: "6"
    },
    destino4: {
        titulo: "Nova York - EUA",
        descricao: "A cidade que nunca dorme espera por você! Times Square, Central Park e muito mais para explorar.",
        link: "https://exemplo.com/nova-york",
        imagem_url: "https://exemplo.com/nova-york.jpg",
        imagem_alt: "Times Square à noite",
        preco: "R$ 7.499",
        dias: "9"
    }
};

// Função para carregar as variáveis do template
async function loadTemplateVariables(templateName) {
    try {
        console.log('[Debug] Iniciando carregamento de variáveis para:', templateName);

        const response = await fetch(`/api/templates/${templateName}/variables`);
        console.log('[Debug] Status da resposta:', response.status);

        const data = await response.json();
        console.log('[Debug] Dados recebidos:', data);

        if (!data.variables) {
            console.error('[Debug] Nenhuma variável encontrada nos dados');
            return [];
        }

        // Armazena as variáveis globalmente
        currentTemplateVariables = data.variables;
        console.log('[Debug] Variáveis armazenadas:', currentTemplateVariables);

        return currentTemplateVariables;
    } catch (error) {
        console.error('[Debug] Erro ao carregar variáveis:', error);
        return [];
    }
}

// Função para preencher um campo com valor de exemplo
function fillFieldWithExample(field, value) {
    if (field && value !== undefined) {
        field.value = value;
        // Dispara um evento de input para atualizar o preview
        field.dispatchEvent(new Event('input'));
    }
}

// Função para criar campos dinâmicos baseados nas variáveis
function createDynamicFields(variables) {
    console.log('[Debug] Iniciando criação de campos para variáveis:', variables);

    const formContainer = document.getElementById('editorForm');
    if (!formContainer) {
        console.error('[Debug] Elemento editorForm não encontrado!');
        return;
    }

    // Limpa os campos existentes
    formContainer.innerHTML = '';

    if (!variables || variables.length === 0) {
        console.warn('[Debug] Nenhuma variável disponível');
        formContainer.innerHTML = '<p>Nenhuma variável disponível para este template.</p>';
        return;
    }

    // Cria um objeto para agrupar as variáveis
    const groups = {};

    // Agrupa variáveis simples
    variables.forEach(variable => {
        if (!variable.includes('.') && !['destino1', 'destino2', 'destino3', 'destino4'].includes(variable)) {
            if (!groups['geral']) groups['geral'] = [];
            groups['geral'].push(variable);
        }
    });

    // Agrupa destinos
    for (let i = 1; i <= 4; i++) {
        const destino = `destino${i}`;
        if (variables.includes(destino)) {
            if (!groups[destino]) groups[destino] = [];
            groups[destino].push('titulo');
            groups[destino].push('descricao');
            groups[destino].push('link');
            groups[destino].push('imagem_url');
            groups[destino].push('imagem_alt');
            groups[destino].push('preco');
            groups[destino].push('dias');
        }
    }

    console.log('[Debug] Grupos de variáveis:', groups);

    // Cria as seções de campos
    Object.entries(groups).forEach(([group, vars]) => {
        const section = document.createElement('div');
        section.className = 'form-section';

        const title = group === 'geral' ? 'Configurações Gerais' :
            group.charAt(0).toUpperCase() + group.slice(1);

        section.innerHTML = `<h3>${title}</h3>`;

        vars.forEach(variable => {
            const field = createField(group === 'geral' ? variable : `${group}.${variable}`);
            section.appendChild(field);

            // Preenche o campo com dados de exemplo
            const input = field.querySelector('input, textarea');
            if (group === 'geral') {
                fillFieldWithExample(input, exampleData[variable]);
            } else {
                fillFieldWithExample(input, exampleData[group]?.[variable]);
            }
        });

        formContainer.appendChild(section);
    });

    // Adiciona event listeners para atualização automática
    const inputs = formContainer.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(generatePreview, 500));
    });

    // Gera o preview inicial
    generatePreview();
}

// Função auxiliar para criar um campo individual
function createField(variable) {
    console.log('[Debug] Criando campo para variável:', variable);

    const container = document.createElement('div');
    container.className = 'form-group';

    const label = document.createElement('label');
    label.htmlFor = variable;
    label.textContent = variable.split('.').join(' > ');

    const input = document.createElement(variable.includes('descricao') ? 'textarea' : 'input');
    input.id = variable;
    input.name = variable;
    input.className = 'form-control';

    if (input.tagName === 'INPUT') {
        input.type = variable.includes('url') || variable.includes('image') ? 'url' : 'text';
    } else {
        input.rows = 4;
    }

    container.appendChild(label);
    container.appendChild(input);

    return container;
}

// Função para gerar o preview
async function generatePreview() {
    console.log('[Debug] Iniciando geração de preview');

    const formData = {};
    const form = document.getElementById('editorForm');

    // Coleta os valores dos campos
    Array.from(form.elements).forEach(element => {
        if (element.name) {
            const parts = element.name.split('.');
            if (parts.length > 1) {
                // Variável aninhada (ex: destino1.titulo)
                if (!formData[parts[0]]) formData[parts[0]] = {};
                formData[parts[0]][parts[1]] = element.value;
            } else {
                // Variável simples
                formData[element.name] = element.value;
            }
            console.log(`[Debug] Campo ${element.name}:`, element.value);
        }
    });

    try {
        const templateName = document.getElementById('templateSelect').value;
        console.log('[Debug] Template selecionado para preview:', templateName);
        console.log('[Debug] Dados do formulário:', formData);

        const response = await fetch(`/api/preview?template=${templateName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        console.log('[Debug] Status da resposta do preview:', response.status);

        if (response.ok) {
            const html = await response.text();
            const previewFrame = document.getElementById('previewFrame');
            previewFrame.srcdoc = html;
            console.log('[Debug] Preview atualizado com sucesso');
        } else {
            const errorText = await response.text();
            console.error('[Debug] Erro na resposta do preview:', errorText);
            alert('Erro ao gerar preview. Verifique o console para mais detalhes.');
        }
    } catch (error) {
        console.error('[Debug] Erro ao gerar preview:', error);
        alert('Erro ao gerar preview. Verifique o console para mais detalhes.');
    }
}

// Função para salvar as alterações
async function saveChanges() {
    console.log('[Debug] Iniciando salvamento de alterações');

    const formData = {};
    const form = document.getElementById('editorForm');

    // Coleta os valores dos campos
    Array.from(form.elements).forEach(element => {
        if (element.name) {
            const parts = element.name.split('.');
            if (parts.length > 1) {
                // Variável aninhada (ex: destino1.titulo)
                if (!formData[parts[0]]) formData[parts[0]] = {};
                formData[parts[0]][parts[1]] = element.value;
            } else {
                // Variável simples
                formData[element.name] = element.value;
            }
        }
    });

    console.log('[Debug] Dados a serem salvos:', formData);

    try {
        const response = await fetch('/api/variables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        console.log('[Debug] Status da resposta do salvamento:', response.status);

        if (response.ok) {
            alert('Alterações salvas com sucesso!');
        } else {
            const errorText = await response.text();
            console.error('[Debug] Erro ao salvar:', errorText);
            alert('Erro ao salvar alterações. Verifique o console para mais detalhes.');
        }
    } catch (error) {
        console.error('[Debug] Erro ao salvar:', error);
        alert('Erro ao salvar alterações. Verifique o console para mais detalhes.');
    }
}

// Função para mostrar o código HTML
async function showCode() {
    console.log('[Debug] Iniciando exibição do código');

    const previewContainer = document.getElementById('previewContainer');
    const codigoContainer = document.getElementById('codigoContainer');
    const codigoHTML = document.getElementById('codigoHTML');

    try {
        const templateName = document.getElementById('templateSelect').value;
        const formData = {};
        const form = document.getElementById('editorForm');

        // Coleta os valores dos campos
        Array.from(form.elements).forEach(element => {
            if (element.name) {
                const parts = element.name.split('.');
                if (parts.length > 1) {
                    if (!formData[parts[0]]) formData[parts[0]] = {};
                    formData[parts[0]][parts[1]] = element.value;
                } else {
                    formData[element.name] = element.value;
                }
            }
        });

        const response = await fetch(`/api/preview?template=${templateName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const html = await response.text();
            codigoHTML.textContent = html;
            previewContainer.style.display = 'none';
            codigoContainer.style.display = 'block';
        } else {
            const errorText = await response.text();
            console.error('[Debug] Erro ao obter código:', errorText);
            alert('Erro ao obter código. Verifique o console para mais detalhes.');
        }
    } catch (error) {
        console.error('[Debug] Erro ao mostrar código:', error);
        alert('Erro ao mostrar código. Verifique o console para mais detalhes.');
    }
}

// Função para copiar o código
function copyCode() {
    const codigoHTML = document.getElementById('codigoHTML');
    const copiadoMensagem = document.getElementById('copiadoMensagem');

    navigator.clipboard.writeText(codigoHTML.textContent)
        .then(() => {
            copiadoMensagem.style.display = 'block';
            setTimeout(() => {
                copiadoMensagem.style.display = 'none';
            }, 2000);
        })
        .catch(err => {
            console.error('[Debug] Erro ao copiar código:', err);
            alert('Erro ao copiar código. Verifique o console para mais detalhes.');
        });
}

// Função para alternar entre preview e código
function toggleView() {
    const previewContainer = document.getElementById('previewContainer');
    const codigoContainer = document.getElementById('codigoContainer');
    const codigoButton = document.getElementById('codigo');

    if (codigoContainer.style.display === 'none') {
        showCode();
        codigoButton.textContent = 'Ver Preview';
    } else {
        previewContainer.style.display = 'block';
        codigoContainer.style.display = 'none';
        codigoButton.textContent = 'Ver Código';
    }
}

// Função de debounce para evitar muitas chamadas seguidas
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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Debug] Página carregada, iniciando setup');

    // Configura os event listeners
    document.getElementById('templateSelect').addEventListener('change', function () {
        const template = this.value;
        if (template) {
            window.location.href = `/editor?template=${template}`;
        }
    });

    document.getElementById('preview').addEventListener('click', generatePreview);
    document.getElementById('salvar').addEventListener('click', saveChanges);
    document.getElementById('codigo').addEventListener('click', toggleView);
    document.getElementById('copiarCodigo').addEventListener('click', copyCode);

    // Se já tiver um template selecionado, carrega suas variáveis
    const selectedTemplate = document.getElementById('templateSelect').value;
    if (selectedTemplate) {
        loadTemplateVariables(selectedTemplate).then(variables => {
            createDynamicFields(variables);
        });
    }

    console.log('[Debug] Setup concluído');
});

// Adiciona listener para erros globais
window.addEventListener('error', (event) => {
    console.error('[Debug] Erro global:', {
        message: event.message,
        source: event.source,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});
