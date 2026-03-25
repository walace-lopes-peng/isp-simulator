# 🗺️ PROJECT_BLUEPRINT: ISP Tycoon (The Living Doc - v1.3)

## 1. Visão Geral (The North Star)
O jogo é um simulador de infraestrutura histórica. O jogador começa em uma garagem (anos 70) e deve evoluir tecnologicamente até gerenciar o backbone da internet global (Moderno). O foco não é 'clicar', mas gerenciar Topologia vs. Demanda.

## 2. O Motor de Fluxo (Core Loop)
Substituir a receita estática por Entrega de Pacotes (Packet-Flow):
- **Nós de Usuário**: Geram 'Requests'.
- **Nós de Serviço**: São o destino (Mainframes/Data Centers).
- **Receita**: Gerada apenas quando um pacote completa a viagem de ida e volta.
- **Perda**: Links sobrecarregados (Capacidade < Tráfego) causam Packet Loss, destruindo a receita.

## 3. Progressão de Eras (Historical Evolution)

### 📟 Era 1: A Vanguarda (Anos 70)
- **Escala**: Local (Grid de Bairro/Universidade). Mapa-múndi bloqueado.
- **UI**: Terminal CRT, fósforo verde, comandos via console.
- **Hardware**: Modems acústicos e cabos de cobre (300bps).
- **Desafio**: Falhas físicas de hardware e curto alcance.

### 💾 Era 2: A Corrida do Ouro (Anos 90)
- **Escala**: Regional (Cidade/País). Zoom Semântico desbloqueado.
- **UI**: Estilo Windows 95, cinza chanfrado, fontes pixeladas.
- **Hardware**: Modems 56k, primeiros backbones de fibra.
- **Desafio**: Explosão de demanda residencial e congestionamento massivo.

### 🌐 Era 3: O Titã (Moderno)
- **Escala**: Global (Cabos submarinos e Satélites).
- **UI**: Dark Mode, minimalista, transparências (estilo SaaS).
- **Hardware**: Fibra óptica de Terabit, Starlink.
- **Desafio**: Ataques DDoS, latência transcontinental e manutenção de custos globais.

## 4. O Motor de Cenários (Modular Engine)
O sistema deve suportar 'Cenários' que sobrescrevem o Blueprint original:
- **Guerra Fria**: EUA vs URSS. Mudança de idioma (Cirílico), UI militar e mecânicas de sabotagem/espionagem.
- **Marte 2050**: Colonização espacial com latência de 20 minutos por pacote.

## 5. Regras Técnicas de Desenvolvimento (Guardrails)
- **Zustand First**: Toda lógica de economia e tráfego deve estar no `useISPStore.ts`.
- **Reactive UI**: O `LinkRenderer` deve calcular coordenadas em tempo real para evitar que linhas 'voem' ao dar zoom.
- **Semantic Zoom**: Elementos visuais mudam de detalhe conforme o zoom do mapa (Ícone de torre vira um ponto no nível global).
- **No Static Magic**: Proibido usar números 'mágicos'. Todas as constantes (velocidade, custo, alcance) devem vir do `ERA_CONFIGS`.
