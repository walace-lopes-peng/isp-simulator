// NOTA: Em ambientes Windows onde o caminho da pasta do projeto contém espaços (ex: "ISP Game"),
// a resolução de sub-paths como '@testing-library/jest-dom/vitest' falha no Vite/Vitest devido
// à discrepância entre caminhos codificados (%20) e decodificados (" ").
// Importar o pacote raiz '@testing-library/jest-dom' estende o matchers do expect globalmente sem depender da resolução de sub-path mjs.
import '@testing-library/jest-dom';

