// ==========================================================================
// DADOS DAS PROPOSTAS FICTÍCIAS
// ==========================================================================
const PROPOSTAS = {
  "1": {
    nome: "Laboratório Conectado",
    partido: "Tecnologia & Inovação"
  },
  "2": {
    nome: "Laboratório Organizado",
    partido: "Gestão & Praticidade"
  },
  "3": {
    nome: "Laboratório Seguro",
    partido: "Proteção & Qualidade"
  }
};

// ==========================================================================
// ESTADO DO SISTEMA (VARIÁVEIS DE MEMÓRIA)
// ==========================================================================
let numeroDigitado = "";
let votoEmBranco = false;
let votacaoBloqueada = false; // Impede cliques duplicados no CONFIRMA

// Placar zerado da apuração
const contagemVotos = {
  "1": 0,
  "2": 0,
  "3": 0,
  branco: 0,
  nulo: 0
};

let totalEleitores = 0;

// ==========================================================================
// MAPEAMENTO DOS ELEMENTOS DO HTML
// ==========================================================================
const elInicio = document.getElementById("inicio");
const elBtnIniciar = document.getElementById("btn-iniciar");

const elUrna = document.getElementById("urna");
const elCargo = document.getElementById("cargo");
const elDigitos = document.querySelectorAll(".numero__digito");
const elNome = document.getElementById("nome-candidato");
const elPartido = document.getElementById("partido-candidato");
const elFotoPlaceholder = document.getElementById("foto-placeholder");
const elFotoLegenda = document.getElementById("foto-legenda");
const elMensagem = document.getElementById("mensagem");

const elStatus = document.getElementById("status");
const elContador = document.getElementById("contador");
const elBtnEncerrar = document.getElementById("btn-encerrar");

const elEncerrada = document.getElementById("encerrada");
const elBtnApuracao = document.getElementById("btn-apuracao");

const elApuracao = document.getElementById("apuracao");
const elApuracaoResultado = document.getElementById("apuracao-resultado");

// ==========================================================================
// EVENTOS E BOTÕES
// ==========================================================================

// Iniciar a sessão de votação
elBtnIniciar.addEventListener("click", () => {
  elInicio.hidden = true;
  elUrna.hidden = false;
  elStatus.hidden = false;
  iniciarNovoVoto();
});

// Configurar teclas numéricas (0 a 9)
document.querySelectorAll(".tecla").forEach((botao) => {
  botao.addEventListener("click", () => {
    const digito = botao.getAttribute("data-tecla");
    inserirNumero(digito);
  });
});

// Configurar botões de ação (BRANCO, CORRIGE, CONFIRMA)
document.querySelector('[data-acao="branco"]').addEventListener("click", votarBranco);
document.querySelector('[data-acao="corrige"]').addEventListener("click", corrige);
document.querySelector('[data-acao="confirma"]').addEventListener("click", confirma);

// Encerrar e Ver Apuração
elBtnEncerrar.addEventListener("click", encerrarVotacao);
elBtnApuracao.addEventListener("click", exibirApuracao);

// ==========================================================================
// FUNÇÕES DE LÓGICA DA URNA
// ==========================================================================

function iniciarNovoVoto() {
  numeroDigitado = "";
  votoEmBranco = false;
  votacaoBloqueada = false;
  
  elCargo.textContent = "Proposta";
  elNome.textContent = "";
  elPartido.textContent = "";
  elFotoPlaceholder.textContent = "Foto";
  elFotoLegenda.textContent = "";
  elMensagem.textContent = "";

  atualizarDigitosTela();
}

function inserirNumero(digito) {
  // Se a votação já foi confirmada (tela FIM) ou está em branco, não aceita números
  if (votacaoBloqueada || votoEmBranco) return;

  // Apenas 1 dígito para as propostas fictícias (1, 2 ou 3, ou outro para nulo)
  if (numeroDigitado.length < 1) {
    numeroDigitado = digito;
    atualizarDigitosTela();
    atualizarDadosProposta();
  }
}

function atualizarDigitosTela() {
  elDigitos.forEach((span, indice) => {
    if (indice < numeroDigitado.length) {
      span.textContent = numeroDigitado[indice];
    } else {
      span.textContent = "";
    }
  });
}

function atualizarDadosProposta() {
  const proposta = PROPOSTAS[numeroDigitado];

  if (proposta) {
    elNome.textContent = proposta.nome;
    elPartido.textContent = proposta.partido;
    elFotoPlaceholder.textContent = `[${proposta.nome}]`;
    elFotoLegenda.textContent = "Proposta Selecionada";
    elMensagem.textContent = "";
  } else if (numeroDigitado.length === 1) {
    // Número não cadastrado (ex: 9)
    elNome.textContent = "NÚMERO ERRADO";
    elPartido.textContent = "Nenhum";
    elFotoPlaceholder.textContent = "—";
    elFotoLegenda.textContent = "";
    elMensagem.textContent = "VOTO NULO";
  }
}

function votarBranco() {
  if (votacaoBloqueada) return;

  numeroDigitado = "";
  votoEmBranco = true;
  atualizarDigitosTela();

  elNome.textContent = "VOTO EM BRANCO";
  elPartido.textContent = "—";
  elFotoPlaceholder.textContent = "BRANCO";
  elFotoLegenda.textContent = "";
  elMensagem.textContent = "";
}

function corrige() {
  if (votacaoBloqueada) return;
  iniciarNovoVoto();
}

function confirma() {
  // Trava para evitar múltiplos registros por múltiplos cliques seguidos
  if (votacaoBloqueada) return;

  // Só permite confirmar se digitou um número ou se votou em branco
  if (numeroDigitado.length === 0 && !votoEmBranco) {
    return; // Não faz nada se a tela estiver vazia
  }

  votacaoBloqueada = true;

  // Registrar o voto
  if (votoEmBranco) {
    contagemVotos.branco++;
  } else if (PROPOSTAS[numeroDigitado]) {
    contagemVotos[numeroDigitado]++;
  } else {
    contagemVotos.nulo++;
  }

  totalEleitores++;
  elContador.textContent = `Eleitores registrados: ${totalEleitores}`;

  // Mostrar mensagem de FIM
  elNome.textContent = "";
  elPartido.textContent = "";
  elFotoPlaceholder.textContent = "";
  elFotoLegenda.textContent = "";
  elDigitos.forEach((span) => (span.textContent = ""));
  elMensagem.textContent = "FIM";

  // Libera automaticamente para o próximo voto após 2 segundos
  setTimeout(() => {
    iniciarNovoVoto();
  }, 2000);
}

function encerrarVotacao() {
  elUrna.hidden = true;
  elStatus.hidden = true;
  elEncerrada.hidden = false;
}

function exibirApuracao() {
  elEncerrada.hidden = true;
  elApuracao.hidden = false;

  elApuracaoResultado.innerHTML = `
    <p><strong>1 — Laboratório Conectado:</strong> ${contagemVotos["1"]} voto(s)</p>
    <p><strong>2 — Laboratório Organizado:</strong> ${contagemVotos["2"]} voto(s)</p>
    <p><strong>3 — Laboratório Seguro:</strong> ${contagemVotos["3"]} voto(s)</p>
    <p><strong>Votos em Branco:</strong> ${contagemVotos.branco}</p>
    <p><strong>Votos Nulos:</strong> ${contagemVotos.nulo}</p>
    <hr style="margin: 1rem 0; border: 0; border-top: 1px solid #cbd5e1;">
    <p style="font-size: 1.2rem;"><strong>Total Geral de Votos:</strong> ${totalEleitores}</p>
  `;
}
