// =============================
// UTILIDADES
// =============================

function parseNumero(valor) {
    if (typeof valor === "number") return valor;

    if (!valor) return 0;

    valor = String(valor).trim();
    valor = valor.replace(/[^\d,.-]/g, "");

    if (valor.includes(",")) {
        valor = valor.replace(/\./g, "");
        valor = valor.replace(",", ".");
    }

    const numero = Number(valor);

    return isNaN(numero) ? 0 : numero;
}

function arredondar2(valor) {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

// =============================
// CÁLCULO
// =============================

function calcularTaxaFinal(parcelas, mdr, taxaAntecipacao) {

    parcelas = Number(parcelas);
    mdr = parseNumero(mdr);
    taxaAntecipacao = parseNumero(taxaAntecipacao);

    const taxaDiaria = taxaAntecipacao / 30;

    let somaDias = 0;
    for (let i = 1; i <= parcelas; i++) {
        somaDias += i * 30;
    }

    const mediaDias = somaDias / parcelas;

    const antecipacao = taxaDiaria * mediaDias;

    const taxaFinal = mdr + antecipacao;

    return arredondar2(taxaFinal);
}

function obterElementos() {
    return {
        toggleAntecipacao: document.getElementById("toggleAntecipacao"),
        modeButtons: document.querySelectorAll("[data-mode-target]"),
        antecipacao: document.getElementById("antecipacao"),
        editarAntecipacao: document.getElementById("editarAntecipacao"),
        pix: document.getElementById("pix"),
        debito: document.getElementById("debito"),
        avista: document.getElementById("avista"),
        mdr26: document.getElementById("mdr_2_6"),
        mdr712: document.getElementById("mdr_7_12"),
        aluguelToggle: document.getElementById("aluguelToggle"),
        aluguel: document.getElementById("aluguel"),
        manutencaoToggle: document.getElementById("manutencaoToggle"),
        resultContent: document.getElementById("result-content"),
        imageContent: document.getElementById("image-content"),
        imageModeLabel: document.getElementById("image-mode-label"),
        modeHint: document.getElementById("modeHint"),
        modeLabels: document.querySelectorAll("[data-mode-label]")
    };
}

function obterDadosFormulario() {
    const elementos = obterElementos();

    return {
        antecipado: elementos.toggleAntecipacao.checked,
        taxaAntecipacao: parseNumero(elementos.antecipacao.value),
        pix: parseNumero(elementos.pix.value),
        debito: parseNumero(elementos.debito.value),
        avista: parseNumero(elementos.avista.value),
        mdr_2_6: parseNumero(elementos.mdr26.value),
        mdr_7_12: parseNumero(elementos.mdr712.value),
        aluguelAtivo: elementos.aluguelToggle.checked,
        aluguel: parseNumero(elementos.aluguel.value),
        manutencaoAtiva: elementos.manutencaoToggle.checked
    };
}

function criarLinhasResultado(dados) {
    const linhas = [
        { label: "Pix", valor: `${dados.pix.toFixed(2)}%` },
        { label: "Débito", valor: `${dados.debito.toFixed(2)}%` }
    ];

    if (!dados.antecipado) {
        return linhas.concat([
            { label: "À vista", valor: `${dados.avista.toFixed(2)}%` },
            { label: "2x a 6x", valor: `${dados.mdr_2_6.toFixed(2)}%` },
            { label: "7x a 12x", valor: `${dados.mdr_7_12.toFixed(2)}%` }
        ]);
    }

    for (let i = 1; i <= 12; i++) {
        let mdr;

        if (i === 1) mdr = dados.avista;
        else if (i <= 6) mdr = dados.mdr_2_6;
        else mdr = dados.mdr_7_12;

        const taxa = calcularTaxaFinal(i, mdr, dados.taxaAntecipacao);

        linhas.push({
            label: `${i}x`,
            valor: `${taxa.toFixed(2)}%`
        });
    }

    return linhas;
}

function criarResumoCobrancas(dados) {
    const cobrancas = [];

    if (dados.aluguelAtivo) {
        cobrancas.push(`Aluguel da máquina: R$ ${dados.aluguel.toFixed(2)}`);
    }

    if (dados.manutencaoAtiva) {
        cobrancas.push("Manutenção da conta: R$ 19,90");
    }

    return cobrancas;
}

function montarMarkupResultado(linhas, cobrancas) {
    const listaMarkup = linhas.map((linha) => `
        <div class="result-item">
            <span class="result-label">${linha.label}</span>
            <span class="result-value">${linha.valor}</span>
        </div>
    `).join("");

    const cobrancasMarkup = cobrancas.length
        ? `
            <div class="charges-summary">
                <div class="summary-pill-list">
                    ${cobrancas.map((item) => `<span class="summary-pill">${item}</span>`).join("")}
                </div>
            </div>
        `
        : "";

    return `<div class="result-list">${listaMarkup}</div>${cobrancasMarkup}`;
}

function obterMdrPorParcela(parcelas, dados) {
    if (parcelas === 1) return dados.avista;
    if (parcelas <= 6) return dados.mdr_2_6;
    return dados.mdr_7_12;
}

function criarLinhasImagem(dados) {
    const linhas = [];

    for (let i = 1; i <= 12; i++) {
        const mdr = obterMdrPorParcela(i, dados);
        const taxa = dados.antecipado
            ? calcularTaxaFinal(i, mdr, dados.taxaAntecipacao)
            : arredondar2(mdr);

        linhas.push({
            label: i === 1 ? "À vista" : `${i}x`,
            valor: `${taxa.toFixed(2)}%`
        });
    }

    return linhas;
}

function dividirLinhasImagem(linhas) {
    return {
        colunaEsquerda: linhas.slice(0, 6),
        colunaDireita: linhas.slice(6, 12)
    };
}

function montarMarkupImagem(dados) {
    const tabela = criarLinhasImagem(dados);
    const { colunaEsquerda, colunaDireita } = dividirLinhasImagem(tabela);
    const cobrancasMarkup = [
        dados.aluguelAtivo
            ? `
            <div class="image-charge-row">
                <div class="image-charge-copy">
                    <span class="image-charge-icon">✓</span>
                    <span>Aluguel da máquina</span>
                </div>
                <strong>R$ ${dados.aluguel.toFixed(2)}</strong>
            </div>
        `
            : "",
        dados.manutencaoAtiva
            ? `
            <div class="image-charge-row">
                <div class="image-charge-copy">
                    <span class="image-charge-icon">✓</span>
                    <span>Manutenção da conta</span>
                </div>
                <strong>R$ 19,90</strong>
            </div>
        `
            : ""
    ].join("");

    return `
        <div class="top-cards image-highlight-grid">
            <div class="image-highlight-card">
                <span class="image-highlight-label">PIX</span>
                <strong class="image-highlight-value">${dados.pix.toFixed(2)}%</strong>
            </div>
            <div class="image-highlight-card">
                <span class="image-highlight-label">DÉBITO</span>
                <strong class="image-highlight-value">${dados.debito.toFixed(2)}%</strong>
            </div>
        </div>
        <section class="image-credit-section">
            <div class="image-credit-header">
                <span class="image-credit-title">CRÉDITO</span>
                <p class="image-credit-subtitle">Taxas com antecipação</p>
            </div>
            <div class="image-credit-table">
                <div class="image-credit-column">
                    ${colunaEsquerda.map((item, index) => `
                        <div class="image-table-row${index % 2 === 0 ? " is-striped" : ""}">
                            <span>${item.label}</span>
                            <strong>${item.valor}</strong>
                        </div>
                    `).join("")}
                </div>
                <div class="image-credit-column">
                    ${colunaDireita.map((item, index) => `
                        <div class="image-table-row${index % 2 === 0 ? " is-striped" : ""}">
                            <span>${item.label}</span>
                            <strong>${item.valor}</strong>
                        </div>
                    `).join("")}
                </div>
            </div>
        </section>
        ${cobrancasMarkup}
    `;
}

function atualizarIndicadorModo(antecipado) {
    const { modeHint, modeLabels, imageModeLabel } = obterElementos();

    modeLabels.forEach((label) => {
        const ativo = label.dataset.modeLabel === (antecipado ? "on" : "off");
        label.classList.toggle("is-active", ativo);
    });

    if (modeHint) {
        modeHint.textContent = antecipado
            ? "Visualizando taxas com antecipação aplicada."
            : "Visualizando taxas sem antecipação.";
    }

    if (imageModeLabel) {
        imageModeLabel.textContent = antecipado
            ? "Simulação com antecipação"
            : "Simulação sem antecipação";
    }
}

// =============================
// TABELA
// =============================

function gerarTabela() {

    try {
        const elementos = obterElementos();
        const dados = obterDadosFormulario();
        const linhas = criarLinhasResultado(dados);
        const cobrancas = criarResumoCobrancas(dados);
        const markup = montarMarkupResultado(linhas, cobrancas);

        if (elementos.resultContent) {
            elementos.resultContent.innerHTML = markup;
        }

        if (elementos.imageContent) {
            elementos.imageContent.innerHTML = montarMarkupImagem(dados);
        }

        atualizarIndicadorModo(dados.antecipado);
    } catch (erro) {
        console.error("Erro ao gerar tabela:", erro);
        alert("Erro ao calcular. Verifique os valores.");
    }
}

// =============================
// IMAGEM
// =============================

function gerarImagem() {

    const elemento = document.getElementById("imageExport");
    const stage = document.getElementById("imagem-container");

    if (!elemento) {
        alert("Elemento não encontrado");
        return;
    }

    if (stage) {
        stage.style.opacity = "1";
        stage.style.pointerEvents = "auto";
    }

    setTimeout(() => {
        html2canvas(elemento, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: true
        }).then(canvas => {

            canvas.toBlob(function(blob) {
                if (!blob) {
                    alert("Erro ao gerar imagem");
                    if (stage) {
                        stage.style.opacity = "0";
                        stage.style.pointerEvents = "none";
                    }
                    return;
                }

                const url = URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = "simulacao.png";

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);

                if (stage) {
                    stage.style.opacity = "0";
                    stage.style.pointerEvents = "none";
                }
            });

        }).catch(err => {
            console.error("Erro real:", err);
            alert("Erro ao gerar imagem. Veja console.");
            if (stage) {
                stage.style.opacity = "0";
                stage.style.pointerEvents = "none";
            }
        });
    }, 100);
}

function configurarAntecipacaoAvancada() {
    const { antecipacao, editarAntecipacao } = obterElementos();

    if (!antecipacao || !editarAntecipacao) {
        return;
    }

    function solicitarEdicao() {
        if (!antecipacao.disabled) {
            return;
        }

        const desejaEditar = window.confirm("Deseja alterar a antecipação? Isso pode impactar os valores.");

        if (desejaEditar) {
            antecipacao.disabled = false;
            antecipacao.focus();
            antecipacao.select();
        }
    }

    editarAntecipacao.addEventListener("click", solicitarEdicao);

    antecipacao.addEventListener("pointerdown", (event) => {
        if (antecipacao.disabled) {
            event.preventDefault();
            solicitarEdicao();
        }
    });
}

function configurarAtualizacaoAutomatica() {
    const campos = document.querySelectorAll("input");

    campos.forEach((campo) => {
        const evento = campo.type === "checkbox" ? "change" : "input";
        campo.addEventListener(evento, gerarTabela);
    });
}

function configurarCliqueCobrancas() {
    const itens = document.querySelectorAll(".charge-item");

    itens.forEach((item) => {
        item.addEventListener("click", (event) => {
            const alvo = event.target;

            if (
                alvo.closest("input[type='number']") ||
                alvo.closest(".charge-text") ||
                alvo.closest(".checkbox-wrap")
            ) {
                return;
            }

            const checkbox = item.querySelector("input[type='checkbox']");

            if (!checkbox || alvo === checkbox) {
                return;
            }

            checkbox.checked = !checkbox.checked;
            gerarTabela();
        });
    });
}

function configurarToggleModo() {
    const { toggleAntecipacao, modeButtons } = obterElementos();

    if (!toggleAntecipacao) {
        return;
    }

    modeButtons.forEach((botao) => {
        botao.addEventListener("click", () => {
            toggleAntecipacao.checked = botao.dataset.modeTarget === "on";
            gerarTabela();
        });
    });
}

function iniciar() {
    configurarAntecipacaoAvancada();
    configurarToggleModo();
    configurarAtualizacaoAutomatica();
    configurarCliqueCobrancas();
    gerarTabela();
}

document.addEventListener("DOMContentLoaded", iniciar);
