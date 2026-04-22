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
    if (!dados.antecipado) {
        return [
            { label: "Pix", valor: `${dados.pix.toFixed(2)}%` },
            { label: "Débito", valor: `${dados.debito.toFixed(2)}%` },
            { label: "À vista", valor: `${dados.avista.toFixed(2)}%` },
            { label: "2x a 6x", valor: `${dados.mdr_2_6.toFixed(2)}%` },
            { label: "7x a 12x", valor: `${dados.mdr_7_12.toFixed(2)}%` }
        ];
    }

    const linhas = [];

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
                <h3>Cobranças selecionadas</h3>
                <div class="summary-pill-list">
                    ${cobrancas.map((item) => `<span class="summary-pill">${item}</span>`).join("")}
                </div>
            </div>
        `
        : "";

    return `<div class="result-list">${listaMarkup}</div>${cobrancasMarkup}`;
}

function atualizarIndicadorModo(antecipado) {
    const { modeHint, modeLabels, imageModeLabel } = obterElementos();

    modeLabels.forEach((label) => {
        const ativo = label.dataset.modeLabel === (antecipado ? "on" : "off");
        label.classList.toggle("is-active", ativo);
    });

    modeHint.textContent = antecipado
        ? "Visualizando taxas com antecipação aplicada."
        : "Visualizando taxas sem antecipação.";

    imageModeLabel.textContent = antecipado
        ? "Simulação com antecipação"
        : "Simulação sem antecipação";
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

        elementos.resultContent.innerHTML = markup;
        elementos.imageContent.innerHTML = markup;

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

    const elemento = document.querySelector("#imagem-container .image-card");

    if (!elemento) {
        alert("Nada para gerar imagem.");
        return;
    }

    html2canvas(elemento, {
        backgroundColor: "#ffffff",
        scale: 2
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = "taxas-pagprime.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}

function configurarAntecipacaoAvancada() {
    const { antecipacao, editarAntecipacao } = obterElementos();

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

function configurarToggleModo() {
    const { toggleAntecipacao, modeButtons } = obterElementos();

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
    gerarTabela();
}

document.addEventListener("DOMContentLoaded", iniciar);
