Cantina Online – README Oficial

Sistema completo de cantina digital, com:

🛒 Catálogo de produtos

📱 Pedidos online (Pix e Cartão simulados)

👤 Login e Registro

👨‍🍳 Painel do Admin (gerenciamento de pedidos)

🗄 Backend (Node + Express + Prisma + Supabase)

🎨 Frontend (React + Vite + Tailwind)

🚀 1. Pré-requisitos

Antes de rodar:

✔ Node.js 18+

https://nodejs.org/

✔ NPM (vem junto com Node)
✔ Conta no Supabase

https://supabase.com/

📦 2. Estrutura do Projeto
cantina-online/
 ├── cantina-online-backend/
 └── cantina-online-frontend/


Você baixa os dois zips, descompacta e deixa exatamente assim.

🍳 3. Configuração do BACKEND (API)
📍 Acesse a pasta:
cd cantina-online-backend

🔧 3.1 Instale as dependências
npm install

🗄 3.2 Configure o banco no Supabase

Entre no Supabase

Crie um novo projeto

Vá em Project Settings → Database → Connection String

Copie a URL no formato:

postgresql://postgres:SENHA@HOST.supabase.co:5432/postgres

📝 3.3 Criar o arquivo .env

Crie um arquivo chamado .env dentro da pasta backend:

DATABASE_URL="cole_aqui_sua_string_do_supabase"
JWT_SECRET="uma-chave-super-secreta"
PORT=3000

🧩 3.4 Aplicar o schema no banco
npx prisma migrate deploy

🌱 3.5 Rodar o seed (cria admin e produtos)
node prisma/seed.js


Se tudo der certo, você verá:

Admin criado: admin@cantina.com / admin123
Produto criado: Coxinha...
...

▶ 3.6 Iniciar o servidor
npm start


Agora a API está rodando em:

👉 http://localhost:3000

🎨 4. Configuração do FRONTEND (React)
📍 Entre na pasta:
cd cantina-online-frontend

🔧 4.1 Instalar dependências
npm install

🔗 4.2 Certifique-se que o frontend aponta para o backend

As requisições usam:

http://localhost:3000


Se quiser mudar depois (para deploy), pode alterar nas chamadas axios.

▶ 4.3 Rodar o frontend
npm run dev


Acesse:

👉 http://localhost:5173

🔐 5. Login padrão

O seed cria um admin automaticamente:

Tipo	Email	Senha
Admin	admin@cantina.com
	admin123

Usuários normais podem se registrar na tela de cadastro.

🧪 6. Telas disponíveis
Rota	Usuário	Descrição
/	todos	Login
/register	todos	Criar conta
/catalogo	user	Ver produtos e fazer pedido
/meus-pedidos	user	Acompanhar pedidos
/admin	admin	Gerenciar pedidos da cantina
🌐 7. Deploy (OPCIONAL)
Backend → Railway, Render ou Docker

Basta adicionar as variáveis DATABASE_URL e JWT_SECRET.

Frontend → Vercel

Defina a variável de ambiente:

VITE_API_URL=https://seu-backend.up.railway.app

❗ Problemas comuns
❌ Erro: "DATABASE_URL not provided"

✔ Verifique se .env está criado corretamente
✔ Reinicie o backend

❌ Erro ao rodar seed

✔ Veja se o Prisma conectou ao Supabase
✔ Verifique a senha/token do banco

❌ Frontend não loga

✔ Confirme se o backend está rodando em http://localhost:3000
✔ Verifique se o TOKEN está sendo salvo no localStorage