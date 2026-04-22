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

// =============================
// TABELA
// =============================

function gerarTabela(antecipado) {

    console.log("Gerando tabela. Antecipado:", antecipado);

    try {

        const taxaAntecipacao = parseNumero(document.getElementById("antecipacao").value);

        const pix = parseNumero(document.getElementById("pix").value);
        const debito = parseNumero(document.getElementById("debito").value);
        const avista = parseNumero(document.getElementById("avista").value);
        const mdr_2_6 = parseNumero(document.getElementById("mdr_2_6").value);
        const mdr_7_12 = parseNumero(document.getElementById("mdr_7_12").value);

        const resultado = document.getElementById("resultado");

        if (!resultado) {
            console.error("Elemento #resultado não encontrado");
            return;
        }

        resultado.innerHTML = "<h2>Resultado</h2>";

        if (!antecipado) {

            resultado.innerHTML += `
                <div class="result-item"><span>Pix</span><span>${pix.toFixed(2)}%</span></div>
                <div class="result-item"><span>Débito</span><span>${debito.toFixed(2)}%</span></div>
                <div class="result-item"><span>À vista</span><span>${avista.toFixed(2)}%</span></div>
                <div class="result-item"><span>2x–6x</span><span>${mdr_2_6.toFixed(2)}%</span></div>
                <div class="result-item"><span>7x–12x</span><span>${mdr_7_12.toFixed(2)}%</span></div>
            `;

        } else {

            for (let i = 1; i <= 12; i++) {

                let mdr;

                if (i === 1) mdr = avista;
                else if (i <= 6) mdr = mdr_2_6;
                else mdr = mdr_7_12;

                const taxa = calcularTaxaFinal(i, mdr, taxaAntecipacao);

                resultado.innerHTML += `
                    <div class="result-item">
                        <span>${i}x</span>
                        <span>${taxa.toFixed(2)}%</span>
                    </div>
                `;
            }
        }

        const aluguelToggle = document.getElementById("aluguelToggle");
        const manutencaoToggle = document.getElementById("manutencaoToggle");

        if (aluguelToggle && aluguelToggle.checked) {
            const aluguel = parseNumero(document.getElementById("aluguel").value);
            resultado.innerHTML += `<p>Aluguel: R$ ${aluguel.toFixed(2)}</p>`;
        }

        if (manutencaoToggle && manutencaoToggle.checked) {
            resultado.innerHTML += `<p>Manutenção: R$ 19,90</p>`;
        }

    } catch (erro) {
        console.error("Erro ao gerar tabela:", erro);
        alert("Erro ao calcular. Verifique os valores.");
    }
}

// =============================
// IMAGEM
// =============================

function gerarImagem() {

    const elemento = document.getElementById("resultado");

    if (!elemento) {
        alert("Nada para gerar imagem.");
        return;
    }

    html2canvas(elemento).then(canvas => {
        const link = document.createElement("a");
        link.download = "resultado.png";
        link.href = canvas.toDataURL();
        link.click();
    });
}