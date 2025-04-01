// Estado global para armazenar as variáveis do template atual
let currentTemplateVariables = [];

// Dados de exemplo para preencher os campos
const exampleData = {
    // Variáveis comuns
    titulo: "Newsletter de Viagens - Ofertas Imperdíveis",
    preview_text: "Confira nossas melhores ofertas de viagens!",
    logo_url: "https://exemplo.com/logo.png",
    logo_alt: "Logo da Agência",

    // Variáveis do template1
    imagem_topo_url: "https://exemplo.com/banner.jpg",
    imagem_topo_alt: "Banner principal",
    link_topo: "https://exemplo.com/promocoes",
    subtitulo: "Aproveite nossas ofertas exclusivas",
    titulo_principal: "Destinos Internacionais com Preços Especiais",

    // Variáveis do template2
    destino1: {
        titulo: "Paris - França",
        descricao: "Conheça a cidade luz com os melhores preços! Passeie pela Torre Eiffel, visite o Museu do Louvre e aproveite a culinária francesa.",
        link: "https://exemplo.com/paris",
        imagem_url: "https://exemplo.com/paris.jpg",
        imagem_alt: "Torre Eiffel ao pôr do sol",
        preco: "R$ 5.999",
        dias: "7 dias"
    },
    destino2: {
        titulo: "Roma - Itália",
        descricao: "Explore a cidade eterna com roteiros exclusivos! Visite o Coliseu, o Vaticano e saboreie a autêntica pizza italiana.",
        link: "https://exemplo.com/roma",
        imagem_url: "https://exemplo.com/roma.jpg",
        imagem_alt: "Coliseu em Roma",
        preco: "R$ 6.499",
        dias: "8 dias"
    },
    destino3: {
        titulo: "Londres - Inglaterra",
        descricao: "Descubra a magia da capital britânica! Conheça o Big Ben, o Palácio de Buckingham e passeie pelo Rio Tâmisa.",
        link: "https://exemplo.com/londres",
        imagem_url: "https://exemplo.com/londres.jpg",
        imagem_alt: "Big Ben e Ponte de Londres",
        preco: "R$ 6.299",
        dias: "6 dias"
    },
    destino4: {
        titulo: "Nova York - EUA",
        descricao: "A cidade que nunca dorme espera por você! Times Square, Central Park e muito mais para explorar.",
        link: "https://exemplo.com/nova-york",
        imagem_url: "https://exemplo.com/nova-york.jpg",
        imagem_alt: "Times Square à noite",
        preco: "R$ 7.499",
        dias: "9 dias"
    },

    // Variáveis do template3
    banner_url: "https://exemplo.com/banner-especial",
    banner_alt: "Banner de oferta especial",
    banner_image: "https://exemplo.com/banner-especial.jpg",
    h1: "Promoção Imperdível: Pacotes com até 30% OFF! 🌍✈️",
    mensagem_principal: "Aproveite nossa promoção especial de férias! Pacotes completos com passagem aérea, hospedagem e passeios inclusos.",
    destaques: "✓ Passagem Aérea\n✓ Hospedagem\n✓ Café da manhã\n✓ Passeios inclusos\n✓ Seguro viagem",
    tipo_pacote: "Pacote Completo",
    destino: "Cancún - México",
    preco_parcelado: "12x de R$ 499,90",
    preco_pix: "R$ 4.999,00",
    botao_url: "https://exemplo.com/pacotes/cancun",
    botao_texto: "Ver Pacote Completo"
};

// Adiciona exemplos para variáveis genéricas encontradas em novos templates
const genericExamples = {
    texto: "Texto de exemplo para o template",
    texto_oferta: "Com essa oferta especial, você garante pacotes a partir de R$ 2.958, sem taxas e com até 60% em Hurb Créditos!",
    texto_chamada: "O presente perfeito para o Valentine's Day está aqui! ✈️👇",
    texto_descricao: "Imagine assistir ao pôr do sol em Santorini, explorar as belezas de Atenas e viver dias inesquecíveis ao lado de quem você ama…",
    descricao: "Descrição detalhada da oferta ou promoção atual",
    banner_topo_url: "https://exemplo.com/banner-topo.jpg",
    banner_topo_alt: "Banner do topo da página",
    banner_url: "https://exemplo.com/banner-oferta.jpg",
    banner_alt: "Banner com oferta especial",
    link_url: "https://exemplo.com/promocao-especial",
    imagem1_url: "https://exemplo.com/imagem1.jpg",
    imagem1_alt: "Descrição da imagem 1",
    imagem2_url: "https://exemplo.com/imagem2.jpg",
    imagem2_alt: "Descrição da imagem 2",
    imagem3_url: "https://exemplo.com/imagem3.jpg",
    imagem3_alt: "Descrição da imagem 3"
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
    if (!field) return;

    // Se um valor específico não foi encontrado no exampleData, tenta usar um genérico
    if (value === undefined) {
        const fieldName = field.name;

        // Extrai a parte base e o número (se houver)
        const match = fieldName.match(/^([a-zA-Z_]+)(\d*)$/);
        const baseName = match ? match[1] : fieldName;
        const numberSuffix = match ? match[2] : '';

        // Tenta encontrar um exemplo genérico, começando pelo nome exato
        let foundExample = false;

        // Primeiro tenta pelo nome exato
        for (const [pattern, exampleValue] of Object.entries(genericExamples)) {
            if (fieldName === pattern) {
                value = exampleValue;
                foundExample = true;
                break;
            }
        }

        // Se não encontrou, tenta pelo nome base
        if (!foundExample) {
            for (const [pattern, exampleValue] of Object.entries(genericExamples)) {
                if (baseName === pattern) {
                    // Se for texto, adiciona o número para diferenciar
                    if (baseName.includes('texto') || baseName.includes('titulo')) {
                        value = `${exampleValue}${numberSuffix ? ` #${numberSuffix}` : ''}`;
                    } else {
                        value = exampleValue;
                    }
                    foundExample = true;
                    break;
                }
            }
        }

        // Se ainda não encontrou, tenta por inclusão
        if (!foundExample) {
            for (const [pattern, exampleValue] of Object.entries(genericExamples)) {
                if (fieldName.includes(pattern)) {
                    if (pattern.includes('texto') || pattern.includes('titulo')) {
                        value = `${exampleValue}${numberSuffix ? ` #${numberSuffix}` : ''}`;
                    } else {
                        value = exampleValue;
                    }
                    foundExample = true;
                    break;
                }
            }
        }

        // Se ainda não tem valor, usa um padrão baseado no tipo
        if (value === undefined) {
            if (fieldName.includes('url') || fieldName.includes('image')) {
                value = `https://exemplo.com/${fieldName}.jpg`;
            } else if (fieldName.includes('alt')) {
                value = `Descrição para ${fieldName}`;
            } else if (fieldName.includes('titulo')) {
                value = `Título ${numberSuffix || ''}: ${baseName}`;
            } else if (fieldName.includes('texto')) {
                value = `Texto exemplo ${numberSuffix || ''}: ${baseName}`;
            } else {
                value = `Valor para ${fieldName}`;
            }
        }
    }

    field.value = value;

    // Dispara um evento de input para atualizar o preview
    field.dispatchEvent(new Event('input'));
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

    // Mapa de prefixos conhecidos para nomes de grupos
    const prefixesMap = {
        'logo': 'logos',
        'banner': 'banners',
        'imagem': 'imagens',
        'titulo': 'títulos',
        'texto': 'textos',
        'link': 'links',
        'botao': 'botões'
    };

    // Processa e agrupa variáveis, removendo os números do final para agrupar corretamente
    variables.forEach(variable => {
        // Verifica se é uma variável aninhada
        if (variable.includes('.')) {
            const [parent, child] = variable.split('.');
            // Remove os números do final do nome do pai para agrupamento
            const baseParent = parent.replace(/\d+$/, '');

            if (!groups[baseParent]) {
                groups[baseParent] = [];
            }

            // Mantém o nome original completo para o campo
            groups[baseParent].push(variable);
            return;
        }

        // Para variáveis simples, tentamos determinar o grupo base
        // Removendo qualquer número do final (texto1, texto2 -> texto)
        const baseVariable = variable.replace(/\d+$/, '');

        // Identifica o grupo apropriado
        let group = 'geral';

        for (const [prefix, groupName] of Object.entries(prefixesMap)) {
            if (baseVariable.toLowerCase().startsWith(prefix)) {
                group = groupName;
                break;
            }
        }

        // Também verifica se é um destino conhecido
        if (baseVariable.startsWith('destino')) {
            const destNum = baseVariable.substring(7);
            group = `destino${destNum}`;
        }

        // Inicializa o grupo se necessário
        if (!groups[group]) {
            groups[group] = [];
        }

        // Adiciona a variável ao grupo, mantendo o nome original com número
        groups[group].push(variable);
    });

    console.log('[Debug] Grupos de variáveis:', groups);

    // Cria as seções de campos
    // Primeiro, processa "geral" se existir
    if (groups['geral']) {
        createFieldsSection(formContainer, 'Configurações Gerais', groups['geral']);
    }

    // Depois, processa os outros grupos
    Object.entries(groups).forEach(([group, vars]) => {
        if (group !== 'geral') {
            // Formata o título do grupo
            let title;
            if (group.startsWith('destino')) {
                title = `Destino ${group.substring(7)}`;
            } else {
                title = group.charAt(0).toUpperCase() + group.slice(1);
            }

            createFieldsSection(formContainer, title, vars);
        }
    });

    // Adiciona event listeners para atualização automática
    const inputs = formContainer.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(generatePreview, 500));
    });

    // Gera o preview inicial
    generatePreview();
}

// Função auxiliar para criar uma seção de campos
function createFieldsSection(container, title, variables) {
    const section = document.createElement('div');
    section.className = 'form-section';
    section.innerHTML = `<h3>${title}</h3>`;

    variables.forEach(variable => {
        const field = createField(variable);
        section.appendChild(field);

        // Preenche o campo com dados de exemplo
        const input = field.querySelector('input, textarea');

        // Lógica de preenchimento para variáveis aninhadas e simples
        if (variable.includes('.')) {
            const [parent, child] = variable.split('.');
            fillFieldWithExample(input, exampleData[parent]?.[child]);
        } else {
            fillFieldWithExample(input, exampleData[variable]);
        }
    });

    container.appendChild(section);
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

    if (!form || form.elements.length === 0) {
        console.error('[Debug] Formulário vazio ou não encontrado!');
        return;
    }

    // Coleta os valores dos campos
    Array.from(form.elements).forEach(element => {
        if (element.name && element.tagName !== 'BUTTON') {
            const parts = element.name.split('.');
            if (parts.length > 1) {
                // Variável aninhada (ex: destino1.titulo)
                if (!formData[parts[0]]) formData[parts[0]] = {};
                formData[parts[0]][parts[1]] = element.value || '';
                console.log(`[Debug] Coletando variável aninhada: ${parts[0]}.${parts[1]} = ${element.value.substring(0, 30) + (element.value.length > 30 ? '...' : '')}`);
            } else {
                // Variável simples
                formData[element.name] = element.value || '';
                console.log(`[Debug] Coletando variável: ${element.name} = ${element.value.substring(0, 30) + (element.value.length > 30 ? '...' : '')}`);
            }

            // Registra valores vazios para depuração
            if (!element.value) {
                console.warn(`[Debug] Campo vazio: ${element.name}`);
            }
        }
    });

    // Verifica se temos dados para enviar
    if (Object.keys(formData).length === 0) {
        console.error('[Debug] Nenhum dado coletado do formulário!');
        return;
    }

    try {
        const templateName = document.getElementById('templateSelect').value;
        if (!templateName) {
            console.error('[Debug] Nome do template não encontrado!');
            return;
        }

        console.log('[Debug] Template selecionado para preview:', templateName);
        console.log('[Debug] Total de variáveis enviadas:', Object.keys(formData).length);
        console.log('[Debug] Dados do formulário:', formData);

        // Log de debug para verificar se as variáveis numeradas estão sendo enviadas corretamente
        const numVariables = Object.keys(formData).filter(key => /^[a-zA-Z_]+\d+$/.test(key));
        if (numVariables.length > 0) {
            console.log('[Debug] Variáveis numeradas:', numVariables);
            numVariables.forEach(varName => {
                console.log(`[Debug] - ${varName}: ${formData[varName]}`);
            });
        }

        const previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) {
            console.error('[Debug] Frame de preview não encontrado!');
            return;
        }

        // Exibe mensagem de carregamento no preview
        previewFrame.srcdoc = '<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;"><h3>Gerando preview...</h3><p>Aguarde enquanto processamos seu template.</p></body></html>';

        const response = await fetch(`/api/preview?template=${templateName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        console.log('[Debug] Status da resposta do preview:', response.status);

        if (response.ok) {
            const html = await response.text();

            if (!html || html.length === 0) {
                console.error('[Debug] Resposta vazia do servidor!');
                previewFrame.srcdoc = '<html><body style="font-family: Arial, sans-serif; text-align: center; color: red; padding: 20px;"><h3>Erro no Preview</h3><p>O servidor retornou uma resposta vazia.</p></body></html>';
                return;
            }

            previewFrame.srcdoc = html;
            console.log('[Debug] Preview atualizado com sucesso, tamanho do HTML:', html.length);

            // Verifica se há variáveis não substituídas
            const notReplacedVars = html.match(/\{\{\s*[^}]+\s*\}\}/g);
            if (notReplacedVars && notReplacedVars.length > 0) {
                console.warn('[Debug] Variáveis não substituídas no preview:', notReplacedVars);
            }
        } else {
            const errorText = await response.text();
            console.error('[Debug] Erro na resposta do preview:', errorText);
            previewFrame.srcdoc = `<html><body style="font-family: Arial, sans-serif; text-align: center; color: red; padding: 20px;"><h3>Erro no Preview</h3><p>${errorText}</p></body></html>`;
            alert('Erro ao gerar preview. Verifique o console para mais detalhes.');
        }
    } catch (error) {
        console.error('[Debug] Erro ao gerar preview:', error);
        const previewFrame = document.getElementById('previewFrame');
        if (previewFrame) {
            previewFrame.srcdoc = `<html><body style="font-family: Arial, sans-serif; text-align: center; color: red; padding: 20px;"><h3>Erro no Preview</h3><p>${error.message}</p></body></html>`;
        }
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

    // Adiciona botão de recarregar variáveis (criado dinamicamente)
    const formContainer = document.getElementById('editorForm');
    const reloadButton = document.createElement('button');
    reloadButton.type = 'button';
    reloadButton.id = 'reloadVariables';
    reloadButton.className = 'btn btn-secondary reload-button';
    reloadButton.textContent = 'Recarregar Variáveis';
    reloadButton.addEventListener('click', function (event) {
        event.preventDefault();
        reloadVariables();
    });

    // Insere o botão no início do formulário
    if (formContainer.firstChild) {
        formContainer.insertBefore(reloadButton, formContainer.firstChild);
    } else {
        formContainer.appendChild(reloadButton);
    }

    // Se já tiver um template selecionado, carrega suas variáveis
    const selectedTemplate = document.getElementById('templateSelect').value;
    if (selectedTemplate) {
        loadTemplateVariables(selectedTemplate).then(variables => {
            createDynamicFields(variables);
        }).catch(error => {
            console.error('[Debug] Erro ao carregar variáveis:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Erro ao carregar variáveis. Tente recarregar.';
            formContainer.prepend(errorMessage);
        });
    }

    console.log('[Debug] Setup concluído');
});

// Função para recarregar variáveis manualmente
async function reloadVariables() {
    const selectedTemplate = document.getElementById('templateSelect').value;
    if (!selectedTemplate) {
        alert('Selecione um template primeiro!');
        return;
    }

    console.log('[Debug] Recarregando variáveis para:', selectedTemplate);

    try {
        // Limpa o cache do navegador para esta requisição
        const timestamp = new Date().getTime();
        const variables = await loadTemplateVariables(`${selectedTemplate}?t=${timestamp}`);

        if (variables && variables.length > 0) {
            createDynamicFields(variables);
            console.log('[Debug] Variáveis recarregadas com sucesso:', variables);
            alert('Variáveis recarregadas com sucesso!');

            // Gera o preview imediatamente
            generatePreview();
        } else {
            console.warn('[Debug] Nenhuma variável encontrada após recarga');
            alert('Nenhuma variável encontrada para este template.');
        }
    } catch (error) {
        console.error('[Debug] Erro ao recarregar variáveis:', error);
        alert('Erro ao recarregar variáveis. Verifique o console para mais detalhes.');
    }
}

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
