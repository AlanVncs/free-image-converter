# Free Image Converter

Conversor de imagens gratuito que roda inteiramente no navegador. Nenhum arquivo é enviado a servidores.

## Formatos suportados

- **Saída (conversão):** PNG, JPG, WEBP, AVIF, GIF, BMP e ICO
- **Entrada:** PNG, JPG, WEBP, AVIF, GIF, BMP, ICO, SVG e HEIC

GIFs animados usam apenas o primeiro frame na conversão. ICO redimensiona automaticamente para no máximo 256px. HEIC usa decodificação nativa do navegador ou `heic2any` quando necessário.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Como funciona

1. Selecione o formato de destino no topo da página.
2. Carregue uma ou mais imagens (arrastar e soltar ou clique).
3. Clique em **Converter** — a conversão usa a Canvas API do navegador.
4. Baixe os arquivos individualmente ou todos de uma vez em um ZIP.

## Requisitos do navegador

- Suporte a `createImageBitmap` e `canvas.toBlob`
- Conversão para AVIF requer um navegador recente (Chrome 85+, Firefox 93+, Safari 16+)
