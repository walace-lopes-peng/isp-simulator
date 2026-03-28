$issues = @(
    @{
        title = "[FEAT] Licensing System & Tier Constraint Visuals"
        body = "### Descrição`nComplemento ao sistema de Topologia Hierárquica já introduzido, adicionando o bloqueio financeiro/regulatório e a diferenciação visual por camadas.`n`n### Requisitos Técnicos`n* **Custo de Licenciamento**: Adicionar variável `OperationLicenses` por Tier no store. O jogador compra direitos de operar um novo 'Nível de Hub'.`n* **Renderização**: Linhas SVG de links devem ter a propriedade `stroke-width` e/ou opacidade proporcional ao Tier."
    },
    @{
        title = "[FEAT/LOGIC] Signal Attenuation & Physical Layer Physics"
        body = "### Descrição`nImplementar a física de degradação de sinal para cabos de cobre, forçando o uso de repetidores e estratégia de posicionamento nas Eras 1 e 2.`n`n### Requisitos Técnicos`n* **Fórmula base**: `Signal_Strength = 100 - (Distance * Noise_Multiplier)`. Penalidade de perda de pacote se `Signal_Strength < 30`.`n* **Hardware - Repeater**: Sub-tipo de nó que não gera tráfego inicial, mas reseta o sinal e aumenta o **OPEX**.`n* **UI Feedback**: Transição de cor do link no arraste de build: Verde (>70%), Amarelo (30-70%), Vermelho (<30%)."
    },
    @{
        title = "[LOGIC] Packet-Flow Simulation Engine & Real Revenue Loop"
        body = "### Descrição`nSubstituir a geração de renda abstrata por um verdadeiro sistema de fluxo de pacotes ponta a ponta (Terminal -> Core -> Terminal) para simular carga real, rotas e gargalos.`n`n### Requisitos Técnicos`n* **Ciclo de Request**: Nós Terminais geram pacotes com destino aos Gateways/Core.`n* **Geração de Receita**: Adicionar dinheiro ao Store *apenas* quando o Pacote de Confirmação (ACK) retornar ao Terminal.`n* **Congestionamento Dinâmico**: Se a soma dos pacotes exceder a `Bandwidth`, causar descarte (Packet Loss) destruindo aquela fração da receita.`n* **Critérios de Aceite**: A interface deve exibir 'Revenue per Second' mitigado por packet loss listados nos Logs."
    },
    @{
        title = "[ARCH] Integrated Tech Tree & R&D Logic"
        body = "### Descrição`nImplementar o `TechTreeStore` para pesquisa e desbloqueio de novas tecnologias. Este será o motor de progressão tecnológica.`n`n### Requisitos Técnicos`n* **Recurso Global**: Adicionar `ResearchPoints` (RP).`n* **Geração**: Universidades e Hubs Acadêmicos geram passivamente RP na rede.`n* **Árvore de Dependências**: Um grafo de pesquisas (ex: 'Digital Switching' requer 'Solid State Logic').`n* **Vanguard Penalty**: Pesquisas 'futuristas' em relação à Era atual custam exponenencialmente mais RP."
    },
    @{
        title = "[FEAT] Market Dynamics & Reputation System (QoS)"
        body = "### Descrição`nAmarrar o sucesso do jogador (Uptime/Quality of Service) à capacidade de expansão e conversão de novos clientes no mapa.`n`n### Requisitos Técnicos`n* **Reputation State**: Variável atrelada à média de Uptime e sucesso de pacotes.`n* **SLA/Multas**: Clientes corporativos gerarão multas/tickets se ocorrer downtime grave.`n* **Organic Growth**: Novos nós residenciais aparecem sozinhos apenas se o jogador tiver alta Reputação em um Hub próximo.`n* **Marketing**: Investimento de Capital para gerar demanda artificial e atrair clientes."
    },
    @{
        title = "[FEAT] Maintenance & Emergency Response (OPEX Manager)"
        body = "### Descrição`nImplementar uma gestão operacional punitiva. Manutenções tornam-se eventos físicos e logísticos.`n`n### Requisitos Técnicos`n* **Wear and Tear**: Deterioração de nós submetidos a altas cargas de tráfego.`n* **Eventos Críticos**: Falhas físicas forçam roteamento dinâmico pelo jogador enquanto um hub fica 'morto'.`n* **Frota Técnica**: Despacho de equipes, com atraso referenciado pela distância física entre o Centro de Operações e o Hub danificado.`n* **Consumo Energético Activo**: Custo base `OPEX` varia baseado na eficiência da tecnologia ativa (Tubos de vácuo vs Transistores)."
    }
)

foreach ($issue in $issues) {
    gh issue create --title $issue.title --body $issue.body
}
