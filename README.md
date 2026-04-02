# Cantina Express

Base limpa para publicar na `Vercel` ou `Railway`.

## O projeto

- frontend em `index.html`, `styles.css` e `script.js`
- backend Node em `server.js`
- dados locais em `data/app-data.json`
- configuracoes de deploy em `vercel.json`, `Dockerfile` e `.env.example`

## Rodar localmente

```powershell
cd C:\Users\user\Documents\Playground
npm start
```

Abra `http://localhost:3000`.

## Credenciais iniciais

- admin: `admin@cantina.com` / `123456`
- funcionaria: `funcionaria@cantina.com` / `123456`

## Publicar na Vercel

1. Suba o projeto para GitHub.
2. Importe o repositório na Vercel.
3. Configure as variáveis de ambiente de `.env.example`.
4. Faça o deploy.

## Publicar na Railway

1. Suba o projeto para GitHub.
2. Crie um novo projeto na Railway.
3. Aponte para este repositório.
4. Configure as variáveis de ambiente de `.env.example`.
5. Publique.

## Importante

- `Google`, `Apple` e `Mercado Pago` só funcionam de verdade com credenciais reais.
- confirmação automática de pagamento precisa de URL pública HTTPS.
- em Vercel, o arquivo `data/app-data.json` não é um banco persistente de produção; para produção real, o próximo passo é trocar isso por um banco.
