const clientes = [
    { id: 1, nome: "Ana Souza" },
    { id: 2, nome: "Bruno Lima" },
    { id: 3, nome: "Carla Mendes" },
    { id: 4, nome: "Diego Costa" }
];

const filmes = [
    { id: 1, titulo: "Encontro Marcado", genero: "Romance", preco: 9.9, estoque: 3, capa: "capa-1" },
    { id: 2, titulo: "Uma Noite em Paris", genero: "Drama", preco: 12, estoque: 2, capa: "capa-2" },
    { id: 3, titulo: "Verão a Dois", genero: "Comédia", preco: 10, estoque: 2, capa: "capa-3" }
];

const chaveLocacoes = "locadora-locacoes";
const menuPrincipal = document.querySelector("#menuPrincipal");
const formLocacao = document.querySelector("#formLocacao");
const campoCliente = document.querySelector("#cliente");
const campoFilme = document.querySelector("#filme");
const campoDataInicio = document.querySelector("#dataInicio");
const campoDataFim = document.querySelector("#dataFim");
const campoPesquisa = document.querySelector("#pesquisa");
const filtroStatus = document.querySelector("#filtroStatus");
const filtroGenero = document.querySelector("#filtroGenero");
const ordenacao = document.querySelector("#ordenacao");
const listaLocacoes = document.querySelector("#listaLocacoes");
const mensagem = document.querySelector("#mensagem");

function carregarLocacoes() {
    try {
        const dadosSalvos = JSON.parse(localStorage.getItem(chaveLocacoes) || "[]");
        return Array.isArray(dadosSalvos) ? dadosSalvos : [];
    } catch (erro) {
        return [];
    }
}

let locacoes = carregarLocacoes();

function salvarLocacoes() {
    localStorage.setItem(chaveLocacoes, JSON.stringify(locacoes));
}

function dataHoje() {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function adicionarDias(data, quantidade) {
    const novaData = new Date(`${data}T12:00:00`);
    novaData.setDate(novaData.getDate() + quantidade);
    const ano = novaData.getFullYear();
    const mes = String(novaData.getMonth() + 1).padStart(2, "0");
    const dia = String(novaData.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
    if (!data) return "-";
    return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

function buscarCliente(id) {
    return clientes.find((cliente) => cliente.id === Number(id));
}

function buscarFilme(id) {
    return filmes.find((filme) => filme.id === Number(id));
}

function obterSituacao(locacao) {
    if (locacao.devolvidoEm) return "Devolvido";
    if (locacao.dataFim < dataHoje()) return "Atrasado";
    return "Alugado";
}

function contarLocacoesAtivas(filmeId, ignorarId = null) {
    return locacoes.filter((locacao) =>
        locacao.filmeId === filmeId &&
        !locacao.devolvidoEm &&
        locacao.id !== ignorarId
    ).length;
}

function preencherOpcoes() {
    clientes.forEach((cliente) => {
        campoCliente.insertAdjacentHTML("beforeend", `<option value="${cliente.id}">${cliente.nome}</option>`);
    });

    filmes.forEach((filme) => {
        campoFilme.insertAdjacentHTML("beforeend", `<option value="${filme.id}">${filme.titulo} - R$ ${filme.preco.toFixed(2).replace(".", ",")}</option>`);
        filtroGenero.insertAdjacentHTML("beforeend", `<option value="${filme.genero}">${filme.genero}</option>`);
    });
}

function mostrarMensagem(texto, tipo = "success") {
    mensagem.textContent = texto;
    mensagem.className = `alert alert-${tipo}`;

    window.setTimeout(() => mensagem.classList.add("d-none"), 4000);
}

function renderizarLocacoes() {
    const texto = campoPesquisa.value.trim().toLocaleLowerCase("pt-BR");
    const situacaoEscolhida = filtroStatus.value;
    const generoEscolhido = filtroGenero.value;

    let resultado = locacoes.filter((locacao) => {
        const cliente = buscarCliente(locacao.clienteId);
        const filme = buscarFilme(locacao.filmeId);
        const combinaPesquisa = `${cliente?.nome || ""} ${filme?.titulo || ""}`
            .toLocaleLowerCase("pt-BR")
            .includes(texto);
        const combinaSituacao = situacaoEscolhida === "todos" || obterSituacao(locacao) === situacaoEscolhida;
        const combinaGenero = generoEscolhido === "todos" || filme?.genero === generoEscolhido;
        return combinaPesquisa && combinaSituacao && combinaGenero;
    });

    resultado.sort((a, b) => {
        if (ordenacao.value === "cliente") {
            return (buscarCliente(a.clienteId)?.nome || "").localeCompare(buscarCliente(b.clienteId)?.nome || "");
        }
        if (ordenacao.value === "filme") {
            return (buscarFilme(a.filmeId)?.titulo || "").localeCompare(buscarFilme(b.filmeId)?.titulo || "");
        }
        if (ordenacao.value === "vencimento") {
            return a.dataFim.localeCompare(b.dataFim);
        }
        return b.criadaEm - a.criadaEm;
    });

    if (resultado.length === 0) {
        listaLocacoes.innerHTML = '<tr><td class="texto-suave text-center py-4" colspan="6">Nenhuma locação encontrada.</td></tr>';
    } else {
        listaLocacoes.innerHTML = resultado.map((locacao) => {
            const cliente = buscarCliente(locacao.clienteId);
            const filme = buscarFilme(locacao.filmeId);
            const situacao = obterSituacao(locacao);
            const classeSituacao = situacao === "Alugado" ? "text-bg-success" :
                situacao === "Atrasado" ? "text-bg-warning" : "text-bg-secondary";
            const botaoDevolver = locacao.devolvidoEm ? "" :
                `<button class="btn btn-sm btn-outline-success me-1" type="button" data-acao="devolver" data-id="${locacao.id}">Devolver</button>`;

            return `
                <tr>
                    <td>${cliente?.nome || "Cliente removido"}</td>
                    <td>${filme?.titulo || "Filme removido"}<br><small class="texto-suave">${filme?.genero || ""}</small></td>
                    <td>${formatarData(locacao.dataInicio)}</td>
                    <td>${formatarData(locacao.dataFim)}</td>
                    <td><span class="badge ${classeSituacao}">${situacao}</span></td>
                    <td class="text-end text-nowrap">
                        ${botaoDevolver}
                        <button class="btn btn-sm btn-outline-primary me-1" type="button" data-acao="editar" data-id="${locacao.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-danger" type="button" data-acao="excluir" data-id="${locacao.id}">Excluir</button>
                    </td>
                </tr>`;
        }).join("");
    }

    document.querySelector("#totalLocacoes").textContent = locacoes.length;
    document.querySelector("#locacoesAtivas").textContent = locacoes.filter((locacao) => !locacao.devolvidoEm).length;
    renderizarFilmes();
}

function renderizarFilmes() {
    const filmesDisponiveis = filmes.filter((filme) => contarLocacoesAtivas(filme.id) < filme.estoque).length;
    document.querySelector("#filmesDisponiveis").textContent = filmesDisponiveis;

    document.querySelector("#listaFilmes").innerHTML = filmes.map((filme) => {
        const disponiveis = filme.estoque - contarLocacoesAtivas(filme.id);
        return `
            <div class="col-md-6 col-lg-4">
                <article class="card filme h-100">
                    <div class="capa ${filme.capa}" aria-hidden="true"></div>
                    <div class="card-body">
                        <span class="badge text-bg-dark">${filme.genero} · 18+</span>
                        <h3 class="h5 mt-3">${filme.titulo}</h3>
                        <p class="texto-suave">R$ ${filme.preco.toFixed(2).replace(".", ",")}</p>
                        <span class="badge ${disponiveis > 0 ? "text-bg-success" : "text-bg-secondary"}">
                            ${disponiveis} de ${filme.estoque} disponíveis
                        </span>
                    </div>
                </article>
            </div>`;
    }).join("");
}

function limparFormulario() {
    formLocacao.reset();
    formLocacao.classList.remove("was-validated");
    document.querySelector("#locacaoId").value = "";
    document.querySelector("#tituloFormulario").textContent = "Nova locação";
    document.querySelector("#botaoSalvar").textContent = "Salvar locação";
    document.querySelector("#cancelarEdicao").classList.add("d-none");
    campoDataInicio.value = dataHoje();
    campoDataFim.value = adicionarDias(dataHoje(), 7);
}

function validarFormulario() {
    campoDataInicio.setCustomValidity("");
    campoDataFim.setCustomValidity("");

    if (campoDataInicio.value > dataHoje()) {
        campoDataInicio.setCustomValidity("A data da locação não pode ser futura.");
    }
    if (campoDataFim.value < campoDataInicio.value) {
        campoDataFim.setCustomValidity("A data de devolução não pode ser anterior à locação.");
    }

    formLocacao.classList.add("was-validated");
    return formLocacao.checkValidity();
}

formLocacao.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario()) {
        formLocacao.reportValidity();
        return;
    }

    const idAtual = Number(document.querySelector("#locacaoId").value) || null;
    const clienteId = Number(campoCliente.value);
    const filmeId = Number(campoFilme.value);
    const locacaoAtual = locacoes.find((locacao) => locacao.id === idAtual);
    const temLocacaoIgual = locacoes.some((locacao) =>
        locacao.id !== idAtual &&
        locacao.clienteId === clienteId &&
        locacao.filmeId === filmeId &&
        !locacao.devolvidoEm
    );

    if (temLocacaoIgual) {
        mostrarMensagem("Este cliente já tem esse filme e ainda não devolveu.", "warning");
        return;
    }

    const filme = buscarFilme(filmeId);
    if (contarLocacoesAtivas(filmeId, idAtual) >= filme.estoque && !locacaoAtual?.devolvidoEm) {
        mostrarMensagem("Não há cópias disponíveis desse filme.", "warning");
        return;
    }

    const dadosLocacao = {
        id: idAtual || Date.now(),
        clienteId,
        filmeId,
        dataInicio: campoDataInicio.value,
        dataFim: campoDataFim.value,
        criadaEm: locacaoAtual?.criadaEm || Date.now(),
        devolvidoEm: locacaoAtual?.devolvidoEm || null
    };

    if (idAtual) {
        locacoes = locacoes.map((locacao) => locacao.id === idAtual ? dadosLocacao : locacao);
        mostrarMensagem("Locação atualizada com sucesso.");
    } else {
        locacoes.push(dadosLocacao);
        mostrarMensagem("Locação cadastrada com sucesso.");
    }

    salvarLocacoes();
    limparFormulario();
    renderizarLocacoes();
});

listaLocacoes.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;

    const id = Number(botao.dataset.id);
    const locacao = locacoes.find((item) => item.id === id);
    if (!locacao) return;

    if (botao.dataset.acao === "editar") {
        document.querySelector("#locacaoId").value = locacao.id;
        campoCliente.value = locacao.clienteId;
        campoFilme.value = locacao.filmeId;
        campoDataInicio.value = locacao.dataInicio;
        campoDataFim.value = locacao.dataFim;
        document.querySelector("#tituloFormulario").textContent = "Editar locação";
        document.querySelector("#botaoSalvar").textContent = "Salvar alterações";
        document.querySelector("#cancelarEdicao").classList.remove("d-none");
        document.querySelector("#locacoes").scrollIntoView({ behavior: "smooth" });
    }

    if (botao.dataset.acao === "devolver") {
        locacoes = locacoes.map((item) => item.id === id ? { ...item, devolvidoEm: dataHoje() } : item);
        salvarLocacoes();
        renderizarLocacoes();
        mostrarMensagem("Filme marcado como devolvido.");
    }

    if (botao.dataset.acao === "excluir" && window.confirm("Deseja excluir esta locação?")) {
        locacoes = locacoes.filter((item) => item.id !== id);
        salvarLocacoes();
        renderizarLocacoes();
        mostrarMensagem("Locação excluída.");
    }
});

document.querySelector("#cancelarEdicao").addEventListener("click", limparFormulario);
[campoPesquisa, filtroStatus, filtroGenero, ordenacao].forEach((campo) => {
    campo.addEventListener("input", renderizarLocacoes);
    campo.addEventListener("change", renderizarLocacoes);
});

menuPrincipal.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
        if (menuPrincipal.classList.contains("show")) {
            bootstrap.Collapse.getOrCreateInstance(menuPrincipal).hide();
        }
    });
});

preencherOpcoes();
limparFormulario();
renderizarLocacoes();