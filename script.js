// ==========================================================================
// DADOS DAS PROPOSTAS FICTÍCIAS
// ==========================================================================
const PROPOSTAS = {
  "1": { nome: "Laboratório Conectado", partido: "Tecnologia & Inovação" },
  "2": { nome: "Laboratório Organizado", partido: "Gestão & Praticidade" },
  "3": { nome: "Laboratório Seguro", partido: "Proteção & Qualidade" }
};

// ==========================================================================
// ESTADO DO SISTEMA & MÉTRICAS DE TI
// ==========================================================================
let numeroDigitado = "";
let votoEmBranco = false;
let votacaoBloqueada = false;
let eleitoralLiberado = false;

let tempoInicioVoto = 0;
let temposDeVoto = [];

const contagemVotos = { "1": 0, "2": 0, "3": 0, branco: 0, nulo: 0 };
let totalEleitores = 0;

// ==========================================================================
// SINTETIZADOR DE ÁUDIO (WEB AUDIO API - SEM ARQUIVOS EXTERNOS)
// ==========================================================================
function tocarSomTecla() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) { }
}

function tocarSomFim() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) { }
}

// ==========================================================================
// MAPEAMENTO DOS ELEMENTOS DO HTML
// ==========================================================================
const elInicio = document.getElementById("inicio");
const elBtnIniciar = document.getElementById("btn-iniciar");

const elMesario = document.getElementById("mesario");
const elDocEleitor = document.getElementById("doc-eleitor");
const elBtnAutorizar = document.getElementById("btn-autorizar");
const elMsgMesario = document.getElementById("msg-mesario");

const elUrna = document.getElementById("urna");
const elCargo = document.getElementById("cargo");
const elDigitos = document.querySelectorAll(".numero__digito");
const elNome = document.getElementById("nome-candidato");
const elPartido = document.getElementById("partido-candidato");
const elFotoPlaceholder = document.getElementById("foto-placeholder");
const elFotoLegenda = document.getElementById("foto-legenda");
const elMensagem = document.getElementById("mensagem");
const elComprovante = document.getElementById("comprovante-ticket");

const elStatus = document.getElementById("status");
const elContador = document.getElementById("contador");
const elBtnEncerrar = document.getElementById("btn-encerrar");

const elEncerrada = document.getElementById("encerrada");
const elBtnApuracao = document.getElementById("btn-apuracao");

const elApuracao = document.getElementById("apuracao");
const elApuracaoResultado = document.getElementById("apuracao-resultado");
const elBtnImprimir = document.getElementById("btn-imprimir");

// Ferramentas TI e Acessibilidade
const elBtnContraste = document.getElementById("btn-contraste");
const elBtnPainelTI = document.getElementById("btn-painel-ti");
const elModalTI = document.getElementById("modal-ti");
const elBtnFecharTI = document.getElementById("btn-fechar-ti");
const elTITempoMedio = document.getElementById("ti-tempo-medio");
const elTITotalVotos = document.getElementById("ti-total-votos");

// ==========================================================================
// EVENTOS E SUPORTE A TECLADO FÍSICO
// ==========================================================================

elBtnIniciar.addEventListener("click", () => {
  elInicio.hidden = true;
  elMesario.hidden = false;
});

elBtnAutorizar.addEventListener("click", autorizarEleitor);

document.querySelectorAll(".tecla").forEach((botao) => {
  botao.addEventListener("click", () => {
    tocarSomTecla();
    inserirNumero(botao.getAttribute("data-tecla"));
  });
});

document.querySelector('[data-acao="branco"]').addEventListener("click", () => { tocarSomTecla(); votarBranco(); });
document.querySelector('[data-acao="corrige"]').addEventListener("click", () => { tocarSomTecla(); corrige(); });
document.querySelector('[data-acao="confirma"]').addEventListener("click", confirma);

elBtnEncerrar.addEventListener("click", encerrarVotacao);
elBtnApuracao.addEventListener("click", exibirApuracao);
if (elBtnImprimir) elBtnImprimir.addEventListener("click", () => window.print());

// Suporte ao Teclado Físico
document.addEventListener("keydown", (e) => {
  if (elUrna.hidden || votacaoBloqueada) return;

  if (e.key >= "0" && e.key <= "9") {
    tocarSomTecla();
    inserirNumero(e.key);
  } else if (e.key === "Enter") {
    confirma();
  } else if (e.key === "Backspace") {
    tocarSomTecla();
    corrige();
  } else if (e.key === " ") {
    e.preventDefault();
    tocarSomTecla();
    votarBranco();
  } else if (e.key.toLowerCase() === "d") {
    abrirPainelTI();
  }
});

// Acessibilidade e Painel TI
elBtnContraste.addEventListener("click", () => document.body.classList.toggle("alto-contraste"));
elBtnPainelTI.addEventListener("click", abrirPainelTI);
elBtnFecharTI.addEventListener("click", () => elModalTI.hidden = true);

// ==========================================================================
// LÓGICA DE FUNCIONAMENTO
// ==========================================================================

function autorizarEleitor() {
  if (elDocEleitor.value.trim().length === 0) {
    elMsgMesario.textContent = "Digite um número fictício para liberar!";
    return;
  }
  elMsgMesario.textContent = "";
  elDocEleitor.value = "";
  elMesario.hidden = true;
  elUrna.hidden = false;
  elStatus.hidden = false;
  eleitoralLiberado = true;
  iniciarNovoVoto();
}

function iniciarNovoVoto() {
  numeroDigitado = "";
  votoEmBranco = false;
  votacaoBloqueada = false;
  tempoInicioVoto = Date.now();

  elCargo.textContent = "Proposta";
  elNome.textContent = "";
  elPartido.textContent = "";
  elFotoPlaceholder.textContent = "Foto";
  elFotoLegenda.textContent = "";
  elMensagem.textContent = "";
  elComprovante.hidden = true;

  atualizarDigitosTela();
}

function inserirNumero(digito) {
  if (votacaoBloqueada || votoEmBranco) return;
  if (numeroDigitado.length < 1) {
    numeroDigitado = digito;
    atualizarDigitosTela();
    atualizarDadosProposta();
  }
}

function atualizarDigitosTela() {
  elDigitos.forEach((span, i) => {
    span.textContent = i < numeroDigitado.length ? numeroDigitado[i] : "";
  });
}

function atualizarDadosProposta() {
  const proposta = PROPOSTAS[numeroDigitado];
  if (proposta) {
    elNome.textContent = proposta.nome;
    elPartido.textContent = proposta.partido;
    elFotoPlaceholder.textContent = `[${proposta.nome}]`;
    elFotoLegenda.textContent = "Proposta Selecionada";
  } else if (numeroDigitado.length === 1) {
    elNome.textContent = "NÚMERO ERRADO";
    elPartido.textContent = "Nenhum";
    elFotoPlaceholder.textContent = "—";
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
  elMensagem.textContent = "";
}

function corrige() {
  if (votacaoBloqueada) return;
  iniciarNovoVoto();
}

function confirma() {
  if (votacaoBloqueada || (!numeroDigitado && !votoEmBranco)) return;

  votacaoBloqueada = true;
  tocarSomFim();

  // Métrica de TI: cronometrar tempo
  const tempoGasto = ((Date.now() - tempoInicioVoto) / 1000).toFixed(1);
  temposDeVoto.push(parseFloat(tempoGasto));

  // Registrar voto
  if (votoEmBranco) contagemVotos.branco++;
  else if (PROPOSTAS[numeroDigitado]) contagemVotos[numeroDigitado]++;
  else contagemVotos.nulo++;

  totalEleitores++;
  elContador.textContent = `Eleitores registrados: ${totalEleitores}`;

  // Exibir comprovante digital simulado
  const hashComprovante = "HASH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  elComprovante.textContent = `Comprovante Digital: ${hashComprovante}`;
  elComprovante.hidden = false;

  elNome.textContent = "";
  elPartido.textContent = "";
  elFotoPlaceholder.textContent = "";
  elFotoLegenda.textContent = "";
  elDigitos.forEach(span => span.textContent = "");
  elMensagem.textContent = "FIM";

  setTimeout(() => {
    elUrna.hidden = true;
    elMesario.hidden = false;
  }, 2500);
}

function encerrarVotacao() {
  elUrna.hidden = true;
  elStatus.hidden = true;
  elMesario.hidden = true;
  elEncerrada.hidden = false;
}

function calcularPorcentagem(votos) {
  if (totalEleitores === 0) return "0.0";
  return ((votos / totalEleitores) * 100).toFixed(1);
}

function exibirApuracao() {
  elEncerrada.hidden = true;
  elApuracao.hidden = false;

  let htmlResultados = "";
  for (let key in PROPOSTAS) {
    const votos = contagemVotos[key];
    const pct = calcularPorcentagem(votos);
    htmlResultados += `
      <p><strong>${key} — ${PROPOSTAS[key].nome}:</strong> ${votos} voto(s) (${pct}%)</p>
      <div class="bar-container"><div class="bar-fill" style="width: ${pct}%;"></div></div>
    `;
  }

  const pctBranco = calcularPorcentagem(contagemVotos.branco);
  const pctNulo = calcularPorcentagem(contagemVotos.nulo);

  htmlResultados += `
    <p><strong>Votos em Branco:</strong> ${contagemVotos.branco} (${pctBranco}%)</p>
    <div class="bar-container"><div class="bar-fill bar-fill--outros" style="width: ${pctBranco}%;"></div></div>
    
    <p><strong>Votos Nulos:</strong> ${contagemVotos.nulo} (${pctNulo}%)</p>
    <div class="bar-container"><div class="bar-fill bar-fill--outros" style="width: ${pctNulo}%;"></div></div>
    
    <hr style="margin: 1rem 0;">
    <p style="font-size: 1.2rem;"><strong>Total Geral de Votos:</strong> ${totalEleitores}</p>
  `;

  elApuracaoResultado.innerHTML = htmlResultados;
}

function abrirPainelTI() {
  const somaTempos = temposDeVoto.reduce((a, b) => a + b, 0);
  const media = temposDeVoto.length ? (somaTempos / temposDeVoto.length).toFixed(1) : "0.0";
  elTITempoMedio.textContent = `${media}s`;
  elTITotalVotos.textContent = totalEleitores;
  elModalTI.hidden = false;
}
