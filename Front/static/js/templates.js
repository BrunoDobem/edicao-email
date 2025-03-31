// Função para carregar o preview do template
async function loadTemplatePreview(templateName) {
    try {
        console.log('[Debug] Carregando preview para:', templateName);

        // Dados de exemplo para o preview
        const exampleData = {
            h1: "Exemplo de título do email",
            destino1: {
                titulo: "Paris - França",
                descricao: "Conheça a cidade luz com os melhores preços!",
                link: "https://exemplo.com/paris",
                imagem_url: "https://exemplo.com/paris.jpg",
                imagem_alt: "Torre Eiffel ao pôr do sol",
                preco: "R$ 5.999",
                dias: "7"
            },
            destino2: {
                titulo: "Roma - Itália",
                descricao: "Explore a cidade eterna com roteiros exclusivos!",
                link: "https://exemplo.com/roma",
                imagem_url: "https://exemplo.com/roma.jpg",
                imagem_alt: "Coliseu em Roma",
                preco: "R$ 6.499",
                dias: "8"
            }
        };

        const response = await fetch(`/api/preview?template=${templateName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exampleData)
        });

        if (response.ok) {
            const html = await response.text();
            return html;
        } else {
            console.error('[Debug] Erro ao carregar preview:', await response.text());
            return null;
        }
    } catch (error) {
        console.error('[Debug] Erro ao carregar preview:', error);
        return null;
    }
}

// Função para atualizar os previews de todos os templates
async function updateTemplatePreviews() {
    const previewFrames = document.querySelectorAll('.template-preview');

    for (const frame of previewFrames) {
        const templateName = frame.getAttribute('data-template');
        const html = await loadTemplatePreview(templateName);

        if (html) {
            frame.srcdoc = html;
            // Esconde a mensagem de carregamento
            frame.parentElement.querySelector('.loading').style.display = 'none';
        }
    }
}

// Função para duplicar um template
async function duplicateTemplate(nome) {
    const novoNome = prompt('Digite o nome para a cópia do template:');
    if (!novoNome) return;

    try {
        const response = await fetch(`/api/templates/${nome}/duplicate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                novo_nome: novoNome
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao duplicar template');
        }

        window.location.reload();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao duplicar template. Por favor, tente novamente.');
    }
}

// Função para excluir um template
async function deleteTemplate(nome) {
    if (!confirm(`Tem certeza que deseja excluir o template "${nome}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/templates/${nome}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir template');
        }

        window.location.reload();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir template. Por favor, tente novamente.');
    }
}

// Função para renomear um template
async function renameTemplate(nome) {
    const novoNome = prompt('Digite o novo nome para o template:', nome);

    if (!novoNome || novoNome === nome) return;

    // Validação básica do novo nome
    if (!/^[a-zA-Z0-9_-]+$/.test(novoNome)) {
        alert('O nome do template só pode conter letras, números, hífen e underscore.');
        return;
    }

    try {
        const response = await fetch(`/api/templates/${nome}/rename`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                novo_nome: novoNome
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        // Recarrega a página após renomear com sucesso
        window.location.reload();
    } catch (error) {
        console.error('[Debug] Erro ao renomear template:', error);
        alert('Erro ao renomear template. Por favor, tente novamente.');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Debug] Página de templates carregada');
    updateTemplatePreviews();
});
