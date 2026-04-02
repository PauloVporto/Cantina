# Publicacao e backend

## Rodar localmente

1. No PowerShell, entre em `C:\Users\user\Documents\Playground`
2. Rode `npm start`
3. Abra `http://localhost:3000`

## Testar no celular na mesma rede

1. Descubra o IP local do computador
2. Rode o servidor com `npm start`
3. No celular, abra `http://SEU-IP-LOCAL:3000`

## Publicar para gerar link publico

### Vercel

1. Suba a pasta para um repositorio GitHub
2. Importe o projeto na Vercel
3. Configure as variaveis de ambiente do arquivo `.env.example`
4. Publique e use a URL gerada

### Railway ou Render

1. Suba a pasta para GitHub
2. Crie um novo Web Service apontando para este projeto
3. Use `node server.js` como start command
4. Configure porta, dominio publico e variaveis de ambiente

## Integracoes reais

- `Google`: preencha `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
- `Apple`: preencha `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID` e `APPLE_PRIVATE_KEY`
- `Mercado Pago`: preencha `MERCADO_PAGO_ACCESS_TOKEN`
- `PUBLIC_BASE_URL`: defina a URL publica do deploy para callbacks e webhooks

## Fluxos preparados

- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`
- `GET /api/auth/apple/start`
- `GET /api/auth/apple/callback`
- `POST /api/webhooks/mercadopago`

## Observacao importante

Google, Apple e webhook automatico de pagamento so funcionam de verdade quando o app estiver publicado em uma URL publica HTTPS.
