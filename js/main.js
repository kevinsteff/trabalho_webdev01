const clientes = [
    { id: 1, nome: "Ana Souza" },
    { id: 2, nome: "Bruno Lima" },
    { id: 3, nome: "Carla Mendes" },
    { id: 4, nome: "Diego Costa" }
];

const filmesIniciais = [
    { id: 1, titulo: "Encontro Marcado", genero: "Romance", preco: 9.9, estoque: 3 },
    { id: 2, titulo: "Uma Noite em Paris", genero: "Drama", preco: 12, estoque: 2 },
    { id: 3, titulo: "Verão a Dois", genero: "Comédia", preco: 10, estoque: 2 }
];

const chaveLocacoes = "locadora-locacoes";
const chaveFilmes = "locadora-filmes";
const menuPrincipal = document.querySelector("#menuPrincipal");
const formLocacao = document.querySelector("#formLocacao");
const formFilme = document.querySelector("#formFilme");
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
const mensagemFilmes = document.querySelector("#mensagemFilmes");

function carregarFilmes() {
    try {
        const dadosSalvos = localStorage.getItem(chaveFilmes);
        if (dadosSalvos === null) return filmesIniciais;
        const filmesSalvos = JSON.parse(dadosSalvos);
        return Array.isArray(filmesSalvos) ? filmesSalvos : filmesIniciais;
    } catch (erro) {
        return filmesIniciais;
    }
}

let filmes = carregarFilmes();

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

function salvarFilmes() {
    localStorage.setItem(chaveFilmes, JSON.stringify(filmes));
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

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, (caractere) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
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

function calcularMulta(locacao) {
    const dataReferencia = locacao.devolvidoEm || dataHoje();
    const dataFim = new Date(`${locacao.dataFim}T00:00:00Z`).getTime();
    const dataAtual = new Date(`${dataReferencia}T00:00:00Z`).getTime();
    const diasAtrasados = Math.max(0, Math.floor((dataAtual - dataFim) / 86400000));
    return diasAtrasados * 2;
}

function contarLocacoesAtivas(filmeId, ignorarId = null) {
    return locacoes.filter((locacao) =>
        locacao.filmeId === filmeId &&
        !locacao.devolvidoEm &&
        locacao.id !== ignorarId
    ).length;
}

function renovarLocacao(id) {
    const locacao = locacoes.find((item) => item.id === id);
    if (!locacao || locacao.devolvidoEm || locacao.renovada || obterSituacao(locacao) !== "Alugado") {
        return false;
    }

    locacoes = locacoes.map((item) => item.id === id
        ? { ...item, dataFim: adicionarDias(item.dataFim, 7), renovada: true }
        : item
    );
    salvarLocacoes();
    return true;
}

function preencherOpcoes() {
    campoCliente.innerHTML = '<option value="">Escolha um cliente</option>';
    clientes.forEach((cliente) => {
        campoCliente.insertAdjacentHTML("beforeend", `<option value="${cliente.id}">${escaparHTML(cliente.nome)}</option>`);
    });

    campoFilme.innerHTML = '<option value="">Escolha um filme</option>';
    filmes.forEach((filme) => {
        campoFilme.insertAdjacentHTML("beforeend", `<option value="${filme.id}">${escaparHTML(filme.titulo)} - ${Number(filme.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</option>`);
    });

    const generos = [...new Set(filmes.map((filme) => filme.genero))].sort();
    filtroGenero.innerHTML = '<option value="todos">Todos os gêneros</option>';
    generos.forEach((genero) => {
        filtroGenero.insertAdjacentHTML("beforeend", `<option value="${escaparHTML(genero)}">${escaparHTML(genero)}</option>`);
    });
}

function mostrarMensagem(texto, tipo = "success", destino = mensagem) {
    destino.textContent = texto;
    destino.className = `alert alert-${tipo}`;

    window.setTimeout(() => destino.classList.add("d-none"), 4000);
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
        listaLocacoes.innerHTML = '<tr><td class="texto-suave text-center py-4" colspan="7">Nenhuma locação encontrada.</td></tr>';
    } else {
        listaLocacoes.innerHTML = resultado.map((locacao) => {
            const cliente = buscarCliente(locacao.clienteId);
            const filme = buscarFilme(locacao.filmeId);
            const situacao = obterSituacao(locacao);
            const multa = calcularMulta(locacao);
            const classeSituacao = situacao === "Alugado" ? "text-bg-success" :
                situacao === "Atrasado" ? "text-bg-warning" : "text-bg-secondary";
            const botaoDevolver = locacao.devolvidoEm ? "" :
                `<button class="btn btn-sm btn-outline-success me-1" type="button" data-acao="devolver" data-id="${locacao.id}">Devolver</button>`;
            const botaoRenovar = situacao === "Alugado" && !locacao.renovada ?
                `<button class="btn btn-sm btn-outline-warning me-1" type="button" data-acao="renovar" data-id="${locacao.id}" title="Prorrogar o prazo em sete dias">Renovar (+7 dias)</button>` : "";

            return `
                <tr>
                    <td>${escaparHTML(cliente?.nome || "Cliente removido")}</td>
                    <td>${escaparHTML(filme?.titulo || "Filme removido")}<br><small class="texto-suave">${escaparHTML(filme?.genero || "")}</small></td>
                    <td>${formatarData(locacao.dataInicio)}</td>
                    <td>${formatarData(locacao.dataFim)}</td>
                    <td><span class="badge ${classeSituacao}">${situacao}</span></td>
                    <td>${multa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td class="text-end text-nowrap">
                        ${botaoRenovar}
                        ${botaoDevolver}
                        <button class="btn btn-sm btn-outline-primary me-1" type="button" data-acao="editar" data-id="${locacao.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-danger" type="button" data-acao="excluir" data-id="${locacao.id}">Excluir</button>
                    </td>
                </tr>`;
        }).join("");
    }

    document.querySelector("#totalLocacoes").textContent = locacoes.length;
    document.querySelector("#locacoesAtivas").textContent = locacoes.filter((locacao) => !locacao.devolvidoEm).length;
    document.querySelector("#locacoesAtrasadas").textContent = locacoes.filter((locacao) => obterSituacao(locacao) === "Atrasado").length;
    renderizarFilmes();
}

function renderizarFilmes() {
    document.querySelector("#totalFilmes").textContent = filmes.length;

    document.querySelector("#listaFilmes").innerHTML = filmes.length === 0
        ? '<tr><td class="texto-suave text-center py-4" colspan="6">Nenhum filme cadastrado.</td></tr>'
        : filmes.map((filme) => {
        const disponiveis = filme.estoque - contarLocacoesAtivas(filme.id);
        return `
            <tr>
                <td>${escaparHTML(filme.titulo)}</td>
                <td>${escaparHTML(filme.genero)}</td>
                <td>${Number(filme.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td>${filme.estoque}</td>
                <td>${disponiveis}</td>
                <td class="text-end text-nowrap">
                    <button class="btn btn-sm btn-outline-primary me-1" type="button" data-acao-filme="editar" data-id="${filme.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" type="button" data-acao-filme="excluir" data-id="${filme.id}">Excluir</button>
                </td>
            </tr>`;
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

function limparFormularioFilme() {
    formFilme.reset();
    formFilme.classList.remove("was-validated");
    document.querySelector("#filmeId").value = "";
    document.querySelector("#tituloFormularioFilme").textContent = "Novo filme";
    document.querySelector("#botaoSalvarFilme").textContent = "Salvar";
    document.querySelector("#cancelarEdicaoFilme").classList.add("d-none");
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
        devolvidoEm: locacaoAtual?.devolvidoEm || null,
        renovada: locacaoAtual?.renovada || false
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

formFilme.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const idAtual = Number(document.querySelector("#filmeId").value) || null;
    const titulo = document.querySelector("#tituloFilme").value.trim();
    const genero = document.querySelector("#generoFilme").value.trim();
    const preco = Number(document.querySelector("#precoFilme").value);
    const estoque = Number(document.querySelector("#estoqueFilme").value);
    const tituloInput = document.querySelector("#tituloFilme");

    tituloInput.setCustomValidity("");
    if (filmes.some((filme) => filme.id !== idAtual && filme.titulo.toLocaleLowerCase("pt-BR") === titulo.toLocaleLowerCase("pt-BR"))) {
        tituloInput.setCustomValidity("Já existe um filme com esse título.");
    }
    formFilme.classList.add("was-validated");
    if (!formFilme.checkValidity()) {
        formFilme.reportValidity();
        return;
    }

    if (idAtual && estoque < contarLocacoesAtivas(idAtual)) {
        mostrarMensagem("O estoque não pode ser menor que as locações em andamento.", "warning", mensagemFilmes);
        return;
    }

    const dadosFilme = {
        id: idAtual || Math.max(0, ...filmes.map((filme) => filme.id)) + 1,
        titulo,
        genero,
        preco,
        estoque
    };

    if (idAtual) {
        filmes = filmes.map((filme) => filme.id === idAtual ? dadosFilme : filme);
        mostrarMensagem("Filme atualizado com sucesso.", "success", mensagemFilmes);
    } else {
        filmes.push(dadosFilme);
        mostrarMensagem("Filme cadastrado com sucesso.", "success", mensagemFilmes);
    }

    salvarFilmes();
    preencherOpcoes();
    limparFormularioFilme();
    renderizarLocacoes();
});

document.querySelector("#cancelarEdicaoFilme").addEventListener("click", limparFormularioFilme);

document.querySelector("#listaFilmes").addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-acao-filme]");
    if (!botao) return;

    const id = Number(botao.dataset.id);
    const filme = buscarFilme(id);
    if (!filme) return;

    if (botao.dataset.acaoFilme === "editar") {
        document.querySelector("#filmeId").value = filme.id;
        document.querySelector("#tituloFilme").value = filme.titulo;
        document.querySelector("#generoFilme").value = filme.genero;
        document.querySelector("#precoFilme").value = filme.preco;
        document.querySelector("#estoqueFilme").value = filme.estoque;
        document.querySelector("#tituloFormularioFilme").textContent = "Editar filme";
        document.querySelector("#botaoSalvarFilme").textContent = "Salvar alterações";
        document.querySelector("#cancelarEdicaoFilme").classList.remove("d-none");
        document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
    }

    if (botao.dataset.acaoFilme === "excluir") {
        if (locacoes.some((locacao) => locacao.filmeId === id)) {
            mostrarMensagem("Não é possível excluir um filme que tem locações registradas.", "warning", mensagemFilmes);
            return;
        }
        if (window.confirm("Deseja excluir este filme?")) {
            filmes = filmes.filter((item) => item.id !== id);
            salvarFilmes();
            preencherOpcoes();
            renderizarLocacoes();
            mostrarMensagem("Filme excluído.", "success", mensagemFilmes);
        }
    }
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

    if (botao.dataset.acao === "renovar") {
        if (renovarLocacao(id)) {
            renderizarLocacoes();
            mostrarMensagem("Prazo renovado por mais 7 dias.");
        } else {
            mostrarMensagem("Esta locação não pode ser renovada.", "warning");
        }
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