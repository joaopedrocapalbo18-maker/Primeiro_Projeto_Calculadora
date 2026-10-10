# 🧮 Calculadora Web

Calculadora responsiva feita com **HTML, CSS e JavaScript puros**, sem frameworks nem bibliotecas.

🔗 **Demo:** `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

## Funcionalidades

- Soma (`+`), subtração (`−`), multiplicação (`×`), divisão/quociente (`÷`) e potenciação (`xʸ`)
- Operações encadeadas (ex.: `2 + 3 × 4` resolve da esquerda para a direita, como em calculadoras de bolso)
- Painel de histórico: clique em um resultado antigo para reutilizá-lo
- Botões de limpar (`C`), apagar (`⌫`) e inverter sinal (`±`)
- Suporte ao teclado
- Layout responsivo (painel ao lado no desktop, abaixo no celular)
- Tema claro/escuro automático conforme o sistema
- Tratamento de erro (divisão por zero e resultados inválidos)

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| `0-9`, `.` ou `,` | Digitar números |
| `+` `-` `*` `/` `^` | Operadores |
| `Enter` ou `=` | Calcular |
| `Backspace` | Apagar último dígito |
| `Esc` ou `C` | Limpar |

## Estrutura

```
├── index.html   # estrutura da página
├── style.css    # estilos e responsividade
├── script.js    # lógica da calculadora
└── README.md
```

## Como executar localmente

Baixe o projeto e abra o `index.html` no navegador. Não há nada para instalar.

## Publicação no GitHub Pages

1. Envie os arquivos para um repositório público.
2. Vá em **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`.
4. Salve e aguarde cerca de um minuto; o link aparece no topo da página.

## Observação

Os cálculos usam ponto flutuante do JavaScript. Os resultados são arredondados para 12 dígitos significativos para evitar problemas como `0,1 + 0,2 = 0,30000000000000004`.

## Autoria

README gerado com auxílio de IA (Claude, da Anthropic) e revisado pelo autor.

## Licença

Uso livre. Adicione a licença de sua preferência (por exemplo, MIT).
